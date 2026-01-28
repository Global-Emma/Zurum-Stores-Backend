const mongoose = require('mongoose');
const Product = require('./Products');
const Users = require('./Users');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Users'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  Reference: {
    type: String,
  },
  orderItem: [
    {
      productId: {
        type: String,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        default: 1
      },
      deliveryOptionsId: {
        type: String,
        default: '1'
      },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);