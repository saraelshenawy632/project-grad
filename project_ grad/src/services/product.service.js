const Product = require('../models/product.model');
const mongoose = require('mongoose');

class ProductService {
  async getAllProducts() {
    try {
      const products = await Product.find()
        .select('name price description category stock ratings averageRating')
        .lean();
      return products;
    } catch (error) {
      throw {
        status: 500,
        message: 'Error fetching products',
        error: error.message
      };
    }
  }

  async createProduct(productData) {
    try {
      // Validate price and stock
      if (productData.price <= 0) {
        throw {
          status: 400,
          message: 'Price must be greater than 0'
        };
      }

      if (productData.stock < 0) {
        throw {
          status: 400,
          message: 'Stock cannot be negative'
        };
      }

      const product = new Product({
        ...productData,
        createdAt: new Date(),
        averageRating: 0,
        ratings: []
      });

      await product.save();
      return product;
    } catch (error) {
      if (error.code === 11000) {
        throw {
          status: 400,
          message: 'Product with this name already exists'
        };
      }
      throw error.status ? error : {
        status: 500,
        message: 'Error creating product',
        error: error.message
      };
    }
  }

  async getProducts(query = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const filter = {};

      // Enhanced filters
      if (query.category) {
        filter.category = { $in: Array.isArray(query.category) ? query.category : [query.category] };
      }
      if (query.minPrice || query.maxPrice) {
        filter.price = {};
        if (query.minPrice) filter.price.$gte = parseFloat(query.minPrice);
        if (query.maxPrice) filter.price.$lte = parseFloat(query.maxPrice);
      }
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } }
        ];
      }
      if (query.inStock === 'true') {
        filter.stock = { $gt: 0 };
      }

      const [products, total] = await Promise.all([
        Product.find(filter)
          .select('name price description category stock ratings averageRating')
          .sort(query.sort || { createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(filter)
      ]);

      return {
        products,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total
      };
    } catch (error) {
      throw {
        status: 500,
        message: 'Error fetching products',
        error: error.message
      };
    }
  }

  async updateProduct(productId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw {
          status: 400,
          message: 'Invalid product ID format'
        };
      }
      if (updateData.price <= 0) {
        throw {
          status: 400,
          message: 'Price must be greater than 0'
        };
      }
      if (updateData.stock < 0) {
        throw {
          status: 400,
          message: 'Stock cannot be negative'
        };
      }
      const product = await Product.findByIdAndUpdate(
        productId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }
      return product;
    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: 'Error updating product',
        error: error.message
      };
    }
  }

  async getProductById(productId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw {
          status: 400,
          message: 'Invalid product ID format'
        };
      }

      const product = await Product.findById(productId)
        .select('name price description category stock ratings averageRating image discount isAvailable')
        .lean();

      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }

      return product;
    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: 'Error fetching product',
        error: error.message
      };
    }
  }

  async deleteProduct(productId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw {
          status: 400,
          message: 'Invalid product ID format'
        };
      }

      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }

      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: 'Error deleting product',
        error: error.message
      };
    }
  }

  async updateProductStock(productId, quantity) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw {
          status: 400,
          message: 'Invalid product ID format'
        };
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }

      product.stock = Math.max(0, product.stock + quantity);
      product.isAvailable = product.stock > 0;
      await product.save();

      return product;
    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: 'Error updating product stock',
        error: error.message
      };
    }
  }

  async addProductReview(productId, userId, rating, comment) {
    try {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw {
          status: 400,
          message: 'Invalid product ID format'
        };
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw {
          status: 404,
          message: 'Product not found'
        };
      }

      // Check if user has already reviewed
      const existingReviewIndex = product.reviews.findIndex(
        review => review.user.toString() === userId.toString()
      );

      const review = {
        user: userId,
        rating,
        comment,
        createdAt: new Date()
      };

      if (existingReviewIndex >= 0) {
        product.reviews[existingReviewIndex] = review;
      } else {
        product.reviews.push(review);
      }

      // Update average rating
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.rating = totalRating / product.reviews.length;

      await product.save();
      return product;
    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: 'Error adding product review',
        error: error.message
      };
    }
  }
}

module.exports = new ProductService();