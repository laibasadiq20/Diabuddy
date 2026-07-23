const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    type: {
      type: String,
      enum: [
        'post_like',
        'comment_like',
        'comment_reply',
        'new_comment',
        'new_message',
        'mention',
        'best_answer_selected',
        'new_report',
        'moderation_notice',
      ],
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  recipientId: 1,
  isRead: 1,
});

module.exports = mongoose.model('Notification', notificationSchema);