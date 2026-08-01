const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount in ml is required'],
      min: [1, 'Amount must be at least 1 ml'],
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
    // Set when this water entry was auto-created from a meal's `waterConsumed`
    // field, so it can stay in sync when that meal is edited or deleted.
    relatedMealLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealLog',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

waterLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('WaterLog', waterLogSchema);
