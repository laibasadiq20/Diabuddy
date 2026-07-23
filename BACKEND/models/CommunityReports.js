const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    targetType: {
      type: String,
      enum: ['ForumPost', 'Comment'],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    /** Parent post id — always set for comment reports so admins can deep-link */
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      default: null,
    },

    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'misinformation',
        'offensive',
        'other',
      ],
      required: true,
    },

    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },

    actionTaken: {
      type: String,
      enum: ['dismiss', 'hide_content', 'delete_content', 'ban_user'],
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CommunityReport', reportSchema);
