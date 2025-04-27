const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class CartService {
  async getCart(userId) {
    try {
      let cart = await Cart.findOne({ user: userId })
        .populate('items.product', 'name price image stock')
        .lean();
      
      if (!cart) {
        cart = await Cart.create({ 
          user: userId, 
          items: [], 
          totalAmount: 0 
        });
      }

      // Calculate total items
      cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      return cart;
    } catch (error) {
      throw {
        status: 500,
        message: 'Error fetching cart',
        error: error.message
      };
    }
  }

  async addToCart(userId, productId, quantity) {
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
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        };
      }

      if (product.stock < quantity) {
        throw {
          status: 400,
          code: 'INSUFFICIENT_STOCK',
          message: `Only ${product.stock} items available`
        };
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [], totalAmount: 0 });
      }

      const existingItem = cart.items.find(item => 
        item.product.toString() === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock < newQuantity) {
          throw {
            status: 400,
            code: 'INSUFFICIENT_STOCK',
            message: `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} available`
          };
        }
        existingItem.quantity = newQuantity;
        existingItem.price = product.price * newQuantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: product.price * quantity
        });
      }

      cart.totalAmount = cart.items.reduce((total, item) => total + item.price, 0);
      await cart.save();

      return await cart.populate('items.product', 'name price image stock');
    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: 'Error adding item to cart',
        error: error.message
      };
    }
  }

  async updateCartItem(userId, productId, quantity) {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check inventory
      if (product.inventory < quantity) {
        throw new Error('Insufficient inventory');
      }

      const itemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId.toString()
      );

      if (itemIndex === -1) {
        throw new Error('Product not found in cart');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Update item quantity and price
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = product.price * quantity;
      }

      // Update total amount
      cart.totalAmount = cart.items.reduce((total, item) => total + item.price, 0);

      await cart.save();
      return await cart.populate('items.product');
    } catch (error) {
      throw error;
    }
  }

  async removeFromCart(userId, productId) {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId.toString()
      );

      if (itemIndex === -1) {
        throw new Error('Product not found in cart');
      }

      // Remove item
      cart.items.splice(itemIndex, 1);

      // Update total amount
      cart.totalAmount = cart.items.reduce((total, item) => total + item.price, 0);

      await cart.save();
      return await cart.populate('items.product');
    } catch (error) {
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new Error('Cart not found');
      }

      cart.items = [];
      cart.totalAmount = 0;

      await cart.save();
      return cart;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CartService();