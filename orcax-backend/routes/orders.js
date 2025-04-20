const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { name, phone, wallet, quantity, price } = req.body;

  console.log('📦 주문 수신됨:', { name, phone, wallet, quantity, price });

  // 여기서 SMS 전송, DB 저장, NFT 처리 등 백엔드 로직 수행 가능
  // 예시로는 성공 메시지만 반환
  res.json({ success: true });
});

module.exports = router;
