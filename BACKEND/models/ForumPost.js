const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    tags: {
      type: [String],
      default: [],
      // e.g., ['Type1', 'Diet', 'Exercise', 'Insulin', 'Technology']
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for listing posts (newest first), excluding soft-deleted
forumPostSchema.index({ isDeleted: 1, createdAt: -1 });

// Index for tag-based filtering
forumPostSchema.index({ tags: 1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
