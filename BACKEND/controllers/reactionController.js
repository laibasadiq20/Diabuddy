const Reaction = require('../models/Reaction');
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');
const User = require('../models/User');

const getModel = (targetType) => (targetType === 'ForumPost' ? ForumPost : Comment);

// POST /api/reactions   body: { targetType: 'ForumPost' | 'Comment', targetId }
// Toggle: if the user already liked it, this unlikes it. Otherwise, likes it.
exports.toggleLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.body;

    if (!['ForumPost', 'Comment'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    const Model = getModel(targetType);
    const target = await Model.findById(targetId);
    if (!target) return res.status(404).json({ message: 'Target not found' });

    const existing = await Reaction.findOne({ userId: req.user.id, targetType, targetId });

    if (existing) {
      await existing.deleteOne();
      target.likesCount = Math.max(0, target.likesCount - 1);
      await target.save();
      await User.findByIdAndUpdate(target.authorId, { $inc: { likesReceived: -1 } });
      return res.json({ action: 'unliked', likesCount: target.likesCount });
    }

    await Reaction.create({ userId: req.user.id, targetType, targetId });
    target.likesCount += 1;
    await target.save();
    await User.findByIdAndUpdate(target.authorId, { $inc: { likesReceived: 1 } });
    res.json({ action: 'liked', likesCount: target.likesCount });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Reaction already exists, retry' });
    }
    res.status(400).json({ message: 'Failed to toggle like', error: err.message });
  }
};

// GET /api/reactions/mine?targetType=&targetId=
// lets the frontend know whether to render the like button as active
exports.getMyReaction = async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    const existing = await Reaction.findOne({ userId: req.user.id, targetType, targetId });
    res.json({ liked: !!existing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reaction', error: err.message });
  }
};