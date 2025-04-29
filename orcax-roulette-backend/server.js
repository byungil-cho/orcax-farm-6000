const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch');

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new MongoClient(process.env.MONGO_URI);
let users;
let withdrawals;

async function start() {
  await client.connect();
  const db = client.db('orcax');
  users = db.collection('users');
  withdrawals = db.collection('withdrawals');
  console.log('✅ MongoDB 연결 완료');

  const PORT = process.env.PORT || 3020; // ✅ 포트 수정 완료
  app.listen(PORT, () => {
    console.log(`✅ 서버 실행 중 (포트 ${PORT})`);
  });
}

start();

// 🛠️ API: 회원가입
app.post('/api/register', async (req, res) => {
  const { wallet, email, password } = req.body;

  if (!wallet || !email || !password) {
    return res.status(400).json({ success: false, message: '❗ 필수 입력 누락' });
  }

  try {
    const existUser = await users.findOne({ wallet });
    if (existUser) {
      return res.status(400).json({ success: false, message: '❗ 이미 존재하는 지갑입니다.' });
    }

    await users.insertOne({ wallet, email, password, totalScore: 0 });
    res.json({ success: true, message: '✅ 회원가입 완료' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '❌ 서버 오류' });
  }
});

// 🛠️ API: 로그인
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await users.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ success: false, message: '❗ 이메일 또는 비밀번호가 틀립니다.' });
    }
    res.json({ success: true, wallet: user.wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '❌ 서버 오류' });
  }
});

// 🛠️ API: 카카오 로그인 콜백 (필요에 따라 추가)

// 🛠️ API: 점수 가져오기
app.get('/api/roulette/score', async (req, res) => {
  const { user } = req.query;

  try {
    const userData = await users.findOne({ wallet: user });
    if (!userData) {
      return res.json({ totalScore: 0 });
    }
    res.json({ totalScore: userData.totalScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ totalScore: 0 });
  }
});

// 🛠️ API: 점수 추가 저장
app.post('/api/roulette/addscore', async (req, res) => {
  const { user, addedScore } = req.body;

  try {
    await users.updateOne({ wallet: user }, { $inc: { totalScore: addedScore } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// 🛠️ API: 출금 신청
app.post('/api/roulette/withdraw', async (req, res) => {
  const { wallet, email } = req.body;

  if (!wallet || !email) {
    return res.status(400).json({ success: false, message: '❗ 지갑과 이메일 필수' });
  }

  try {
    const user = await users.findOne({ wallet });

    if (!user || user.totalScore < 50000) {
      return res.status(400).json({ success: false, message: '❗ 출금 가능 점수 부족' });
    }

    const request = {
      wallet,
      email,
      totalScore: user.totalScore,
      status: '대기중',
      requestedAt: new Date()
    };

    await withdrawals.insertOne(request);

    res.json({ success: true, message: '✅ 출금 신청 완료' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});
