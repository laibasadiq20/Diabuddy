const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Topic name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Topic name cannot exceed 50 characters'],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },

    icon: {
      type: String,
      default: 'MessageCircle',
    },

    color: {
      type: String,
      default: '#22C55E',
    },

    postsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Topic', topicSchema);