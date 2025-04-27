const { body } = require('express-validator');

const createOrderValidation = [
  body('cartId')
    .notEmpty()
    .withMessage('Cart ID is required')
    .isMongoId()
    .withMessage('Invalid cart ID format'),

  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address must be an object'),
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required')
    .trim(),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required')
    .trim(),
  body('shippingAddress.zipCode')
    .notEmpty()
    .withMessage('Zip code is required')
    .trim(),
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required')
    .trim(),

  body('paymentInfo')
    .isObject()
    .withMessage('Payment information must be an object'),
  body('paymentInfo.method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['credit_card', 'debit_card', 'paypal'])
    .withMessage('Invalid payment method'),
  body('paymentInfo.transactionId')
    .notEmpty()
    .withMessage('Transaction ID is required')
    .trim()
];

const updateOrderStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Order status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation
};