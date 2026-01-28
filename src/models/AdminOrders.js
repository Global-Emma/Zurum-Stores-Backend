const mongoose = require('mongoose')
const Product = require('./Products')
const Users = require('./Users')

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  productIds: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1
      },
      deliveryOptionsId: {
        type: String,
        default: '1'
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
    default: 'pending'
  }
}, {timestamps: true})

module.exports = mongoose.model('Admin', adminSchema)