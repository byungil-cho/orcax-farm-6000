const express = require('express');
const session = require('express-session');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
require('dotenv').config();

const app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_REST_API_KEY,
    callbackURL: "https://orcax-roulette-backend.onrender.com/auth/kakao/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

app.get('/', (req, res) => {
  res.send('<a href="/auth/kakao">카카오로 로그인</a>');
});

app.get('/auth/kakao',
  passport.authenticate('kakao')
);

app.get('/auth/kakao/callback',
  passport.authenticate('kakao', { failureRedirect: '/' }),
  function(req, res) {
    // 로그인 성공시 룰렛페이지로 이동
    res.redirect('https://orca-roulette-front.vercel.app/roulette');
  }
);

const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
  console.log(`서버 실행 중 (포트 ${PORT})`);
});
