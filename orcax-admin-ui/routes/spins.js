const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sendTelegramMessage = require('../utils/telegram');

router.post('/', (req, res) => {
  const spinData = req.body;
  const filePath = path.join(__dirname, '../data/spins.json');
  const spins = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : [];

  spins.push(spinData);
  fs.writeFileSync(filePath, JSON.stringify(spins, null, 2));

  // 텔레그램 알림
  const message = `🎰 [룰렛] ${spinData.name || '익명'} 님이 ${spinData.score || 0} ORCX를 획득했습니다.`;
  sendTelegramMessage(message);

  res.json({ success: true });
});

module.exports = router;
