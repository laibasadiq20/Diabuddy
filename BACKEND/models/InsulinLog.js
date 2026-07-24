const mongoose = require('mongoose');

const insulinLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    units: {
      type: Number,
      required: [true, 'Insulin units is required'],
      min: [0.1, 'Insulin units must be at least 0.1'],
    },
    insulinType: {
      type: String,
      required: [true, 'Insulin type is required'],
      trim: true,
      // Examples: NovoRapid, Humalog, Lantus, Levemir, Tresiba
    },
    injectionSite: {
      type: String,
      enum: ['Abdomen', 'Arm', 'Thigh', 'Buttocks'],
      required: [true, 'Injection site is required'],
    },
    mealRelation: {
      type: String,
      enum: ['Before Meal', 'After Meal', 'None'],
      default: 'None',
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
    relatedGlucoseLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GlucoseLog',
      default: null,
    },
    relatedMealLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealLog',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific queries
insulinLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('InsulinLog', insulinLogSchema);
