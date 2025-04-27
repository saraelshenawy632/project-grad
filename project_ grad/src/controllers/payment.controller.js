const PaymentGateway = require('../services/payment.service');
const { validationResult } = require('express-validator');

class PaymentController {
  async processPayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const paymentDetails = req.body;
      const order = await PaymentGateway.processTransaction(req.order, paymentDetails);

      res.status(200).json({
        status: 'success',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async validatePayment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const paymentDetails = req.body;
      await PaymentGateway.validatePaymentDetails(paymentDetails);

      res.status(200).json({
        status: 'success',
        message: 'Payment details are valid'
      });
    } catch (error) {
      next(error);
    }
  }

  async processRefund(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }

      const { transactionId, amount } = req.body;
      const refund = await PaymentGateway.refundTransaction(transactionId, amount);

      res.status(200).json({
        status: 'success',
        data: refund
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();