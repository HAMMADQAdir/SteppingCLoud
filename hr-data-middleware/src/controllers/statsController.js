const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');

/**
 * Stats Controller - Analytics & Reporting
 * Returns success/failure metrics for uploaded batches
 */
const getStats = async (req, res) => {
  try {
    const { batchId } = req.query;

    // If no batchId, return overall statistics
    if (!batchId) {
      const totalEmployees = await Employee.countDocuments();
      const totalFailures = await AuditLog.countDocuments();

      return res.status(200).json({
        success: true,
        message: 'Overall statistics',
        stats: {
          totalValidRecords: totalEmployees,
          totalInvalidRecords: totalFailures,
          totalProcessed: totalEmployees + totalFailures,
        },
      });
    }

    // Get batch-specific statistics
    const validCount = await Employee.countDocuments({ uploadBatch: batchId });
    const invalidRecords = await AuditLog.find({ uploadBatch: batchId }).select(
      'rowNumber failureReason validationErrors rawData -_id'
    );

    const invalidCount = invalidRecords.length;
    const totalRecords = validCount + invalidCount;

    // Aggregate failure reasons
    const failureReasons = {};
    invalidRecords.forEach((record) => {
      const reason = record.failureReason;
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });

    // Response with detailed breakdown
    res.status(200).json({
      success: true,
      batchId,
      stats: {
        totalRecords,
        successCount: validCount,
        failureCount: invalidCount,
        successRate: totalRecords > 0 ? ((validCount / totalRecords) * 100).toFixed(2) + '%' : '0%',
      },
      failureBreakdown: failureReasons,
      failedRecords: invalidRecords.map((record) => ({
        row: record.rowNumber,
        reason: record.failureReason,
        errors: record.validationErrors,
        data: record.rawData,
      })),
    });
  } catch (error) {
    console.error('❌ Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics',
      details: error.message,
    });
  }
};

/**
 * Get detailed audit log for a specific batch
 */
const getAuditLog = async (req, res) => {
  try {
    const { batchId } = req.params;

    const auditRecords = await AuditLog.find({ uploadBatch: batchId })
      .sort({ rowNumber: 1 })
      .select('-__v');

    if (auditRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No audit records found for this batch',
      });
    }

    res.status(200).json({
      success: true,
      batchId,
      totalFailures: auditRecords.length,
      records: auditRecords,
    });
  } catch (error) {
    console.error('❌ Audit Log Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit log',
      details: error.message,
    });
  }
};

module.exports = { getStats, getAuditLog };
