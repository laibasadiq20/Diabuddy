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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CommunityReport', reportSchema);