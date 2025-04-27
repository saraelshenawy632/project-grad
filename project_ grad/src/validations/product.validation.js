const { body } = require('express-validator');

const createProductValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name must be less than 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('inventory')
    .isInt({ min: 0 })
    .withMessage('Inventory must be a non-negative integer'),
  
  body('categories')
    .isArray()
    .withMessage('Categories must be an array')
    .notEmpty()
    .withMessage('At least one category is required'),
  
  body('categories.*')
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty'),
  
  body('images')
    .isArray()
    .withMessage('Images must be an array')
    .notEmpty()
    .withMessage('At least one image is required'),
  
  body('images.*')
    .trim()
    .notEmpty()
    .withMessage('Image URL cannot be empty')
    .isURL()
    .withMessage('Invalid image URL'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Product name must be less than 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product description cannot be empty'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('inventory')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory must be a non-negative integer'),
  
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array')
    .notEmpty()
    .withMessage('At least one category is required'),
  
  body('categories.*')
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .notEmpty()
    .withMessage('At least one image is required'),
  
  body('images.*')
    .trim()
    .notEmpty()
    .withMessage('Image URL cannot be empty')
    .isURL()
    .withMessage('Invalid image URL'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object')
];

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('review')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Review must be less than 500 characters')
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  ratingValidation
};


// Add brand validation to createProductValidation
body('brand')
  .trim()
  .notEmpty()
  .withMessage('Brand name is required')
  .isLength({ max: 50 })
  .withMessage('Brand name must be less than 50 characters'),

body('discount')
  .optional()
  .isFloat({ min: 0, max: 100 })
  .withMessage('Discount must be between 0 and 100'),

body('tags')
  .optional()
  .isArray()
  .withMessage('Tags must be an array'),

body('tags.*')
  .trim()
  .notEmpty()
  .withMessage('Tag cannot be empty')
  .isLength({ max: 20 })
  .withMessage('Tag must be less than 20 characters'),

// Add the same fields to updateProductValidation with optional flag
body('brand')
  .optional()
  .trim()
  .notEmpty()
  .withMessage('Brand name cannot be empty')
  .isLength({ max: 50 })
  .withMessage('Brand name must be less than 50 characters'),

// Add validation for product dimensions
body('dimensions')
  .optional()
  .isObject()
  .withMessage('Dimensions must be an object'),

body('dimensions.length')
  .optional()
  .isFloat({ min: 0 })
  .withMessage('Length must be a positive number'),

body('dimensions.width')
  .optional()
  .isFloat({ min: 0 })
  .withMessage('Width must be a positive number'),

body('dimensions.height')
  .optional()
  .isFloat({ min: 0 })
  .withMessage('Height must be a positive number'),

body('dimensions.weight')
  .optional()
  .isFloat({ min: 0 })
  .withMessage('Weight must be a positive number')