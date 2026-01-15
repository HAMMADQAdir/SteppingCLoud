const multer = require('multer');

/**
 * Multer Configuration - File Upload Middleware
 * Handles CSV file streams with validation and size limits
 */

// Use memory storage (buffer) instead of disk storage for cloud compatibility
const storage = multer.memoryStorage();

// File filter - Only allow CSV files
const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];
  
  // Check file extension
  const isCSV = file.originalname.toLowerCase().endsWith('.csv');

  if (allowedMimeTypes.includes(file.mimetype) || isCSV) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error('Invalid file type. Only CSV files are allowed.'),
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1, // Only one file at a time
  },
});

// Error handler middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `Maximum file size is ${process.env.MAX_FILE_SIZE || '10MB'}`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        message: 'Only one file can be uploaded at a time',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field',
        message: 'File must be uploaded with field name "file"',
      });
    }
  } else if (err) {
    // Other errors (like file type validation)
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
};

module.exports = { upload, handleMulterError };
