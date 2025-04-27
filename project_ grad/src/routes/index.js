const express = require('express');
const router = express.Router();

// Import route modules
const productRoutes = require('./product.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const reviewRoutes = require('./review.routes');

// API version prefix
const API_VERSION = '/v1';

// Mount routes with correct prefix
router.use(`${API_VERSION}/products`, productRoutes);
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/categories`, categoryRoutes);
router.use(`${API_VERSION}/reviews`, reviewRoutes);

module.exports = router;