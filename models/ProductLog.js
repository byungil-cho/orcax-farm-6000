const mongoose = require('mongoose');

const productLogSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  product: { type: String, required: true },
  quantity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductLog', productLogSchema);
