// models/Product.js
const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  farmName: String,
  name: String,
  count: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Product', ProductSchema);
