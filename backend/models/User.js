const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, default: null },
  city: { type: String, default: null },
  // Digital wallet for POC. Replace with Razorpay integration references later.
  walletBalance: { type: Number, default: 100000.00 }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
