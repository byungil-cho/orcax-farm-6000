const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: String,
  owner: String,
  isSold: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);