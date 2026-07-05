const CommunityReport = require('../models/CommunityReports');
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');
const User = require('../models/User');

const getModel = (targetType) => (targetType === 'ForumPost' ? ForumPost : Comment);

// POST /api/reports   body: { targetType, targetId, reason, description? }
exports.fileReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    if (!['ForumPost', 'Comment'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    const Model = getModel(targetType);
    const target = await Model.findById(targetId);
    if (!target) return res.status(404).json({ message: 'Target not found' });

    const report = await CommunityReport.create({
      reporterId: req.user.id,
      targetType,
      targetId,
      reason,
      description,
    });

    // flag the target so it surfaces for moderators even before manual review
    target.status = 'reported';
    await target.save();

    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: 'Failed to file report', error: err.message });
  }
};

// GET /api/admin/reports?status=pending   (admin only)
exports.getReportQueue = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const reports = await CommunityReport.find({ status })
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name username');

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report queue', error: err.message });
  }
};

// PUT /api/admin/reports/:id   (admin only)   body: { status, action? }
// action: 'hide_content' | 'delete_content' | 'ban_user' | 'dismiss'
exports.resolveReport = async (req, res) => {
  try {
    const { status, action } = req.body;
    const report = await CommunityReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const Model = getModel(report.targetType);
    const target = await Model.findById(report.targetId);

    if (action && target) {
      if (action === 'hide_content') target.status = 'hidden';
      if (action === 'delete_content') target.status = 'deleted';
      if (action === 'dismiss') target.status = 'active'; // clears the "reported" flag
      if (target.isModified()) await target.save();

      if (action === 'ban_user' && target.authorId) {
        await User.findByIdAndUpdate(target.authorId, { isActive: false });
      }
    }

    report.status = status || 'reviewed';
    await report.save();

    res.json(report);
  } catch (err) {
    res.status(400).json({ message: 'Failed to resolve report', error: err.message });
  }
};