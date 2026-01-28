const mongoose = require('mongoose');

const refreshSchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true} );

refreshSchema.index({expiresAt: 1}, {expiresAfterSeconds: 0})

module.exports = mongoose.model('RefreshToken', refreshSchema)