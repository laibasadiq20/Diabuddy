const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    content: {
      type: String,
      required: true,
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    type: {
      type: String,
      enum: ['text', 'image', 'poll'],
      default: 'text',
      // 'poll' type expects a corresponding Poll document with postId = this _id
    },

    isDraft: {
      type: Boolean,
      default: false,
      // "Save draft" button in the composer — drafts are excluded from feed queries
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },

    bestAnswerCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      // set when the author (or a mod) marks a comment as the best answer
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    viewsCount: {
      type: Number,
      default: 0,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isLocked: {
      type: Boolean,
      default: false,
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

forumPostSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
});

forumPostSchema.index({
  topicId: 1,
  createdAt: -1,
});

forumPostSchema.index({
  authorId: 1,
  isDraft: 1,
});

module.exports = mongoose.model('ForumPost', forumPostSchema);