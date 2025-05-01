const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  kakaoId: String,
  wallet: String,
  email: String,
  totalScore: { type: Number, default: 0 },
  spins: { type: Number, default: 5 },
});

module.exports = mongoose.model('User', userSchema);
