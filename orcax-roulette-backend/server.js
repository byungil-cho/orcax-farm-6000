const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const session = require('express-session');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new MongoClient(process.env.MONGO_URI);
let users;
let withdrawals;

// 세션 설정
app.use(session({
  secret: 'orcax_secret', // 아무 문자열
  resave: false,
  saveUninitialized: false
}));

// 패스포트 초기화
app.use(passport.initialize());
app.use(passport.session());

// 패스포트 직렬화/역직렬화
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// 카카오 로그인 전략
passport.use(new KakaoStrategy({
    clientID: '1552f2a7cc6e54adb10bddcb6fe3f991', // 실장님이 주신 카카오 REST API 키
    callbackURL: 'https://orcax-roulette-backend.onrender.com/auth/kakao/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('카카오 프로필:', profile);
    done(null, profile);
  }
));

// 카카오 로그인 요청
app.get('/auth/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
app.get('/auth/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/auth.html'
}), (req, res) => {
  res.redirect('/roulette.html');
});

// 기본 API
async function start() {
  await client.connect();
  const db = client.db('orcax');
  users = db.collection('users');
  withdrawals = db.collection('withdrawals');
  console.log('✅ MongoDB 연결 성공');

  app.listen(3020, () => {
    console.log('✅ 서버 실행 중 (포트 3020)');
  });
}
start();

// 회원가입 API
app.post('/api/register', async (req, res) => {
  const { email, password, wallet } = req.body;
  const exists = await users.findOne({ email });
  if (exists) return res.json({ success: false, message: '이미 존재하는 이메일입니다.' });

  await users.insertOne({ email, password, wallet, totalScore: 0 });
  res.json({ success: true });
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await users.findOne({ email, password });
  if (user) {
    res.json({ success: true, wallet: user.wallet });
  } else {
    res.json({ success: false, message: '이메일 또는 비밀번호 오류' });
  }
});

// 비밀번호 찾기 API
app.post('/api/find-password', async (req, res) => {
  const { wallet } = req.body;
  const user = await users.findOne({ wallet });
  if (user) {
    res.json({ success: true, password: user.password });
  } else {
    res.json({ success: false, message: '지갑주소로 찾을 수 없습니다.' });
  }
});

// 점수 조회 API
app.get('/api/roulette/score', async (req, res) => {
  const { user } = req.query;
  const doc = await users.findOne({ wallet: user });
  res.json({ totalScore: doc ? doc.totalScore : 0 });
});

// 점수 추가 API
app.post('/api/roulette/addscore', async (req, res) => {
  const { user, addedScore } = req.body;
  await users.updateOne({ wallet: user }, { $inc: { totalScore: addedScore } }, { upsert: true });
  res.json({ success: true });
});

// 출금 신청 API
app.post('/api/roulette/withdraw', async (req, res) => {
  const { wallet, email } = req.body;
  const user = await users.findOne({ wallet });
  if (!user || (user.totalScore || 0) < 50000) {
    return res.json({ success: false, message: '출금할 수 있는 점수가 부족합니다.' });
  }

  await withdrawals.insertOne({
    wallet,
    email,
    totalScore: user.totalScore,
    status: '대기중',
    requestedAt: new Date()
  });

  res.json({ success: true, message: '출금 신청 완료' });
});
