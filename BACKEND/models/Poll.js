const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true,
      unique: true,
      index: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Poll question cannot exceed 200 characters'],
    },

    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, 'Option text cannot exceed 100 characters'],
        },
        votesCount: {
          type: Number,
          default: 0,
        },
      },
    ],

    totalVotes: {
      type: Number,
      default: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
      // drives the "Vote — closes in 2 days" label
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Poll', pollSchema);