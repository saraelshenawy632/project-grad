const mongoose = require('mongoose');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const Payment = require('../models/payment.model');
const config = require('./config');
const bcrypt = require('bcryptjs');

// Sample data
const users = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isEmailVerified: true
  },
  {
    email: 'customer@example.com',
    password: 'customer123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    isEmailVerified: true
  }
];

const products = [
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 999.99,
    category: 'Electronics',
    stock: 50,
    images: ['smartphone-x.jpg'],
    specifications: {
      brand: 'TechCo',
      model: 'X-2023',
      color: 'Black'
    }
  },
  {
    name: 'Classic T-Shirt',
    description: 'Comfortable cotton t-shirt',
    price: 29.99,
    category: 'Clothing',
    stock: 100,
    images: ['tshirt.jpg'],
    specifications: {
      brand: 'FashionBrand',
      size: 'M',
      color: 'White'
    }
  },
  {
    name: 'Coffee Maker Pro',
    description: 'Professional grade coffee maker',
    price: 199.99,
    category: 'Appliances',
    stock: 30,
    images: ['coffee-maker.jpg'],
    specifications: {
      brand: 'HomePro',
      capacity: '12 cups',
      color: 'Silver'
    }
  }
];

// Seed data function
async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.url, config.database.options);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Payment.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({ ...user, password: hashedPassword });
      })
    );
    console.log('Users created');

    // Create products
    const createdProducts = await Promise.all(
      products.map(product => Product.create(product))
    );
    console.log('Products created');

    // Create a sample order and payment
    const sampleOrder = await Order.create({
      user: createdUsers[1]._id,
      products: [
        {
          product: createdProducts[0]._id,
          quantity: 1,
          price: createdProducts[0].price
        }
      ],
      totalAmount: createdProducts[0].price,
      status: 'completed',
      shippingAddress: {
        street: '123 Main St',
        city: 'Sample City',
        state: 'ST',
        zipCode: '12345',
        country: 'Sample Country'
      }
    });

    // Create sample payment
    await Payment.create({
      order: sampleOrder._id,
      user: createdUsers[1]._id,
      amount: createdProducts[0].price,
      currency: 'USD',
      paymentMethod: 'credit_card',
      transactionId: 'sample_transaction_123',
      status: 'completed'
    });

    console.log('Sample order and payment created');
    console.log('Database seeding completed successfully');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Export the seeder function
module.exports = seedData;