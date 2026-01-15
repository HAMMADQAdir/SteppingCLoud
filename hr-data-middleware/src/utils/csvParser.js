const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * CSV Parser Utility
 * Converts raw CSV buffer to JSON array
 */

/**
 * Parse CSV buffer to JSON
 * @param {Buffer} buffer - CSV file buffer from multer
 * @returns {Promise<Array>} - Array of employee objects
 */
const parseCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    // Convert buffer to readable stream
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase(), // Normalize headers
          skipLines: 0,
          strict: false,
        })
      )
      .on('data', (data) => {
        // Trim all values
        const cleanedData = {};
        for (const key in data) {
          cleanedData[key] = typeof data[key] === 'string' ? data[key].trim() : data[key];
        }
        results.push(cleanedData);
      })
      .on('end', () => {
        console.log(`✅ CSV parsed: ${results.length} records`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('❌ CSV parsing error:', error);
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      });
  });
};

/**
 * Validate CSV structure
 * @param {Array} data - Parsed CSV data
 * @returns {Object} - { valid: boolean, missingHeaders: [] }
 */
const validateCSVStructure = (data) => {
  if (!data || data.length === 0) {
    return { valid: false, error: 'CSV is empty' };
  }

  const requiredHeaders = ['employeeid', 'name', 'email', 'department', 'salary', 'joiningdate'];
  const firstRow = data[0];
  const actualHeaders = Object.keys(firstRow);

  const missingHeaders = requiredHeaders.filter(
    (header) => !actualHeaders.includes(header)
  );

  if (missingHeaders.length > 0) {
    return {
      valid: false,
      error: 'Missing required columns',
      missingHeaders,
    };
  }

  return { valid: true };
};

module.exports = {
  parseCSVBuffer,
  validateCSVStructure,
};
