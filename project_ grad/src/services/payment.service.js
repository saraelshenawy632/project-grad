const Order = require('../models/order.model');
const crypto = require('crypto');

class PaymentGateway {
  constructor() {
    this.config = {
      apiKey: process.env.PAYMENT_GATEWAY_API_KEY,
      apiSecret: process.env.PAYMENT_GATEWAY_SECRET,
      environment: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
      supportedCards: ['visa', 'mastercard', 'amex'],
      maxAmount: 50000 // Maximum transaction amount
    };
  }

  async validatePaymentDetails(paymentDetails) {
    const { cardNumber, expiryMonth, expiryYear, cvv, amount } = paymentDetails;
    
    // Enhanced validation
    if (!cardNumber || !expiryMonth || !expiryYear || !cvv || !amount) {
      throw {
        status: 400,
        code: 'INVALID_PAYMENT_DETAILS',
        message: 'Missing required payment details'
      };
    }

    // Amount validation
    if (amount <= 0 || amount > this.config.maxAmount) {
      throw {
        status: 400,
        code: 'INVALID_AMOUNT',
        message: `Amount must be between 0 and ${this.config.maxAmount}`
      };
    }

    // Card type validation
    const cardType = this.detectCardType(cardNumber);
    if (!this.config.supportedCards.includes(cardType)) {
      throw {
        status: 400,
        code: 'UNSUPPORTED_CARD',
        message: `Card type ${cardType} is not supported`
      };
    }

    // Enhanced expiry validation
    const now = new Date();
    const expiry = new Date(expiryYear, expiryMonth - 1);
    if (expiry < now) {
      throw {
        status: 400,
        code: 'CARD_EXPIRED',
        message: 'Card has expired'
      };
    }

    return true;
  }

  detectCardType(cardNumber) {
    // Remove spaces and hyphens
    cardNumber = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cardNumber)) return 'visa';
    if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
    if (/^3[47]/.test(cardNumber)) return 'amex';
    return 'unknown';
  }

  async processTransaction(order, paymentDetails) {
    const session = crypto.randomBytes(32).toString('hex');
    
    try {
      await this.validatePaymentDetails(paymentDetails);

      // Mask card number for logging
      const maskedCard = paymentDetails.cardNumber.replace(/\d(?=\d{4})/g, '*');
      console.log(`Processing payment for order ${order.id} with card ${maskedCard}`);

      const transactionResult = await this.mockPaymentProviderAPI(order, paymentDetails);

      if (!transactionResult.success) {
        throw {
          status: 400,
          code: 'PAYMENT_FAILED',
          message: transactionResult.error || 'Payment processing failed'
        };
      }

      return {
        success: true,
        transactionId: transactionResult.transactionId,
        sessionId: session,
        timestamp: new Date().toISOString(),
        message: 'Payment processed successfully'
      };

    } catch (error) {
      console.error(`Payment failed for session ${session}:`, error);
      throw error.status ? error : {
        status: 500,
        code: 'PAYMENT_ERROR',
        message: 'An error occurred while processing payment'
      };
    }
  }

  async mockPaymentProviderAPI(order, paymentDetails) {
    // This is a mock implementation. In production, this would be replaced with actual payment provider API calls
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful transaction 90% of the time
        const success = Math.random() < 0.9;
        
        if (success) {
          resolve({
            success: true,
            transactionId: `TR${Date.now()}${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString()
          });
        } else {
          resolve({
            success: false,
            error: 'Transaction declined by payment provider'
          });
        }
      }, 1000); // Simulate network delay
    });
  }

  async refundTransaction(transactionId, amount) {
    try {
      // In a real implementation, this would make an API call to the payment provider
      const refundResult = await this.mockRefundAPI(transactionId, amount);

      if (refundResult.success) {
        return {
          success: true,
          refundId: refundResult.refundId,
          message: 'Refund processed successfully'
        };
      } else {
        throw new Error(refundResult.error || 'Refund processing failed');
      }
    } catch (error) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  async mockRefundAPI(transactionId, amount) {
    // This is a mock implementation. In production, this would be replaced with actual payment provider API calls
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful refund 95% of the time
        const success = Math.random() < 0.95;
        
        if (success) {
          resolve({
            success: true,
            refundId: `RF${Date.now()}${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toISOString()
          });
        } else {
          resolve({
            success: false,
            error: 'Refund declined by payment provider'
          });
        }
      }, 1000); // Simulate network delay
    });
  }
}

module.exports = new PaymentGateway();