const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();
const orderController = require('../controllers/order.controller');

// Get all orders
router.get('/', orderController.getOrders);

// Create a new order (requires authentication)
router.post('/', authenticate, orderController.createOrder);

module.exports = router;
