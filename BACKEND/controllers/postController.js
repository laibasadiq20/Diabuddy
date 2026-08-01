const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');
const Topic = require('../models/Topic');
const User = require('../models/User');
const { notify } = require('../utils/notify');

// GET /api/posts?topic=&sort=&page=&limit=&search=&authorId=
// sort: latest | most_commented | best_answers
exports.getFeed = async (req, res) => {
  try {
    const { topic, sort = 'latest', page = 1, limit = 10, search, authorId } = req.query;

    const query = { status: 'active', isDraft: false };
    if (topic) query.topicId = topic;
    if (search) query.$text = { $search: search };
    if (authorId) {
      query.authorId = authorId;
      query.isAnonymous = false;
    }

    // Pinned posts always float to the top of the feed
    let sortStage = { isPinned: -1, createdAt: -1 };
    if (sort === 'most_commented') sortStage = { isPinned: -1, commentsCount: -1, createdAt: -1 };
    if (sort === 'best_answers') {
      query.bestAnswerCommentId = { $ne: null };
      sortStage = { isPinned: -1, createdAt: -1 };
    }

    const posts = await ForumPost.find(query)
      .sort(sortStage)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('authorId', 'name username profileImageUrl diabetesType diagnosisYear')
      .populate('topicId', 'name color icon');

    const total = await ForumPost.countDocuments(query);

    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feed', error: err.message });
  }
};

// GET /api/posts/mine/drafts
exports.getMyDrafts = async (req, res) => {
  try {
    const drafts = await ForumPost.find({
      authorId: req.user.id,
      isDraft: true,
      status: { $ne: 'deleted' },
    })
      .sort({ updatedAt: -1 })
      .populate('topicId', 'name color icon');

    res.json({ drafts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drafts', error: err.message });
  }
};

// GET /api/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('authorId', 'name username profileImageUrl diabetesType diagnosisYear')
      .populate('topicId', 'name color icon');

    if (!post || post.status === 'deleted') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Drafts are only visible to the author
    if (post.isDraft) {
      const authorId = post.authorId?._id || post.authorId;
      if (!req.user || String(authorId) !== String(req.user.id)) {
        return res.status(404).json({ message: 'Post not found' });
      }
    }

    // Hidden posts: author + admin can still open
    if (post.status === 'hidden') {
      const authorId = post.authorId?._id || post.authorId;
      const isOwner = req.user && String(authorId) === String(req.user.id);
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ message: 'Post not found' });
      }
    }

    if (!post.isDraft) {
      post.viewsCount += 1;
      await post.save();
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post', error: err.message });
  }
};

// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { muteBlockPayload } = require('../utils/moderationHelpers');
    const muted = muteBlockPayload(req.user);
    if (muted) return res.status(muted.statusCode).json(muted.body);

    const { topicId, title, content, tags, images, isAnonymous, type, isDraft } = req.body;

    const post = await ForumPost.create({
      authorId: req.user.id,
      topicId,
      title,
      content,
      tags,
      images,
      isAnonymous,
      type: type || 'text',
      isDraft: !!isDraft,
    });

    if (!post.isDraft) {
      await Topic.findByIdAndUpdate(topicId, { $inc: { postsCount: 1 } });
      await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: 1 } });
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create post', error: err.message });
  }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    const wasDraft = post.isDraft;
    const { title, content, tags, images, isDraft } = req.body;

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (tags !== undefined) post.tags = tags;
    if (images !== undefined) post.images = images;
    if (isDraft !== undefined) post.isDraft = isDraft;

    await post.save();

    if (wasDraft && post.isDraft === false) {
      await Topic.findByIdAndUpdate(post.topicId, { $inc: { postsCount: 1 } });
      await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: 1 } });
    }

    res.json(post);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update post', error: err.message });
  }
};

// PATCH /api/posts/:id/moderation  body: { isPinned?, isLocked? }  (admin)
exports.moderatePost = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { isPinned, isLocked } = req.body;
    if (typeof isPinned === 'boolean') post.isPinned = isPinned;
    if (typeof isLocked === 'boolean') post.isLocked = isLocked;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update moderation flags', error: err.message });
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.authorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    post.status = 'deleted';
    await post.save();

    if (!post.isDraft) {
      await Topic.findByIdAndUpdate(post.topicId, { $inc: { postsCount: -1 } });
      await User.findByIdAndUpdate(post.authorId, { $inc: { postsCount: -1 } });
    }

    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post', error: err.message });
  }
};

// POST /api/posts/:id/best-answer   body: { commentId }
exports.setBestAnswer = async (req, res) => {
  try {
    const { commentId } = req.body;
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the post author can select a best answer' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.postId.toString() !== post._id.toString()) {
      return res.status(404).json({ message: 'Comment not found on this post' });
    }

    if (post.bestAnswerCommentId) {
      await Comment.findByIdAndUpdate(post.bestAnswerCommentId, { isBestAnswer: false });
    }

    post.bestAnswerCommentId = comment._id;
    comment.isBestAnswer = true;
    await post.save();
    await comment.save();

    await notify({
      recipientId: comment.authorId,
      senderId: req.user.id,
      type: 'best_answer_selected',
      referenceId: post._id,
      message: `Your comment was marked as the best answer on “${post.title}”`,
    });

    res.json({ message: 'Best answer set', bestAnswerCommentId: comment._id });
  } catch (err) {
    res.status(400).json({ message: 'Failed to set best answer', error: err.message });
  }
};
