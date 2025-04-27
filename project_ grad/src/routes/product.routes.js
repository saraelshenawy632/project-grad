const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const { validateProductData, validateProductUpdate } = require('../middleware/validation.middleware');

// Public routes
// Get all products with optional filtering
router.get('/', productController.getAllProducts);

// Get products by category
router.get('/categories', productController.getCategories);
router.get('/category/:category', productController.getProductsByCategory);

// Search products
router.get('/search', productController.searchProducts);

// Filter products
router.post('/filter', productController.filterProducts);

// Get product details
router.get('/:id', productController.getProductDetails);

// Protected routes (require authentication and admin authorization)
// Create new product
router.post('/',
  authenticate,
  authorizeAdmin,
  validateProductData,
  productController.createProduct
);

// Update product
router.put('/:id',
  authenticate,
  authorizeAdmin,
  validateProductUpdate,
  productController.updateProduct
);

// Delete product
router.delete('/:id',
  authenticate,
  authorizeAdmin,
  productController.deleteProduct
);

// Product reviews
router.post('/:id/reviews',
  authenticate,
  productController.addProductReview
);

router.get('/:id/reviews',
  productController.getProductReviews
);

// Update product stock
router.patch('/:id/stock',
  authenticate,
  authorizeAdmin,
  productController.updateProductStock
);

// Bulk operations
router.post('/bulk/create',
  authenticate,
  authorizeAdmin,
  productController.createBulkProducts
);

router.put('/bulk/update',
  authenticate,
  authorizeAdmin,
  productController.updateBulkProducts
);

module.exports = router;