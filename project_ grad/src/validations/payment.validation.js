const { body } = require('express-validator');

const processPaymentValidation = [
  body('cardNumber')
    .notEmpty()
    .withMessage('Card number is required')
    .matches(/^[0-9]{16}$/)
    .withMessage('Invalid card number format'),

  body('expiryMonth')
    .notEmpty()
    .withMessage('Expiry month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Invalid expiry month'),

  body('expiryYear')
    .notEmpty()
    .withMessage('Expiry year is required')
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Invalid expiry year'),

  body('cvv')
    .notEmpty()
    .withMessage('CVV is required')
    .matches(/^[0-9]{3,4}$/)
    .withMessage('Invalid CVV format'),

  body('billingAddress')
    .isObject()
    .withMessage('Billing address must be an object'),
  body('billingAddress.street')
    .notEmpty()
    .withMessage('Street address is required')
    .trim(),
  body('billingAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),
  body('billingAddress.state')
    .notEmpty()
    .withMessage('State is required')
    .trim(),
  body('billingAddress.zipCode')
    .notEmpty()
    .withMessage('Zip code is required')
    .matches(/^[0-9]{5}(-[0-9]{4})?$/)
    .withMessage('Invalid zip code format')
    .trim(),
  body('billingAddress.country')
    .notEmpty()
    .withMessage('Country is required')
    .trim()
];

const refundValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Refund amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Invalid refund amount'),

  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Refund reason must be between 10 and 500 characters')
];

module.exports = {
  processPaymentValidation,
  refundValidation
};