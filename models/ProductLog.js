const mongoose = require('mongoose');

const productLogSchema = new mongoose.Schema({
  productName: String,
  action: String,
  owner: String,
  price: Number,
  timestamp: Date
});

module.exports = mongoose.model('ProductLog', productLogSchema);