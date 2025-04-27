const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

class UserService {
  async register(userData) {
    try {
      const { email, password, name } = userData;

      // Enhanced email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw {
          status: 400,
          message: 'Invalid email format'
        };
      }

      // Password strength validation
      if (password.length < 8) {
        throw {
          status: 400,
          message: 'Password must be at least 8 characters long'
        };
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw {
          status: 409,
          message: 'Email already registered'
        };
      }

      // Enhanced password hashing
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        email,
        password: hashedPassword,
        name,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      await user.save();

      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: '24h',
          algorithm: 'HS256'
        }
      );

      return {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        token
      };

    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: 'Error registering user',
        error: error.message
      };
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ email });
      
      // Generic error message for security
      const invalidCredentials = {
        status: 401,
        message: 'Invalid email or password'
      };

      if (!user) {
        throw invalidCredentials;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw invalidCredentials;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: '24h',
          algorithm: 'HS256'
        }
      );

      return {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          lastLogin: user.lastLogin
        },
        token
      };

    } catch (error) {
      throw error.status ? error : {
        status: 500,
        message: 'Login failed',
        error: error.message
      };
    }
  }

  async getProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async addAddress(userId, addressData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.addresses.push(addressData);
      await user.save();

      return user.addresses[user.addresses.length - 1];
    } catch (error) {
      throw error;
    }
  }

  async updateAddress(userId, addressId, addressData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const address = user.addresses.id(addressId);
      if (!address) {
        throw new Error('Address not found');
      }

      Object.assign(address, addressData);
      await user.save();

      return address;
    } catch (error) {
      throw error;
    }
  }

  async deleteAddress(userId, addressId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.addresses.pull(addressId);
      await user.save();

      return { message: 'Address deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      return { message: 'Password updated successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();