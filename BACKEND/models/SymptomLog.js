const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    symptoms: {
      type: [String],
      required: [true, 'At least one symptom must be selected'],
      validate: [
        (val) => val.length > 0,
        'At least one symptom must be selected'
      ],
    },
    severity: {
      type: Number,
      required: [true, 'Severity is required'],
      min: [1, 'Severity must be at least 1'],
      max: [10, 'Severity cannot exceed 10'],
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

symptomLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SymptomLog', symptomLogSchema);
