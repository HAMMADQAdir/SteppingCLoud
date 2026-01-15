/**
 * Business Rules Engine - Data Validator
 * Core validation logic for employee data
 * Checks: Salary, Email, Dates, Required Fields
 */

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate salary
 */
const isValidSalary = (salary) => {
  const numSalary = Number(salary);
  return !isNaN(numSalary) && numSalary > 0;
};

/**
 * Validate date
 */
const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return false;
  
  // Check if date is not in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date <= today;
};

/**
 * Validate required fields
 */
const hasRequiredFields = (employee) => {
  const requiredFields = ['employeeId', 'name', 'email', 'department', 'salary', 'joiningDate'];
  
  for (const field of requiredFields) {
    if (!employee[field] || String(employee[field]).trim() === '') {
      return { valid: false, missing: field };
    }
  }
  
  return { valid: true };
};

/**
 * Main Validation Function
 * Returns: { isValid: boolean, errors: [], primaryReason: string }
 */
const validateEmployeeData = (employee) => {
  const errors = [];
  let primaryReason = null;

  // 1. Check required fields
  const requiredCheck = hasRequiredFields(employee);
  if (!requiredCheck.valid) {
    errors.push({
      field: requiredCheck.missing,
      message: `Required field '${requiredCheck.missing}' is missing or empty`,
      value: employee[requiredCheck.missing],
    });
    primaryReason = 'MISSING_REQUIRED_FIELD';
  }

  // 2. Validate email
  if (employee.email && !isValidEmail(employee.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      value: employee.email,
    });
    if (!primaryReason) primaryReason = 'INVALID_EMAIL';
  }

  // 3. Validate salary
  if (employee.salary && !isValidSalary(employee.salary)) {
    errors.push({
      field: 'salary',
      message: 'Salary must be a positive number',
      value: employee.salary,
    });
    if (!primaryReason) primaryReason = 'INVALID_SALARY';
  }

  // 4. Validate joining date
  if (employee.joiningDate && !isValidDate(employee.joiningDate)) {
    errors.push({
      field: 'joiningDate',
      message: 'Invalid date or future date not allowed',
      value: employee.joiningDate,
    });
    if (!primaryReason) primaryReason = 'INVALID_DATE';
  }

  // 5. Additional business rules can be added here
  // Example: Department validation, salary range checks, etc.

  return {
    isValid: errors.length === 0,
    errors,
    primaryReason: primaryReason || 'BUSINESS_RULE_VIOLATION',
  };
};

/**
 * Sanitize employee data before saving
 */
const sanitizeEmployeeData = (employee) => {
  return {
    employeeId: String(employee.employeeId).trim(),
    name: String(employee.name).trim(),
    email: String(employee.email).toLowerCase().trim(),
    department: String(employee.department).trim(),
    salary: Number(employee.salary),
    joiningDate: new Date(employee.joiningDate),
    status: employee.status || 'active',
  };
};

module.exports = {
  validateEmployeeData,
  sanitizeEmployeeData,
  isValidEmail,
  isValidSalary,
  isValidDate,
};
