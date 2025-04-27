const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const Cart = require('../models/cart.model'); // افترض أن لديك نموذج للسلة

const router = express.Router();

router.post('/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user._id; // المستخدم المصادق عليه
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    // إضافة المنتج إلى السلة (كمثال)
    const cartItem = await Cart.create({
      userId,
      productId,
      quantity,
    });

    res.status(201).json({
      message: 'Product added to cart successfully',
      cartItem,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;