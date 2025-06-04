const mongoose = require('mongoose');

// Schema definition for the main Farm collection.
// The API routes rely on a number of fields such as water, fertilizer and token
// but the original schema only contained `name` and `potatoes`. Because of this
// mismatch newly created documents were missing most of the expected
// properties. Mongoose drops unknown fields when `strict` mode is enabled
// (default), so routes reading/writing those fields behaved incorrectly.

const farmSchema = new mongoose.Schema({
  // unique nickname for the farm owner
  nickname: { type: String, required: true, unique: true },

  // resource counters used throughout the API
  water: { type: Number, default: 0 },
  fertilizer: { type: Number, default: 0 },
  token: { type: Number, default: 0 },

  // farming cooldown management
  lastFreeTime: { type: Date, default: Date.now },
  freeFarmCount: { type: Number, default: 0 },

  // inventory fields
  seedPotato: { type: Number, default: 0 },
  potatoCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Farm', farmSchema);
