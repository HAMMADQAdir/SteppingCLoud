const mongoose = require('mongoose');

/**
 * AuditLog Schema - For INVALID HR Data
 * The "Audit System" - Tracks validation failures for compliance and debugging
 * Critical for the JD requirement: "Track failed records"
 */
const auditLogSchema = new mongoose.Schema(
  {
    rowNumber: {
      type: Number,
      required: true,
    },
    rawData: {
      type: Object,
      required: true, // Stores the original CSV row data
    },
    validationErrors: [
      {
        field: {
          type: String,
          required: true, // e.g., 'salary', 'email', 'joiningDate'
        },
        message: {
          type: String,
          required: true, // Human-readable error description
        },
        value: {
          type: mongoose.Schema.Types.Mixed, // The invalid value
        },
      },
    ],
    failureReason: {
      type: String,
      required: true,
      enum: [
        'INVALID_SALARY',
        'INVALID_EMAIL',
        'INVALID_DATE',
        'MISSING_REQUIRED_FIELD',
        'DUPLICATE_EMPLOYEE_ID',
        'BUSINESS_RULE_VIOLATION',
      ],
    },
    uploadBatch: {
      type: String, // UUID to group records from same upload
      required: true,
    },
    fileName: {
      type: String, // Original CSV filename
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics and reporting
auditLogSchema.index({ uploadBatch: 1 });
auditLogSchema.index({ failureReason: 1 });
auditLogSchema.index({ processedAt: -1 }); // Most recent first

module.exports = mongoose.model('AuditLog', auditLogSchema);
