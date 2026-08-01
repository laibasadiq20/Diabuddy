const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');
const CommunityReport = require('../models/CommunityReports');
const { hideAuthorContent } = require('../utils/moderationHelpers');
const { notify } = require('../utils/notify');

/**
 * @desc    Platform overview stats for admin dashboard
 * @route   GET /api/admin/stats
 */
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      admins,
      totalPosts,
      hiddenPosts,
      totalComments,
      pendingReports,
      reviewedReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ role: 'admin' }),
      ForumPost.countDocuments({ status: { $ne: 'deleted' } }),
      ForumPost.countDocuments({ status: 'hidden' }),
      Comment.countDocuments({ status: { $ne: 'deleted' } }),
      CommunityReport.countDocuments({ status: 'pending' }),
      CommunityReport.countDocuments({ status: 'reviewed' }),
    ]);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name username email role isActive createdAt');

    res.json({
      status: 'success',
      data: {
        users: { total: totalUsers, active: activeUsers, banned: bannedUsers, admins },
        content: { posts: totalPosts, hiddenPosts, comments: totalComments },
        reports: { pending: pendingReports, reviewed: reviewedReports },
        recentUsers,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to load admin stats' });
  }
};

/**
 * @desc    List / search all users
 * @route   GET /api/admin/users
 */
exports.listUsers = async (req, res) => {
  try {
    const { search = '', role, status, page = 1, limit = 25 } = req.query;
    const query = {};

    if (search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    if (role === 'admin' || role === 'patient') query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'banned') query.isActive = false;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * lim;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .select(
          'name username email role isActive isVerified postsCount commentsCount createdAt diabetesType mutedUntil warnings'
        ),
      User.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: {
        users,
        pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) },
      },
    });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to list users' });
  }
};

/**
 * @desc    Update user (ban/unban, role, mute/warn)
 * @route   PUT /api/admin/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(id) === String(req.user.id)) {
      return res.status(400).json({ status: 'error', message: 'You cannot modify your own admin account this way' });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const {
      isActive,
      role,
      warnMessage,
      muteHours,
      unmute,
    } = req.body;
    const wasActive = target.isActive;
    let noticeMessage = null;

    if (typeof isActive === 'boolean') target.isActive = isActive;
    if (role === 'admin' || role === 'patient') {
      // Prevent demoting the last admin
      if (target.role === 'admin' && role === 'patient') {
        const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
        if (adminCount <= 1) {
          return res.status(400).json({
            status: 'error',
            message: 'Cannot demote the last active admin',
          });
        }
      }
      target.role = role;
    }

    // Official warning (does not ban or mute)
    if (typeof warnMessage === 'string' && warnMessage.trim()) {
      const message = warnMessage.trim().slice(0, 500);
      if (!Array.isArray(target.warnings)) target.warnings = [];
      target.warnings.push({
        message,
        createdBy: req.user.id,
        createdAt: new Date(),
      });
      noticeMessage = `Community warning: ${message}`;
    }

    // Temp mute — hours from now (e.g. 24, 168). Clear with unmute: true
    if (unmute === true) {
      target.mutedUntil = null;
      noticeMessage = 'Your temporary mute has been lifted. You can post and message again.';
    } else if (muteHours !== undefined && muteHours !== null && muteHours !== '') {
      const hours = Number(muteHours);
      if (!Number.isFinite(hours) || hours <= 0 || hours > 24 * 90) {
        return res.status(400).json({
          status: 'error',
          message: 'muteHours must be a positive number up to 90 days',
        });
      }
      const until = new Date(Date.now() + hours * 60 * 60 * 1000);
      target.mutedUntil = until;
      noticeMessage = `You have been temporarily muted until ${until.toLocaleString()}. You can browse but cannot post, comment, or send messages.`;
    }

    await target.save();

    // Ban always hides the author's visible content
    if (wasActive && target.isActive === false) {
      await hideAuthorContent(target._id);
    }

    if (noticeMessage && target.role !== 'admin') {
      await notify({
        recipientId: target._id,
        senderId: req.user.id,
        type: 'moderation_notice',
        message: noticeMessage,
      });
    }

    res.json({ status: 'success', message: 'User updated', data: target.toJSON() });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
};

/**
 * @desc    Soft-delete (ban) or hard-delete a user and scrub their content
 * @route   DELETE /api/admin/users/:id
 * query: ?hard=true for permanent delete
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (String(id) === String(req.user.id)) {
      return res.status(400).json({ status: 'error', message: 'You cannot delete your own account from admin' });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    if (target.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot remove the last active admin',
        });
      }
    }

    const hard = String(req.query.hard || '').toLowerCase() === 'true';

    if (hard) {
      await ForumPost.updateMany(
        { authorId: id },
        { status: 'deleted', title: '[removed]', content: '[This content was removed by a moderator.]' }
      );
      await Comment.updateMany(
        { authorId: id },
        { status: 'deleted', content: '[removed by moderator]' }
      );
      await CommunityReport.deleteMany({
        $or: [{ reporterId: id }],
      });
      await User.findByIdAndDelete(id);
      return res.json({ status: 'success', message: 'User permanently deleted and content scrubbed' });
    }

    target.isActive = false;
    await target.save();
    await hideAuthorContent(id);

    res.json({ status: 'success', message: 'User banned and their content hidden' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete user' });
  }
};

/**
 * @desc    Hide or restore a post from admin tools
 * @route   PUT /api/admin/posts/:id
 */
exports.moderatePost = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'hidden', 'deleted'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!post) return res.status(404).json({ status: 'error', message: 'Post not found' });
    res.json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to moderate post' });
  }
};

/**
 * @desc    Hide or restore a comment from admin tools
 * @route   PUT /api/admin/comments/:id
 */
exports.moderateComment = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'hidden', 'deleted'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('authorId', 'name username profileImageUrl');
    if (!comment) return res.status(404).json({ status: 'error', message: 'Comment not found' });
    res.json({ status: 'success', data: comment });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to moderate comment' });
  }
};
