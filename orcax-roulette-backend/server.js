const express = require('express');
const session = require('express-session');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
require('dotenv').config();

const app = express();

// 세션 설정
app.use(session({
  secret: 'orcax_secret_key', // 비밀키 (아무거나)
  resave: false,
  saveUninitialized: true
}));

// passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// passport serialize/deserialize
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Kakao 로그인 전략 설정
passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_REST_API_KEY, // .env 파일에서 가져옴
  callbackURL: "https://orcax-roulette-backend.onrender.com/auth/kakao/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// "/" 루트 접근 → 카카오 로그인 시작
app.get('/', passport.authenticate('kakao'));

// 카카오 로그인 콜백 처리
app.get('/auth/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/login-fail' }),
  (req, res) => {
    // 로그인 성공하면 룰렛 페이지로 이동
    res.redirect('https://orcax-roulette-backend.onrender.com/roulette.html');
});

// 로그인 실패
app.get('/login-fail', (req, res) => {
  res.send('❌ 로그인 실패! 다시 시도해 주세요.');
});

// 서버 실행
const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 (포트 ${PORT})`);
});
