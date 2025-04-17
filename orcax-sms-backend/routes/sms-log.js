const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const LOG_PATH = path.join(__dirname, '../data/sms-log.json');

// 문자 로그 가져오기
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return res.json([]); // 로그 파일 없으면 빈 배열
    }

    const data = fs.readFileSync(LOG_PATH, 'utf8');
    const logs = JSON.parse(data);
    res.json(logs);
  } catch (err) {
    console.error('📛 문자 로그 불러오기 오류:', err.message);
    res.status(500).json({ error: '서버 오류로 로그 불러오기 실패' });
  }
});

module.exports = router;

