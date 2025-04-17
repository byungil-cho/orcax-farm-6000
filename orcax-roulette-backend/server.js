const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3010;
const dataFile = path.join(__dirname, 'spins.json');

app.use(cors());
app.use(express.json());

// POST /api/roulette/record
app.post('/api/roulette/record', (req, res) => {
  const { user, reward, timestamp, score } = req.body;

  if (!user || !reward || !timestamp) {
    return res.status(400).json({ success: false, message: "필수 값 누락" });
  }

  let records = [];
  if (fs.existsSync(dataFile)) {
    records = JSON.parse(fs.readFileSync(dataFile));
  }

  records.push({ user, reward, score: score || 0, timestamp });
  fs.writeFileSync(dataFile, JSON.stringify(records, null, 2));

  res.json({ success: true, message: "룰렛 결과 저장 완료" });
});

// GET /api/roulette/history
app.get('/api/roulette/history', (req, res) => {
  if (!fs.existsSync(dataFile)) return res.json([]);
  const records = JSON.parse(fs.readFileSync(dataFile));
  res.json(records.slice(-10).reverse()); // 최근 10개, 최신순
});

app.listen(PORT, () => {
  console.log(`🎡 OrcaX 룰렛 서버 작동 중! http://localhost:${PORT}`);
});
