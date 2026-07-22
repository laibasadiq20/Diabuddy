const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
const Comment = require('../models/Comment');
const CommunityReport = require('../models/CommunityReports');

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
      verifiedPros,
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
      User.countDocuments({ isVerifiedProfessional: true }),
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
        users: { total: totalUsers, active: activeUsers, banned: bannedUsers, admins, verifiedPros },
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
          'name username email role isActive isVerified isVerifiedProfessional postsCount commentsCount createdAt lastSeen diabetesType'
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
 * @desc    Update user (ban/unban, verify pro, role)
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

    const { isActive, isVerifiedProfessional, role } = req.body;

    if (typeof isActive === 'boolean') target.isActive = isActive;
    if (typeof isVerifiedProfessional === 'boolean') {
      target.isVerifiedProfessional = isVerifiedProfessional;
    }
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

    await target.save();

    const u = target.toObject();
    delete u.passwordHash;
    res.json({ status: 'success', message: 'User updated', data: u });
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
        { status: 'deleted', title: '[removed]', body: '[This content was removed by a moderator.]' }
      );
      await Comment.updateMany(
        { authorId: id },
        { status: 'deleted', body: '[removed by moderator]' }
      );
      await CommunityReport.deleteMany({
        $or: [{ reporterId: id }],
      });
      await User.findByIdAndDelete(id);
      return res.json({ status: 'success', message: 'User permanently deleted and content scrubbed' });
    }

    target.isActive = false;
    await target.save();
    await ForumPost.updateMany({ authorId: id, status: 'active' }, { status: 'hidden' });

    res.json({ status: 'success', message: 'User banned and their active posts hidden' });
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
