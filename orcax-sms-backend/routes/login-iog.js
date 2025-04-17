// routes/login-log.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const LOG_PATH = path.join(__dirname, '../data/login-log.json');

router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return res.json([]);
    }
    const data = fs.readFileSync(LOG_PATH, 'utf8');
    const logs = JSON.parse(data);
    res.json(logs);
  } catch (err) {
    console.error('로그인 로그 불러오기 실패:', err.message);
    res.status(500).json({ error: '로그인 로그 로딩 중 오류 발생' });
  }
});

module.exports = router;
