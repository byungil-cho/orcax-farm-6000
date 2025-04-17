// 경로/api/notices.js
const express = require('express');
const router = express.Router();

// 하자: 메모리상 임시 데이터 저장소
let notices = [];

// 📥 공지사항 가져오기 (GET /api/notices)
router.get('/', (req, res) => {
  res.json(notices);
});

// 📤 공지사항 등록 (POST /api/notices)
router.post('/', (req, res) => {
  const { text, active, timestamp } = req.body;

  if (!text || !timestamp) {
    return res.status(400).json({ error: '입력값이 부족함' });
  }

  notices.push({ text, active, timestamp });
  res.status(201).json({ message: '저장 성공' });
});

module.exports = router;

