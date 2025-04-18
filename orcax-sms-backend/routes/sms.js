const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const LOG_PATH = path.join(__dirname, '../data/sms-log.json');

// 🔐 인증 미들웨어
router.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== process.env.SMS_API_KEY) {
    return res.status(403).json({ message: '인증 실패: 잘못된 API 키입니다.' });
  }
  next();
});

// 📨 기본 문자 전송
router.post('/send', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({
      result_code: "0",
      message: '전화번호와 메시지를 입력하세요.'
    });
  }

  try {
    const payload = new URLSearchParams();
    payload.append('key', process.env.ALIGO_API_KEY);
    payload.append('user_id', process.env.ALIGO_USER_ID);
    payload.append('sender', process.env.ALIGO_SENDER);
    payload.append('receiver', to);
    payload.append('msg', message);
    payload.append('testmode_yn', process.env.ALIGO_TEST_MODE || 'Y');

    const response = await axios.post('https://apis.aligo.in/send/', payload);
    const result = response.data;

    const entry = {
      to,
      message,
      timestamp: new Date().toISOString(),
      result_code: result.result_code,
      aligo_msg_id: result.msg_id || null
    };

    // 로그 저장
    let log = [];
    if (fs.existsSync(LOG_PATH)) {
      const existing = fs.readFileSync(LOG_PATH, 'utf8');
      try { log = JSON.parse(existing); } catch (_) {}
    }
    log.unshift(entry);
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

    // 응답 전송
    if (result.result_code === "1" || result.result_code === 1) {
      res.json({
        result_code: result.result_code,
        message: result.message,
        aligo_msg_id: result.msg_id || null,
        to,
        timestamp: entry.timestamp
      });
    } else {
      res.status(400).json({
        result_code: result.result_code || "0",
        message: result.message || "문자 전송 실패"
      });
    }

  } catch (err) {
    console.error('문자 발송 오류:', err.message);
    res.status(500).json({
      result_code: "0",
      message: '서버 오류로 문자 전송 실패',
      error: err.message
    });
  }
});

// 🧾 NFT 주문 알림 문자 전송
router.post('/order-notice', async (req, res) => {
  const { name, phone, wallet, qty, nft } = req.body;
  if (!phone || !nft) {
    return res.status(400).json({ message: '필수 정보 누락' });
  }

  const message = `[OrcaX NFT 주문]
이름: ${name}
수량: ${qty}
지갑: ${wallet}
상품: ${nft}`;

  try {
    const payload = new URLSearchParams();
    payload.append('key', process.env.ALIGO_API_KEY);
    payload.append('user_id', process.env.ALIGO_USER_ID);
    payload.append('sender', process.env.ALIGO_SENDER);
    payload.append('receiver', phone);
    payload.append('msg', message);
    payload.append('testmode_yn', process.env.ALIGO_TEST_MODE || 'Y');

    const response = await axios.post('https://apis.aligo.in/send/', payload);
    res.json(response.data);
  } catch (err) {
    console.error('NFT 주문 문자 전송 실패:', err.message);
    res.status(500).json({ message: '문자 전송 실패', error: err.message });
  }
});

module.exports = router;
