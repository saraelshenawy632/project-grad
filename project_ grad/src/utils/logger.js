/**
 * Logging utility for consistent logging across the application
 */

const config = require('./config');
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    this.currentLevel = this.logLevels[config.logging.level] || this.logLevels.info;
    this.logFile = config.logging.file;

    // Ensure log directory exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Format log message with timestamp and level
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} [meta] - Additional metadata
   * @returns {string} - Formatted log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaStr}\n`;
  }

  /**
   * Write log to file
   * @param {string} message - Formatted log message
   */
  writeToFile(message) {
    fs.appendFileSync(this.logFile, message);
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Object} [meta] - Additional metadata
   */
  error(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.error) {
      const formattedMessage = this.formatMessage('error', message, meta);
      console.error(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} [meta] - Additional metadata
   */
  warn(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.warn) {
      const formattedMessage = this.formatMessage('warn', message, meta);
      console.warn(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} [meta] - Additional metadata
   */
  info(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.info) {
      const formattedMessage = this.formatMessage('info', message, meta);
      console.info(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} [meta] - Additional metadata
   */
  debug(message, meta = {}) {
    if (this.currentLevel >= this.logLevels.debug) {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.debug(formattedMessage);
      this.writeToFile(formattedMessage);
    }
  }
}

module.exports = new Logger();