// models/Product.js
const mongoose = require('mongoose');
// Schema for products created from potatoes. The API expects the following
// structure when creating and selling products.
const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  owner: { type: String, required: true },
  isSold: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
