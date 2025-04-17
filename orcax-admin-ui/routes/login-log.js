// routes/login-log.js
const express = require('express');
const router = express.Router();

// 🧾 로그인 로그 저장용 테스트 엔드포인트
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Login log route is working!' });
});

module.exports = router;
