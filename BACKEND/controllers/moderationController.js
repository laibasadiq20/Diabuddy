const CommunityReport = require('../models/CommunityReports');
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { notifyAdmins } = require('../utils/notify');
const { hideAuthorContent } = require('../utils/moderationHelpers');

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

    const postId =
      targetType === 'ForumPost'
        ? target._id
        : target.postId || null;

    const report = await CommunityReport.create({
      reporterId: req.user.id,
      targetType,
      targetId,
      postId,
      reason,
      description,
    });

    const reporterName = req.user.name || req.user.username || 'A member';
    const targetLabel = targetType === 'ForumPost' ? 'post' : 'comment';
    const reasonLabel = String(reason || 'other').replace(/_/g, ' ');

    await notifyAdmins({
      senderId: req.user.id,
      type: 'new_report',
      referenceId: report._id,
      message: `${reporterName} reported a ${targetLabel} for ${reasonLabel}`,
    });

    // Keep content visible until a moderator reviews the report
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: 'Failed to file report', error: err.message });
  }
};

// GET /api/admin/reports?status=pending|history|reviewed|...
exports.getReportQueue = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    let query = {};
    if (status === 'history') {
      query = { status: { $in: ['reviewed', 'resolved', 'dismissed'] } };
    } else if (status && status !== 'all') {
      query = { status };
    }

    const reports = await CommunityReport.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('reporterId', 'name username')
      .populate('resolvedBy', 'name username');

    const enriched = await Promise.all(
      reports.map(async (report) => {
        const obj = report.toObject();
        if (obj.targetType === 'ForumPost') {
          obj.viewPostId = obj.targetId;
        } else if (obj.postId) {
          obj.viewPostId = obj.postId;
        } else {
          const comment = await Comment.findById(obj.targetId).select('postId').lean();
          obj.viewPostId = comment?.postId || null;
        }
        return obj;
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch report queue', error: err.message });
  }
};

// PUT /api/admin/reports/:id   body: { status, action? }
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
      if (action === 'dismiss') target.status = 'active';
      if (target.isModified()) await target.save();

      if (action === 'ban_user' && target.authorId) {
        await User.findByIdAndUpdate(target.authorId, { isActive: false });
        await hideAuthorContent(target.authorId);
      }
    }

    report.status = status || 'reviewed';
    if (action) report.actionTaken = action;
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    await report.save();

    const populated = await CommunityReport.findById(report._id)
      .populate('reporterId', 'name username')
      .populate('resolvedBy', 'name username');

    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to resolve report', error: err.message });
  }
};
