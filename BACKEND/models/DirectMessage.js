const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
      index: true,
    },
    conversationId: {
      type: String,
      required: [true, 'Conversation ID is required'],
      index: true,
      // Deterministic: sorted smaller_id + "_" + larger_id
      // e.g., "6651a1b2c3d4e5f6a7b8c9d0_6651a1b2c3d4e5f6a7b8c9d1"
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [1, 'Message cannot be empty'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching conversation thread (chronological order)
directMessageSchema.index({ conversationId: 1, timestamp: 1 });

// Index for fetching unread messages for a user
directMessageSchema.index({ receiverId: 1, isRead: 1 });

// Static helper to generate a deterministic conversationId
directMessageSchema.statics.buildConversationId = function (userIdA, userIdB) {
  return [userIdA.toString(), userIdB.toString()].sort().join('_');
};

module.exports = mongoose.model('DirectMessage', directMessageSchema);
