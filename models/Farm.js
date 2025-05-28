
const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: { type: String, required: true },
  potatoes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Farm', farmSchema);
