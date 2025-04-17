// routes/api/notices.js
const express = require('express');
const router = express.Router();

let notices = [];

router.get('/', (req, res) => {
  res.json(notices);
});

router.post('/', (req, res) => {
  const { text, active, timestamp } = req.body;
  if (!text || !timestamp) {
    return res.status(400).json({ error: '입력값이 부족함' });
  }
  notices.push({ text, active, timestamp });
  res.status(201).json({ message: '저장 성공' });
});

module.exports = router;
