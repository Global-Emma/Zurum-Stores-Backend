const mongoose = require('mongoose');

const deliveryOptionsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  deliveryDuration: {
    type: Number,
    required: true
  },
  priceCents: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('DeliveryOptions', deliveryOptionsSchema);