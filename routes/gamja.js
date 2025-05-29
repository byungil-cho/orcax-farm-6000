
const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');

router.get('/gamja', async (req, res) => {
  try {
    const farmName = req.query.farm || "범고래X 농장";

    const farm = await Farm.findOne({ name: farmName });

    if (!farm) {
      // 농장이 없다면 초기값 반환
      return res.json({
        potatoes: 0,
        harvested: 0,
        items: []
      });
    }

    res.json({
      potatoes: farm.potatoes || 0,
      harvested: farm.harvested || 0,
      items: farm.items || []
    });
  } catch (error) {
    console.error("❌ /api/gamja 오류:", error);
    res.status(500).json({ error: "서버 오류 발생" });
  }
});

module.exports = router;
