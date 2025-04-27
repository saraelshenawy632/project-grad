const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP']
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal']
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  errorMessage: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create compound index for common queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ order: 1, status: 1 });

// Instance method to check if payment is successful
paymentSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

// Static method to find successful payments for a user
paymentSchema.statics.findSuccessfulPayments = function(userId) {
  return this.find({
    user: userId,
    status: 'completed'
  }).sort({ createdAt: -1 });
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;