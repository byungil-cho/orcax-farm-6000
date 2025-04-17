// 📢 공지사항 등록 및 조회
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const noticePath = path.join(__dirname, '../data/notice.json');

// ✅ 텔레그램 알림 모듈 추가
const sendTelegramMessage = require('../utils/telegram');

router.get('/', (req, res) => {
  const notices = fs.existsSync(noticePath)
    ? JSON.parse(fs.readFileSync(noticePath, 'utf-8'))
    : [];
  res.json(notices);
});

router.post('/', (req, res) => {
  const { text, show } = req.body;

  if (!text || typeof show !== 'boolean') {
    return res.status(400).json({ success: false, message: '잘못된 요청입니다.' });
  }

  const newNotice = {
    text,
    show,
    time: new Date().toISOString()
  };

  const notices = fs.existsSync(noticePath)
    ? JSON.parse(fs.readFileSync(noticePath, 'utf-8'))
    : [];

  notices.unshift(newNotice);
  fs.writeFileSync(noticePath, JSON.stringify(notices, null, 2));

  // 📲 텔레그램 알림 발송
  sendTelegramMessage(`📢 [공지사항 등록됨]\n\n${text}`);

  res.json({ success: true });
});

module.exports = router;
