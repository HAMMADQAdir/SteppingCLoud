const { v4: uuidv4 } = require('uuid');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { parseCSVBuffer } = require('../utils/csvParser');
const { validateEmployeeData } = require('../middleware/dataValidator');

/**
 * Upload Controller - The "Brain" 
 * Orchestrates CSV ingestion, validation, and dual storage
 */
const uploadCSV = async (req, res) => {
  try {
    // 1. Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a CSV file.',
      });
    }

    console.log(`📂 Processing file: ${req.file.originalname}`);

    // 2. Parse CSV buffer to JSON
    const employees = await parseCSVBuffer(req.file.buffer);

    if (!employees || employees.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'CSV file is empty or invalid',
      });
    }

    console.log(`📊 Total records found: ${employees.length}`);

    // 3. Generate batch ID for tracking
    const batchId = uuidv4();
    const fileName = req.file.originalname;

    // 4. Process each record through validation engine
    const results = {
      valid: [],
      invalid: [],
    };

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const rowNumber = i + 2; // +2 because row 1 is header, array is 0-indexed

      // Validate using Business Rules Engine
      const validation = validateEmployeeData(employee);

      if (validation.isValid) {
        results.valid.push({
          ...employee,
          uploadBatch: batchId,
        });
      } else {
        results.invalid.push({
          rowNumber,
          rawData: employee,
          validationErrors: validation.errors,
          failureReason: validation.primaryReason,
          uploadBatch: batchId,
          fileName,
        });
      }
    }

    // 5. Dual Storage - Valid to Employee, Invalid to AuditLog
    let savedValid = 0;
    let savedInvalid = 0;

    // Save valid records
    if (results.valid.length > 0) {
      try {
        const inserted = await Employee.insertMany(results.valid, {
          ordered: false, // Continue even if some fail due to duplicates
        });
        savedValid = inserted.length;
      } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
          savedValid = error.insertedDocs?.length || 0;
          console.warn(`⚠️ Some records were duplicates: ${error.writeErrors?.length || 0}`);
        } else {
          throw error;
        }
      }
    }

    // Save invalid records to audit log
    if (results.invalid.length > 0) {
      const inserted = await AuditLog.insertMany(results.invalid);
      savedInvalid = inserted.length;
    }

    // 6. Return detailed statistics
    console.log(`✅ Valid: ${savedValid} | ❌ Invalid: ${savedInvalid}`);

    res.status(200).json({
      success: true,
      message: 'CSV processed successfully',
      batchId,
      fileName,
      stats: {
        totalRecords: employees.length,
        validRecords: savedValid,
        invalidRecords: savedInvalid,
        successRate: ((savedValid / employees.length) * 100).toFixed(2) + '%',
      },
      details: {
        validationSummary: results.invalid.length > 0 
          ? `${results.invalid.length} records failed validation. Use /api/stats?batchId=${batchId} for details.`
          : 'All records passed validation',
      },
    });
  } catch (error) {
    console.error('❌ Upload Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process CSV file',
      details: error.message,
    });
  }
};

module.exports = { uploadCSV };
