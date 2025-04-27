/**
 * Validation utility functions for common input validation tasks
 */

/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password meets minimum requirements
 * @param {string} password - The password to validate
 * @returns {object} - Object containing validation result and error message
 */
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must contain uppercase, lowercase, numbers and special characters'
    };
  }

  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validates a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if phone number is valid, false otherwise
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is valid, false otherwise
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Sanitizes a string by removing HTML tags and special characters
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
const sanitizeString = (str) => {
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[\u00A0-\u9999<>\&]/g, (i) => `&#${i.charCodeAt(0)};`); // Encode special characters
};

module.exports = {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidUrl,
  sanitizeString
};