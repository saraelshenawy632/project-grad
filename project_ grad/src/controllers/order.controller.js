const Order = require('../models/order.model');

// Get all orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const { products, shippingAddress, totalAmount } = req.body;

        if (!products || !shippingAddress || !totalAmount) {
            return res.status(400).json({ message: 'All order details are required' });
        }

        const order = new Order({
            user: req.user._id, // Set by authenticate middleware
            products,
            shippingAddress,
            totalAmount,
        });

        const newOrder = await order.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ message: error.message });
    }
};
