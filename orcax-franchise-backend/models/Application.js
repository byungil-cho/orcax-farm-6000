// models/Application.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  name: String,
  phone: String,
  bizNo: String,
  region: String,
  address: String,
  category: String,
  filePath: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", applicationSchema);
