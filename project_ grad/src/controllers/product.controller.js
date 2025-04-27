const Product = require('../models/product.model');
const logger = require('../utils/logger');

// Get all products with optional filtering
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    logger.error('Error getting products:', error);
    res.status(500).json({ message: 'Error getting products' });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    logger.error('Error getting categories:', error);
    res.status(500).json({ message: 'Error getting categories' });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    logger.error('Error getting products by category:', error);
    res.status(500).json({ message: 'Error getting products by category' });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(products);
  } catch (error) {
    logger.error('Error searching products:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
};

// Filter products
const filterProducts = async (req, res) => {
  try {
    const filter = req.body;
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    logger.error('Error filtering products:', error);
    res.status(500).json({ message: 'Error filtering products' });
  }
};

// Get product details
const getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logger.error('Error getting product details:', error);
    res.status(500).json({ message: 'Error getting product details' });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Add product review
const addProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const review = {
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    };
    
    product.reviews.push(review);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    logger.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
};

// Get product reviews
const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product.reviews);
  } catch (error) {
    logger.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Error getting reviews' });
  }
};

// Update product stock
const updateProductStock = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.stock },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logger.error('Error updating stock:', error);
    res.status(500).json({ message: 'Error updating stock' });
  }
};

// Create bulk products
const createBulkProducts = async (req, res) => {
  try {
    const products = await Product.insertMany(req.body);
    res.status(201).json(products);
  } catch (error) {
    logger.error('Error creating bulk products:', error);
    res.status(500).json({ message: 'Error creating bulk products' });
  }
};

// Update bulk products
const updateBulkProducts = async (req, res) => {
  try {
    const operations = req.body.map(product => ({
      updateOne: {
        filter: { _id: product._id },
        update: product
      }
    }));
    
    await Product.bulkWrite(operations);
    res.json({ message: 'Products updated successfully' });
  } catch (error) {
    logger.error('Error updating bulk products:', error);
    res.status(500).json({ message: 'Error updating bulk products' });
  }
};

module.exports = {
  getAllProducts,
  getCategories,
  getProductsByCategory,
  searchProducts,
  filterProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getProductReviews,
  updateProductStock,
  createBulkProducts,
  updateBulkProducts
};