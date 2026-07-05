const Poll = require('../models/Poll');
const PollVote = require('../models/PollVote');
const ForumPost = require('../models/ForumPost');

// POST /api/posts/:postId/poll   body: { question, options: [String], expiresAt }
// Called right after creating a post with type: 'poll'
exports.createPoll = async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;
    const post = await ForumPost.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to attach a poll to this post' });
    }
    if (post.type !== 'poll') {
      return res.status(400).json({ message: 'Post type must be "poll"' });
    }
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'A poll needs at least 2 options' });
    }

    const existing = await Poll.findOne({ postId: post._id });
    if (existing) {
      return res.status(409).json({ message: 'This post already has a poll' });
    }

    const poll = await Poll.create({
      postId: post._id,
      question,
      options: options.map((text) => ({ text, votesCount: 0 })),
      expiresAt,
    });

    res.status(201).json(poll);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create poll', error: err.message });
  }
};

// GET /api/posts/:postId/poll
exports.getPollByPost = async (req, res) => {
  try {
    const poll = await Poll.findOne({ postId: req.params.postId });
    if (!poll) return res.status(404).json({ message: 'No poll on this post' });

    // attach the current user's vote (if any) so the frontend can lock/highlight
    const myVote = await PollVote.findOne({ pollId: poll._id, userId: req.user.id });

    res.json({ poll, myOptionIndex: myVote ? myVote.optionIndex : null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch poll', error: err.message });
  }
};

// POST /api/polls/:pollId/vote   body: { optionIndex }
exports.vote = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      return res.status(403).json({ message: 'This poll has closed' });
    }
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    const existing = await PollVote.findOne({ pollId: poll._id, userId: req.user.id });

    if (existing) {
      if (existing.optionIndex === optionIndex) {
        return res.status(409).json({ message: 'You already voted for this option' });
      }
      // changing vote: shift the count from the old option to the new one
      poll.options[existing.optionIndex].votesCount = Math.max(0, poll.options[existing.optionIndex].votesCount - 1);
      poll.options[optionIndex].votesCount += 1;
      existing.optionIndex = optionIndex;
      await existing.save();
    } else {
      await PollVote.create({ pollId: poll._id, userId: req.user.id, optionIndex });
      poll.options[optionIndex].votesCount += 1;
      poll.totalVotes += 1;
    }

    await poll.save();
    res.json({ poll, myOptionIndex: optionIndex });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Vote already recorded, retry' });
    }
    res.status(400).json({ message: 'Failed to vote', error: err.message });
  }
};