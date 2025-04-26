const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3020;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // ✅ static 파일 공개 추가 (auth.html, roulette.html 접속 가능)

const client = new MongoClient(process.env.MONGO_URI);
let spins;
let scores;
let users;

client.connect().then(() => {
  const db = client.db('orcax');
  spins = db.collection('spins');
  scores = db.collection('scores');
  users = db.collection('users');
  console.log('✅ MongoDB 연결 성공 (orcax.spins, orcax.scores, orcax.users)');
}).catch(err => {
  console.error('❌ MongoDB 연결 실패:', err);
});

function getCurrentBlockStart() {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + 9);

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
  res.send('🌀 OrcaX 룰렛 서버 실행 중 (3020포트)');
});

// 룰렛 기록 저장
app.post('/api/roulette/record', async (req, res) => {
  try {
    const { user, reward, score, timestamp } = req.body;

    if (!user || reward === undefined || !timestamp) {
      return res.status(400).json({ success: false, message: "❌ 필수 값 누락" });
    }

    const blockStart = getCurrentBlockStart();

    const spinCount = await spins.countDocuments({
      user,
      timestamp: { $gte: blockStart }
    });

    if (spinCount >= 5) {
      return res.status(429).json({ success: false, message: "⛔ 이번 시간대 스핀 5회 초과" });
    }

    await spins.insertOne({ user, reward, score, timestamp: new Date(timestamp) });
    res.json({ success: true, message: "✅ 룰렛 기록 저장 완료" });
  } catch (err) {
    console.error('❌ 룰렛 기록 저장 실패:', err);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 총 점수 조회
app.get('/api/roulette/score', async (req, res) => {
  try {
    const user = req.query.user;
    if (!user) {
      return res.status(400).json({ success: false, message: "❌ 사용자 정보 없음" });
    }

    const userScores = await scores.findOne({ user });
    res.json({ success: true, totalScore: userScores ? userScores.totalScore : 0 });
  } catch (err) {
    console.error('❌ 점수 조회 실패:', err);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 점수 추가 저장
app.post('/api/roulette/addscore', async (req, res) => {
  try {
    const { user, addedScore } = req.body;
    if (!user || addedScore === undefined) {
      return res.status(400).json({ success: false, message: "❌ 필수 값 누락" });
    }

    const updateResult = await scores.updateOne(
      { user },
      { $inc: { totalScore: addedScore } },
      { upsert: true }
    );

    res.json({ success: true, message: "✅ 점수 추가 완료" });
  } catch (err) {
    console.error('❌ 점수 추가 실패:', err);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 🧩 [회원가입]
app.post('/api/register', async (req, res) => {
  try {
    const { wallet, email, password } = req.body;
    if (!wallet || !email || !password) {
      return res.status(400).json({ success: false, message: "❌ 모든 항목을 입력하세요." });
    }

    const exists = await users.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "❌ 이미 가입된 이메일입니다." });
    }

    await users.insertOne({ wallet, email, password, createdAt: new Date() });
    res.json({ success: true, message: "✅ 가입 완료" });
  } catch (err) {
    console.error('❌ 회원가입 서버 오류:', err);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 🧩 [로그인]
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "❌ 이메일과 비밀번호 입력 필요" });
    }

    const user = await users.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ success: false, message: "❌ 이메일 또는 비밀번호 불일치" });
    }

    res.json({ success: true, wallet: user.wallet });
  } catch (err) {
    console.error('❌ 로그인 서버 오류:', err);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 🧩 [비밀번호 찾기]
app.get('/api/find-password', async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet) {
      return res.status(400).json({ success: false, message: "❌ 지갑주소 입력 필요" });
    }

    const user = await users.findOne({ wallet });
    if (!user) {
      return res.status(400).json({ success: false, message: "❌ 해당 지갑주소가 없습니다." });
    }

    res.json({ success: true, password: user.password });
  } catch (err) {
    console.error('❌ 비밀번호 찾기 서버 오류:', err);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ OrcaX 서버 실행 중: http://localhost:${PORT}`);
});
