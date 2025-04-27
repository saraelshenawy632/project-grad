const Cart = require('../models/cart.model');

// Get cart
exports.getCart = async (req, res) => {
    try {
        // Enhanced user validation with type checking
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (typeof req.user !== 'object') {
            return res.status(401).json({ message: 'Invalid user object format' });
        }
        if (!req.user._id) {
            return res.status(401).json({ message: 'User ID not found' });
        }

        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        if (!cart) {
            return res.json({ items: [], total: 0 });
        }

        // Ensure cart has items array
        if (!Array.isArray(cart.items)) {
            cart.items = [];
            await cart.save();
            return res.json(cart);
        }

        // Ensure all items have valid product references and quantities
        const validItems = cart.items.filter(item => 
            item && 
            item.product != null && 
            typeof item.quantity === 'number' && 
            item.quantity > 0
        );

        // Update cart if invalid items were removed
        if (validItems.length !== cart.items.length) {
            cart.items = validItems;
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).json({ message: 'Error retrieving cart' });
    }
};

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        // Enhanced user validation with type checking
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (typeof req.user !== 'object') {
            return res.status(401).json({ message: 'Invalid user object format' });
        }
        if (!req.user._id) {
            return res.status(401).json({ message: 'User ID not found' });
        }

        const { productId, quantity } = req.body;

        // Enhanced input validation
        if (!productId || typeof productId !== 'string') {
            return res.status(400).json({ message: 'Valid product ID is required' });
        }

        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({ message: 'Quantity must be a positive number' });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: [{
                    product: productId,
                    quantity: parsedQuantity
                }]
            });
        } else {
            // Ensure cart.items exists and is an array
            if (!Array.isArray(cart.items)) {
                cart.items = [];
            }

            const itemIndex = cart.items.findIndex(item => 
                item && 
                item.product && 
                item.product.toString() === productId
            );
            
            if (itemIndex > -1) {
                // Update existing item quantity
                const newQuantity = cart.items[itemIndex].quantity + parsedQuantity;
                if (newQuantity > 0) {
                    cart.items[itemIndex].quantity = newQuantity;
                }
            } else {
                // Add new item
                cart.items.push({
                    product: productId,
                    quantity: parsedQuantity
                });
            }
        }
        
        try {
            // Validate cart items before saving
            if (!cart.items.every(item => item && item.product && item.quantity > 0)) {
                return res.status(400).json({ message: 'Invalid cart items detected' });
            }
            
            await cart.save();
            // Populate product details before sending response
            await cart.populate('items.product');
            
            // Verify populated products
            const invalidProducts = cart.items.filter(item => !item.product);
            if (invalidProducts.length > 0) {
                return res.status(400).json({ message: 'One or more products not found' });
            }
            
            res.json({
                status: 'success',
                data: cart
            });
        } catch (saveError) {
            console.error('Error saving cart:', saveError);
            return res.status(500).json({ message: 'Error saving cart' });
        }
    } catch (error) {
        console.error('Error in addToCart:', error);
        res.status(500).json({ message: 'Error updating cart' });
    }
};