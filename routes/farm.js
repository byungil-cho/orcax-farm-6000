const express = require('express');
const router = express.Router();
const ProductLog = require('../models/ProductLog');

router.post('/save', async (req, res) => {
  try {
    const { nickname, product, quantity } = req.body;
    if (!nickname || !product || !quantity) {
      return res.status(400).json({ error: "필수 항목 누락" });
    }
    const newLog = new ProductLog({ nickname, product, quantity });
    await newLog.save();
    res.json({ success: true, message: "감자 저장 성공!" });
  } catch (err) {
    console.error("감자 저장 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
