// routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.post('/', async (req, res) => {
  const { farmName, name } = req.body;
  const existing = await Product.findOne({ farmName, name });
  if (existing) {
    existing.count++;
    await existing.save();
    res.json({ success: true, name, isNew: false });
  } else {
    const newProduct = new Product({ farmName, name });
    await newProduct.save();
    res.json({ success: true, name, isNew: true });
  }
});

router.get('/inventory', async (req, res) => {
  const { farmName } = req.query;
  const items = await Product.find({ farmName });
  const potatoes = items.reduce((sum, item) => item.name.includes("감자") ? sum + item.count : sum, 0);
  res.json({ potatoes, harvested: 0, items });
});

module.exports = router;
