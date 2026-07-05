const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    reportType: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      required: [true, 'Report type is required'],
    },
    periodStart: {
      type: Date,
      required: [true, 'Period start date is required'],
    },
    periodEnd: {
      type: Date,
      required: [true, 'Period end date is required'],
    },
    summary: {
      avgGlucose: { type: Number, default: 0 },
      timeInRangePercent: { type: Number, default: 0, min: 0, max: 100 },
      totalInsulinUnits: { type: Number, default: 0 },
      totalCaloriesConsumed: { type: Number, default: 0 },
      totalCaloriesBurned: { type: Number, default: 0 },
      exerciseMinutes: { type: Number, default: 0 },
    },
    insights: {
      type: [
        {
          type: {
            type: String,
            enum: ['Warning', 'Suggestion', 'Achievement'],
          },
          message: { type: String },
        },
      ],
      default: [],
      // e.g., [{ type: "Warning", message: "Fasting glucose averaged above target this week" }]
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fetching user reports by type and period
reportSchema.index({ userId: 1, reportType: 1, periodStart: -1 });

// Prevent duplicate reports for the same user, type, and period
reportSchema.index(
  { userId: 1, reportType: 1, periodStart: 1, periodEnd: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'HealthReport',
  reportSchema
);