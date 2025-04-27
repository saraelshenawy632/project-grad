const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/password', authenticate, userController.changePassword);

// Admin routes
router.get('/users', authenticate, authorizeAdmin, userController.getAllUsers);
router.get('/users/:id', authenticate, authorizeAdmin, userController.getUserById);
router.delete('/users/:id', authenticate, authorizeAdmin, userController.deleteUser);
router.put('/users/:id/role', authenticate, authorizeAdmin, userController.updateUserRole);

module.exports = router;