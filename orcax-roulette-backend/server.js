const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3020;

app.use(cors());
app.use(express.json());

// MongoDB 연결
const client = new MongoClient(process.env.MONGO_URI);
let spins;

client.connect().then(() => {
  const db = client.db('orcax');
  spins = db.collection('spins');
  console.log('✅ MongoDB 연결 성공 (orcax.spins)');
}).catch(err => {
  console.error('❌ MongoDB 연결 실패:', err);
});

// 8시간 블럭 계산 함수
function getCurrentBlockStart() {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + 9); // 한국시간 기준으로 맞춤

  const hour = now.getHours();
  let startHour = 0;
  if (hour < 8) startHour = 0;
  else if (hour < 16) startHour = 8;
  else startHour = 16;

  const blockStart = new Date(now);
  blockStart.setHours(startHour, 0, 0, 0);
  return blockStart;
}

// 기본 확인용 루트
app.get('/', (req, res) => {
  res.send('🌀 OrcaX 룰렛 서버가 살아있다! (포트 3020)');
});

// 룰렛 기록 저장
app.post('/api/roulette/record', async (req, res) => {
  try {
    const { user, reward, score, timestamp } = req.body;

    if (!user || !reward || !timestamp) {
      return res.status(400).json({ success: false, message: "❌ 필수 값 누락" });
    }

    // 8시간 블럭 기준 체크
    const blockStart = getCurrentBlockStart();

    const spinCount = await spins.countDocuments({
      user,
      timestamp: { $gte: blockStart }
    });

    if (spinCount >= 5) {
      return res.status(429).json({ success: false, message: "⛔ 이번 시간대에 가능한 룰렛 5회 모두 사용했습니다." });
    }

    // 기록 저장
    await spins.insertOne({ user, reward, score, timestamp: new Date(timestamp) });

    res.json({ success: true, message: "✅ 룰렛 결과 저장 완료" });
  } catch (err) {
    console.error('❌ 서버 에러:', err);
    res.status(500).json({ success: false, message: "❌ 서버 에러" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ OrcaX 룰렛 서버 실행 중: http://localhost:${PORT}`);
});
