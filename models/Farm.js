// models/Farm.js
const mongoose = require('mongoose');
const FarmSchema = new mongoose.Schema({
  nickname: String,
  farmName: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Farm', FarmSchema);
