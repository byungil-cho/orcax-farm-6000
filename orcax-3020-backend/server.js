// server.js (3020 버전)
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const cors = require('cors');

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'orcax-3020-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'none',
    secure: true
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  done(null, {
    id,
    email: 'test@example.com',
    wallet: id.toString(),
  });
});

passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  callbackURL: '/auth/kakao/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const kakaoId = profile.id;
    const email = profile._json.kakao_account?.email || '';
    const wallet = kakaoId.toString();
    const user = { id: kakaoId, email, wallet };
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// 카카오 로그인
app.get('/auth/kakao', passport.authenticate('kakao'));
app.get('/auth/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/login-failed'
}), (req, res) => {
  res.redirect('/roulette.html');
});

// 로그인 확인
app.get('/api/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: '로그인 필요' });
  res.json({ user: { email: req.user.email, wallet: req.user.wallet } });
});

// 점수 저장 (더미)
app.post('/api/save-score', (req, res) => {
  console.log('[테스트 저장] score:', req.body);
  res.json({
    success: true,
    data: {
      totalScore: 9999
    }
  });
});

// 점수 불러오기 (더미)
app.get('/api/get-score', (req, res) => {
  res.json({
    success: true,
    score: 1234,
    spins: 5
  });
});

// 스핀 요청 (더미)
app.post('/api/spin', (req, res) => {
  res.json({
    success: true,
    spins: 4,
    totalScore: 1200
  });
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('🛳️ OrcaX 3020 테스트 서버 정상 작동 중입니다.');
});

const PORT = 3020;
app.listen(PORT, () => console.log(`🛳️ OrcaX 3020 테스트 서버 ${PORT}번에서 대기 중`));
