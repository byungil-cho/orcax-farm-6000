// routes/harvest.js
const express = require('express');
const router = express.Router();
const Harvest = require('../models/Harvest');

router.post('/', async (req, res) => {
  const { farmName, nickname, water, fertilizer, quantity } = req.body;
  const newHarvest = new Harvest({ farmName, nickname, water, fertilizer, quantity });
  await newHarvest.save();
  res.json({ success: true });
});

module.exports = router;
