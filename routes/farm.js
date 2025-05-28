// routes/farm.js
const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');

router.post('/', async (req, res) => {
  const { nickname, farmName } = req.body;
  const newFarm = new Farm({ nickname, farmName });
  await newFarm.save();
  res.json({ success: true });
});

module.exports = router;
