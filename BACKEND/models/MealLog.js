const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: [true, 'Meal type is required'],
    },
    foodItems: {
      type: String,
      required: [true, 'Food items are required'],
      trim: true,
      maxlength: [500, 'Food items description cannot exceed 500 characters'],
    },
    carbohydrates: {
      type: Number,
      default: 0,
      min: [0, 'Carbohydrates cannot be negative'],
    },
    protein: {
      type: Number,
      default: 0,
      min: [0, 'Protein cannot be negative'],
    },
    fat: {
      type: Number,
      default: 0,
      min: [0, 'Fat cannot be negative'],
    },
    calories: {
      type: Number,
      default: 0,
      min: [0, 'Calories cannot be negative'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    waterConsumed: {
      type: Number,
      default: 0,
      min: [0, 'Water consumed cannot be negative'],
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

// Compound index for user and timestamp queries
mealLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('MealLog', mealLogSchema);
