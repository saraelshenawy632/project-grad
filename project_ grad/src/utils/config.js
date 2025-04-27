/**
 * Configuration utility for managing environment variables and application settings
 */

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },

  // Database configuration
  database: {
    url: process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/ecommerce',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Payment configuration
  payment: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePubKey: process.env.STRIPE_PUBLIC_KEY,
    currency: process.env.PAYMENT_CURRENCY || 'USD'
  },

  // Email configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'noreply@example.com'
  },

  // Cache configuration
  cache: {
    ttl: process.env.CACHE_TTL || 3600,
    prefix: process.env.CACHE_PREFIX || 'app:'
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log'
  },

  // Get environment specific configuration
  get: function(key) {
    return key.split('.').reduce((obj, i) => obj[i], this);
  },

  // Check if running in production
  isProduction: function() {
    return this.server.env === 'production';
  },

  // Check if running in development
  isDevelopment: function() {
    return this.server.env === 'development';
  },

  // Check if running in test
  isTest: function() {
    return this.server.env === 'test';
  }
};

module.exports = config;