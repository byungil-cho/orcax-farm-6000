const mongoose = require('mongoose');

// Log of product related actions such as processing or selling. Each entry keeps
// track of who performed the action and the price at that time.
const productLogSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  action: { type: String, required: true },
  owner: { type: String, required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductLog', productLogSchema);
