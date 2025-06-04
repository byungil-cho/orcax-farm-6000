
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const KakaoStrategy = require("passport-kakao").Strategy;
const Farm = require("./models/Farm");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({ secret: "orcax", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch(err => console.error("MongoDB 연결 실패:", err));

passport.use(new KakaoStrategy({
  clientID: process.env.KAKAO_REST_API_KEY,
  callbackURL: "/auth/kakao/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const kakaoId = profile.id;
  const nickname = profile._json.properties.nickname;

  let user = await Farm.findOne({ kakaoId });
  if (!user) {
    user = await Farm.create({
      kakaoId,
      nickname,
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
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await Farm.findById(id);
  done(null, user);
});

app.get("/auth/kakao", passport.authenticate("kakao"));

app.get("/auth/kakao/callback", passport.authenticate("kakao", {
  failureRedirect: "/login"
}), (req, res) => {
  res.redirect(`/gamja-main.html?nickname=${encodeURIComponent(req.user.nickname)}`);
});

app.get("/api/userdata", async (req, res) => {
  const nickname = req.query.nickname;
  const user = await Farm.findOne({ nickname });
  if (!user) return res.json({ success: false });
  res.json({ success: true, user });
});

app.get("/api/status", (req, res) => {
  res.send("감자 서버 작동 중");
});

app.listen(6000, () => {
  console.log("서버 포트 6000에서 실행 중");
});
