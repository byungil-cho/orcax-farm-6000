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
let users;

client.connect().then(() => {
  const db = client.db('orcax');
  spins = db.collection('spins');
  users = db.collection('users');
  console.log('✅ MongoDB 연결 성공 (orcax)');
}).catch(err => {
  console.error('❌ MongoDB 연결 실패:', err);
});

// 기본 루트
app.get('/', (req, res) => {
  res.send('🌀 OrcaX 룰렛 서버 살아있다! (포트 3020)');
});

// 🐳 회원가입 API
app.post('/api/register', async (req, res) => {
  try {
    const { wallet, email } = req.body;

    if (!wallet && !email) {
      return res.status(400).json({ success: false, message: "❌ 지갑주소나 이메일이 필요해요!" });
    }

    const identifier = wallet || email;

    // 이미 존재하는지 확인
    const existing = await users.findOne({ $or: [{ wallet }, { email }] });
    if (existing) {
      return res.json({ success: true, message: "✅ 이미 가입된 유저예요!", user: existing });
    }

    const newUser = {
      wallet: wallet || null,
      email: email || null,
      createdAt: new Date()
    };

    const result = await users.insertOne(newUser);

    res.json({ success: true, message: "✅ 회원가입 완료!", user: newUser });
  } catch (err) {
    console.error('❌ 회원가입 에러:', err);
    res.status(500).json({ success: false, message: "❌ 서버 에러" });
  }
});

// 점수 기록 저장
app.post('/api/roulette/record', async (req, res) => {
  try {
    const { user, reward, score, timestamp } = req.body;

    if (!user || !reward || !timestamp) {
      return res.status(400).json({ success: false, message: "❌ 필수 값 누락" });
    }

    await spins.insertOne({ user, reward, score, timestamp });
    res.json({ success: true, message: "✅ 룰렛 결과 저장 완료" });
  } catch (err) {
    console.error('❌ DB 저장 중 에러:', err);
    res.status(500).json({ success: false, message: "❌ 서버 에러" });
  }
});

// 기록 조회
app.get('/api/roulette/history', async (req, res) => {
  try {
    const userFilter = req.query.user;
    const query = userFilter ? { user: userFilter } : {};
    const records = await spins.find(query).sort({ timestamp: -1 }).limit(10).toArray();
    res.json(records);
  } catch (err) {
    console.error('❌ 기록 조회 에러:', err);
    res.status(500).json({ success: false, message: "❌ 조회 실패" });
  }
});

// 고래 랭킹
app.get('/api/roulette/rank', async (req, res) => {
  try {
    const rankings = await spins.aggregate([
      { $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          plays: { $sum: 1 }
      }},
      { $sort: { totalScore: -1 } },
      { $limit: 10 }
    ]).toArray();

    res.json(rankings);
  } catch (err) {
    console.error('❌ 랭킹 조회 에러:', err);
    res.status(500).json({ success: false, message: "❌ 랭킹 조회 실패" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ OrcaX 룰렛 서버 실행 중: http://localhost:${PORT}`);
});
