require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const app = express();
const PORT = process.env.PORT || 3020;

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport 설정
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_CLIENT_ID,
  callbackURL: `${process.env.KAKAO_REDIRECT_URI}/auth/kakao/callback`
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// 카카오 로그인 요청
app.get('/auth/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
app.get('/auth/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/roulette.html?loginSuccess=true'); 
    // 로그인 성공 후 룰렛 2회차 자동 실행
  }
);

// 로그아웃
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// public 폴더에서 파일 제공
app.use(express.static('public'));

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: 포트 ${PORT}`);
});
