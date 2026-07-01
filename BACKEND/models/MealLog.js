const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    mealName: {
      type: String,
      required: [true, 'Meal name is required'],
      trim: true,
      maxlength: [100, 'Meal name cannot exceed 100 characters'],
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: [true, 'Meal type is required'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    nutritionAI: {
      calories: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      confidence: {
        type: Number,
        min: [0, 'Confidence must be between 0 and 1'],
        max: [1, 'Confidence must be between 0 and 1'],
        default: 0,
      },
    },
    isManuallyEdited: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific time-range queries
mealLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('MealLog', mealLogSchema);
