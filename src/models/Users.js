const mongoose = require('mongoose');
const argon2 = require('argon2');
const Cart = require('./Cart')
const Order = require('./Orders')

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: Number,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  googleId: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: 'user'
  },
  cartIds: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
    }
  ],
  orderIds: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
  ],
}, { timestamps: true })

userSchema.index({ username: 'text', email: 'text' });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      this.password = await argon2.hash(this.password)
      return next
    } catch (error) {
      return error
    }
  }

})

userSchema.methods.comparePassword = async function (passwordInput) {
  try {
    return await argon2.verify(this.password, passwordInput);
  } catch (err) {
    console.error("Password comparison error:", err);
    return false; // 👈 prevents login endpoint from 500-ing
  }
};

module.exports = mongoose.model('Users', userSchema)

