const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    userId: String,
    productId: String,
    quantity: Number
}, { timestamps: true });

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;