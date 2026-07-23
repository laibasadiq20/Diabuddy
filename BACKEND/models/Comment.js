const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: true,
      index: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: [3000, 'Comment cannot exceed 3000 characters'],
    },

    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },

    isBestAnswer: {
      type: Boolean,
      default: false,
      // mirrors ForumPost.bestAnswerCommentId — keep both in sync in the controller
      // when a best answer is set/unset (one write to Comment, one to ForumPost)
    },

    status: {
      type: String,
      enum: ['active', 'hidden', 'deleted', 'reported'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({
  postId: 1,
  createdAt: 1,
});

module.exports = mongoose.model('Comment', commentSchema);