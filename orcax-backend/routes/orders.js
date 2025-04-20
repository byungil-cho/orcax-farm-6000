// orcax-백엔드/routes/orders.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, phone, wallet, quantity, price } = req.body;
  console.log('신규 주문:', { name, phone, wallet, quantity, price });

  // 여기서 문자 보내기나 알림 로직 등을 수행할 수 있습니다

  return res.json({ success: true });
});

module.exports = router;
