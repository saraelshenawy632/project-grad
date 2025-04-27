/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Format a date to a standard string representation
 * @param {Date} date - The date to format
 * @param {string} format - Optional format string (default: 'YYYY-MM-DD')
 * @returns {string} - Formatted date string
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Add a specified number of days to a date
 * @param {Date} date - The base date
 * @param {number} days - Number of days to add
 * @returns {Date} - New date with added days
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculate the difference in days between two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} - Number of days between dates
 */
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

/**
 * Check if a date is in the past
 * @param {Date} date - The date to check
 * @returns {boolean} - True if date is in the past
 */
const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if a date is in the future
 * @param {Date} date - The date to check
 * @returns {boolean} - True if date is in the future
 */
const isFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Get start of day for a given date
 * @param {Date} date - The date to process
 * @returns {Date} - Date set to start of day
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day for a given date
 * @param {Date} date - The date to process
 * @returns {Date} - Date set to end of day
 */
const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

module.exports = {
  formatDate,
  addDays,
  daysBetween,
  isPast,
  isFuture,
  startOfDay,
  endOfDay
};