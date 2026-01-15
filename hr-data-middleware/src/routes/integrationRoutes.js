const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/fileUpload');
const { uploadCSV } = require('../controllers/uploadController');
const { getStats, getAuditLog } = require('../controllers/statsController');

/**
 * Integration Routes - API Endpoints
 * Defines POST /upload and GET /stats
 */

// ==================== CSV UPLOAD ENDPOINT ====================
/**
 * POST /api/upload
 * Upload and process CSV file
 * Body: multipart/form-data with "file" field
 */
router.post('/upload', upload.single('file'), handleMulterError, uploadCSV);

// ==================== STATISTICS ENDPOINTS ====================
/**
 * GET /api/stats
 * Get success/failure metrics
 * Query: ?batchId=uuid (optional)
 */
router.get('/stats', getStats);

/**
 * GET /api/audit/:batchId
 * Get detailed audit log for a specific batch
 */
router.get('/audit/:batchId', getAuditLog);

// ==================== HEALTH CHECK ====================
/**
 * GET /api/health
 * Simple health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
