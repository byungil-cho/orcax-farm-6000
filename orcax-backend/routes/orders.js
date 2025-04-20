const express = require('express');
const axios = require('axios');
const router = express.Router();

// 필요 시 경로 수정
const { sendTelegramMessage } = require('../utils/telegram'); // or wherever it lives

// 주문 처리 라우터
router.post('/order', async (req, res) => {
  const order = req.body;

  try {
    // 문자 발송 요청 (3003번 서버로 전달)
    await axios.post('http://localhost:3003/api/sms/order-notice', order);

    // 텔레그램 메시지 발송
    await sendTelegramMessage(`
📢 [OrcaX 주문 알림]
🧑‍💻 이름: ${order.name}
📦 수량: ${order.qty}
📱 연락처: ${order.phone}
🪙 지갑: ${order.wallet}
⏰ 시간: ${new Date().toLocaleString()}
    `);

    res.json({ success: true });
  } catch (err) {
    console.error('알림 전송 실패:', err.message);
    res.status(500).json({ error: '알림 전송 실패' });
  }
});
module.exports = router;

