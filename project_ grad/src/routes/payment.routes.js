const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

// Payment validation
const paymentValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .isIn(['USD', 'EUR', 'GBP'])
    .withMessage('Supported currencies: USD, EUR, GBP'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal'])
    .withMessage('Invalid payment method'),
  body('orderId')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid order ID format')
];

// Process payment
router.post('/process', authenticate, paymentValidation, validateRequest, async (req, res, next) => {
  try {
    const paymentService = require('../services/payment.service');
    const payment = await paymentService.processPayment({
      ...req.body,
      userId: req.user.id
    });
    
    res.status(201).json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient funds'
      });
    }
    next(error);
  }
});

// Verify payment with ID validation
router.get('/verify/:paymentId', authenticate, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.paymentId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment ID format'
      });
    }

    const paymentService = require('../services/payment.service');
    const payment = await paymentService.verifyPayment(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    res.json({
      status: 'success',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});

// Process refund
router.post('/refund', authenticate, [
  body('paymentId').notEmpty().withMessage('Payment ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('reason').notEmpty().withMessage('Refund reason is required')
], validateRequest, async (req, res, next) => {
  try {
    const paymentService = require('../services/payment.service');
    const refund = await paymentService.processRefund(req.body);
    res.json({
      status: 'success',
      data: { refund }
    });
  } catch (error) {
    next(error);
  }
});

// Get payment history
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const paymentService = require('../services/payment.service');
    const payments = await paymentService.getPaymentHistory(req.user.id);
    res.json({
      status: 'success',
      data: { payments }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;