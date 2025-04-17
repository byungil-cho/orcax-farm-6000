// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const router = express.Router();
require('dotenv').config();

const LOG_PATH = path.join(__dirname, '../data/login-log.json');

function logEvent(type, ip) {
  const entry = {
    type,
    ip,
    timestamp: new Date().toISOString()
  };
  let logs = [];
  if (fs.existsSync(LOG_PATH)) {
    try {
      logs = JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
    } catch (_) {}
  }
  logs.unshift(entry);
  fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2));
}

router.post('/login', async (req, res) => {
  const { password } = req.body;
  const clientIP = req.ip;

  if (!password || !process.env.ADMIN_HASH) {
    return res.status(400).json({ success: false, message: '비밀번호 또는 설정 누락' });
  }

  const isValid = await bcrypt.compare(password, process.env.ADMIN_HASH);
  if (isValid) {
    req.session.authenticated = true;
    logEvent('login', clientIP);
    return res.json({ success: true, message: '로그인 성공' });
  } else {
    logEvent('failed-login', clientIP);
    return res.status(401).json({ success: false, message: '비밀번호가 틀렸습니다.' });
  }
});

router.post('/logout', (req, res) => {
  const clientIP = req.ip;
  req.session.destroy(() => {
    logEvent('logout', clientIP);
    res.json({ success: true, message: '로그아웃 되었습니다.' });
  });
});

module.exports = router;
