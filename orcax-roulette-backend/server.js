const express = require('express');
const app = express();
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 세션 설정
app.use(session({
  secret: 'orcax_secret_key', // 원하는 시크릿 키 사용하세요
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Kakao OAuth 설정
passport.use(new KakaoStrategy({
  clientID: '1552f2a7cc6e54adb10bddcb6fe3f991',  // ✅ 실장님 카카오 REST API 키 적용
  callbackURL: 'https://orcax-roulette-backend.onrender.com/auth/kakao/callback'
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// 카카오 로그인 시작
app.get('/auth/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백
app.get('/auth/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/',
  }),
  (req, res) => {
    // 로그인 성공하면 룰렛 페이지로 리다이렉트
    res.redirect('/roulette.html');
  }
);

// 서버 포트 설정
const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 (포트 ${PORT})`);
});
