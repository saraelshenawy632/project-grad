const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class OrderService {
  async createOrder(userId, cartId, shippingAddress, paymentInfo) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw {
          status: 400,
          message: 'Invalid cart ID format'
        };
      }

      const cart = await Cart.findById(cartId)
        .populate('items.product')
        .session(session);

      if (!cart) {
        throw {
          status: 404,
          message: 'Cart not found'
        };
      }

      if (cart.items.length === 0) {
        throw {
          status: 400,
          message: 'Cart is empty'
        };
      }

      // Validate shipping address
      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
        throw {
          status: 400,
          message: 'Invalid shipping address'
        };
      }

      // Validate stock and create order items
      const orderItems = [];
      let totalAmount = 0;

      for (const item of cart.items) {
        const product = await Product.findById(item.product._id).session(session);
        
        if (!product) {
          throw {
            status: 404,
            message: `Product ${item.product._id} not found`
          };
        }

        if (product.stock < item.quantity) {
          throw {
            status: 400,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
          };
        }

        // Update product stock
        product.stock -= item.quantity;
        await product.save({ session });

        orderItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price * item.quantity
        });

        totalAmount += product.price * item.quantity;
      }

      // Create order
      const order = new Order({
        user: userId,
        items: orderItems,
        totalAmount,
        shippingAddress,
        paymentInfo: {
          ...paymentInfo,
          status: 'pending'
        },
        orderStatus: 'pending',
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });

      await order.save({ session });

      // Clear cart
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save({ session });

      await session.commitTransaction();
      
      return await Order.findById(order._id)
        .populate('items.product')
        .populate('user', 'name email');

    } catch (error) {
      await session.abortTransaction();
      throw error.status ? error : {
        status: 500,
        message: 'Error creating order',
        error: error.message
      };
    } finally {
      session.endSession();
    }
  }

  async getOrder(orderId, userId) {
    try {
      const order = await Order.findOne({ _id: orderId, user: userId })
        .populate('items.product')
        .populate('user', 'name email');

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  async getUserOrders(userId) {
    try {
      const orders = await Order.find({ user: userId })
        .populate('items.product')
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      throw error;
    }
  }

  async updateOrderStatus(orderId, userId, status) {
    try {
      const order = await Order.findOne({ _id: orderId, user: userId });
      if (!order) {
        throw new Error('Order not found');
      }

      order.orderStatus = status;
      await order.save();

      return order;
    } catch (error) {
      throw error;
    }
  }

  async processPayment(orderId, paymentDetails) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Here you would integrate with a payment gateway
      // This is a simplified example
      const paymentResult = {
        success: true,
        transactionId: `TR${Date.now()}`,
        status: 'completed'
      };

      if (paymentResult.success) {
        order.paymentInfo.status = paymentResult.status;
        order.paymentInfo.transactionId = paymentResult.transactionId;
        order.orderStatus = 'processing';
        await order.save();
      } else {
        throw new Error('Payment processing failed');
      }

      return order;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();