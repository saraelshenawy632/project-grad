const router = require('express').Router();
const CartItem = require('../models/cartItem.model');

// Add item to cart
router.post('/add-to-cart', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        
        let cartItem = await CartItem.findOne({ userId, productId });
        
        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cartItem = new CartItem({
                userId,
                productId,
                quantity
            });
        }
        await cartItem.save();
        
        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// View cart products
router.get('/viewCartProducts', async (req, res) => {
    try {
        const { userId } = req.query;
        const cartItems = await CartItem.find({ userId });
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get cart items count
router.get('/getCartItemsCount', async (req, res) => {
    try {
        const { userId } = req.query;
        const count = await CartItem.countDocuments({ userId });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete cart item
router.delete('/deleteCartItem', async (req, res) => {
    try {
        const { userId, productId } = req.query;
        const result = await CartItem.findOneAndDelete({ userId, productId });
        
        if (!result) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        
        res.json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update cart item quantity
router.post('/updateCartItemQuantity', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }
        
        const cartItem = await CartItem.findOneAndUpdate(
            { userId, productId },
            { quantity },
            { new: true }
        );
        
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        
        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;