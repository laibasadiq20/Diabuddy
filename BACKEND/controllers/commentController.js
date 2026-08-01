const Comment = require('../models/Comment');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const { notify } = require('../utils/notify');

// GET /api/posts/:postId/comments
exports.getComments = async (req, res) => {
  try {
    const filter = { postId: req.params.postId };
    // Admins also see hidden comments so they can restore them
    if (req.user?.role === 'admin') {
      filter.status = { $in: ['active', 'hidden'] };
    } else {
      filter.status = 'active';
    }

    const comments = await Comment.find(filter)
      .sort({ createdAt: 1 })
      .populate('authorId', 'name username profileImageUrl');

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
};

// POST /api/posts/:postId/comments   body: { content, parentCommentId? }
exports.createComment = async (req, res) => {
  try {
    const { muteBlockPayload } = require('../utils/moderationHelpers');
    const muted = muteBlockPayload(req.user);
    if (muted) return res.status(muted.statusCode).json(muted.body);

    const { content, parentCommentId } = req.body;
    const post = await ForumPost.findById(req.params.postId);

    if (!post || post.status === 'deleted' || post.status === 'hidden') {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.isLocked) {
      return res.status(403).json({ message: 'This thread is locked' });
    }

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (!parent || parent.postId.toString() !== post._id.toString()) {
        return res.status(400).json({ message: 'Invalid parent comment' });
      }
    }

    const comment = await Comment.create({
      postId: post._id,
      authorId: req.user.id,
      content,
      parentCommentId: parentCommentId || null,
    });

    post.commentsCount += 1;
    await post.save();
    await User.findByIdAndUpdate(req.user.id, { $inc: { commentsCount: 1 } });

    const senderName = req.user.name || 'Someone';

    if (parentCommentId) {
      const parent = await Comment.findById(parentCommentId);
      if (parent) {
        await notify({
          recipientId: parent.authorId,
          senderId: req.user.id,
          type: 'comment_reply',
          referenceId: post._id,
          message: `${senderName} replied to your comment on “${post.title}”`,
        });
      }
    } else {
      await notify({
        recipientId: post.authorId,
        senderId: req.user.id,
        type: 'new_comment',
        referenceId: post._id,
        message: `${senderName} commented on “${post.title}”`,
      });
    }

    const populated = await comment.populate('authorId', 'name username profileImageUrl');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create comment', error: err.message });
  }
};

// PUT /api/comments/:id
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.status !== 'active') {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();

    const populated = await comment.populate('authorId', 'name username profileImageUrl');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update comment', error: err.message });
  }
};

// DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.authorId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.status = 'deleted';
    await comment.save();

    await ForumPost.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });
    await User.findByIdAndUpdate(comment.authorId, { $inc: { commentsCount: -1 } });

    const post = await ForumPost.findById(comment.postId);
    if (post && post.bestAnswerCommentId && post.bestAnswerCommentId.toString() === comment._id.toString()) {
      post.bestAnswerCommentId = null;
      await post.save();
    }

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
};
