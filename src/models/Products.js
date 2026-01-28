const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  priceCents: {
    type: Number,
    required: true,
    min: 0
  },
  keywords:[
    {
      type: String
    }
  ],
  image: {
    type: String,
    required: true
  },
  rating: {
    type: Object,
    default: {},
  }
}, {timestamps: true});

module.exports = mongoose.model('Product', productSchema);