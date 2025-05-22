const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3080;

app.use(cors());
app.use(express.json());

app.post('/api/notify', (req, res) => {
  const { name, phone, wallet, quantity, nft } = req.body;
  console.log(`[ORDER] ${name} (${phone}) - ${wallet} / ${quantity} x ${nft}`);
  res.json({ success: true, message: '주문 접수 완료!' });
});

app.listen(PORT, () => {
  console.log(`✅ OrcaX Shop Backend running on http://localhost:${PORT}`);
});