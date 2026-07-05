const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    targetType: {
      type: String,
      enum: ['ForumPost', 'Comment'],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

reactionSchema.index(
  {
    userId: 1,
    targetType: 1,
    targetId: 1,
  },
  {
    unique: true,
    name: 'unique_user_reaction',
  }
);

module.exports = mongoose.model('Reaction', reactionSchema);