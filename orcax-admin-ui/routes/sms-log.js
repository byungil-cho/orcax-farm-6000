const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../data/sms-log.json');

// 문자 로그 조회 API
router.get('/', (req, res) => {
  fs.readFile(LOG_PATH, 'utf8', (err, data) => {
    if (err) return res.json([]);
    try {
      const logs = JSON.parse(data);
      res.json(logs);
    } catch (e) {
      res.json([]);
    }
  });
});

module.exports = router;
