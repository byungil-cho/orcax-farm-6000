
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const Farm = require('./models/Farm');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(session({ secret: 'orcax', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const PORT = 6000;

// Mongo 연결
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB 연결 성공');
}).catch(err => {
  console.error('MongoDB 연결 실패:', err);
});

// Passport 설정
console.log("💡 KAKAO REST API KEY:", process.env.KAKAO_REST_API_KEY);

passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_REST_API_KEY,
  callbackURL: "/auth/kakao/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await Farm.findOne({ nickname: profile.username });
    if (!user) {
      user = await Farm.create({
        nickname: profile.username,
        water: 10,
        fertilizer: 10,
        token: 5,
        lastFreeTime: new Date(),
        freeFarmCount: 2,
        seedPotato: 0,
        potatoCount: 0
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await Farm.findById(id);
  done(null, user);
});

// 라우터
app.get("/auth/kakao", passport.authenticate("kakao"));
app.get("/auth/kakao/callback", passport.authenticate("kakao", {
  failureRedirect: "/fail"
}), (req, res) => {
  res.redirect(`/gamja-main.html?nickname=${req.user.nickname}`);
});

app.get("/api/userdata", async (req, res) => {
  const nickname = req.query.nickname;
  const user = await Farm.findOne({ nickname });
  if (!user) return res.json({ success: false });
  res.json({ success: true, user });
});

app.listen(PORT, () => {
  console.log(`서버 포트 ${PORT}에서 실행 중`);
});
