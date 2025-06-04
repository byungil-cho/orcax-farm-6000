
const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
  kakaoId: String,
  nickname: String,
  water: Number,
  fertilizer: Number,
  token: Number,
  lastFreeTime: Date,
  freeFarmCount: Number,
  seedPotato: Number,
  potatoCount: Number
});

module.exports = mongoose.model("Farm", farmSchema);
