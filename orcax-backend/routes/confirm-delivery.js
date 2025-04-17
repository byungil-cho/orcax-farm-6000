// routes/confirm-delivery.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
  const { buyerName, buyerPhone, qty } = req.body;

  if (!buyerPhone || !qty) {
    return res.status(400).json({ success: false, message: '정보 부족' });
  }

  const messages = [
    {
      to: buyerPhone,
      message: `[OrcaX] ${qty}장의 NFT 쿠폰이 발송 완료되었습니다. 지갑을 확인해 주세요.`
    },
    {
      to: process.env.SELLER_PHONE,
      message: `[OrcaX] ${buyerName}님께 ${qty}장 NFT 발송 완료 처리되었습니다.`
    }
  ];

  try {
    const promises = messages.map((msg) =>
      axios.post('http://localhost:3000/api/sms/send', msg, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.SMS_API_KEY
        }
      })
    );

    await Promise.all(promises);
    res.json({ success: true, message: '양측에게 문자 전송 완료' });

  } catch (err) {
    console.error('전송 실패:', err.message);
    res.status(500).json({ success: false, message: '문자 발송 중 오류', error: err.message });
  }
});

module.exports = router;
