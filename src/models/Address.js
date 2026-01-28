const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
