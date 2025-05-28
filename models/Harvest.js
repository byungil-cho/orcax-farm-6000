// models/Harvest.js
const mongoose = require('mongoose');
const HarvestSchema = new mongoose.Schema({
  farmName: String,
  nickname: String,
  water: Number,
  fertilizer: Number,
  quantity: Number,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Harvest', HarvestSchema);
