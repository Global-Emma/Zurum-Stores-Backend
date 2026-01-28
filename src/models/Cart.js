const mongoose = require('mongoose');
const Product = require('./Products');

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'Users'
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true, 
  },
  deliveryOptionsId: {
    type: String,
    required: true
  },
})

module.exports = mongoose.model('Cart', cartSchema);