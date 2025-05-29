// api.js (몽고DB 연동 버전: 감자 서버 완전체)
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/gamjaFarm", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  orcx: { type: Number, default: 5 },
  farmingCount: { type: Number, default: 2 },
  water: { type: Number, default: 10 },
  fertilizer: { type: Number, default: 10 },
  lastRecharge: { type: Number, default: Date.now },
  potatoCount: { type: Number, default: 0 },
  harvestCount: { type: Number, default: 0 },
  inventory: { type: Array, default: [] },
  exchangeLogs: { type: Array, default: [] }
});

const User = mongoose.model("User", userSchema);

const FARMING_INTERVAL_MS = 2 * 60 * 60 * 1000;
const MAX_FARMING_COUNT = 2;

function checkFarmingRecharge(user) {
  const now = Date.now();
  const last = user.lastRecharge || 0;
  const elapsed = now - last;
  const recovered = Math.floor(elapsed / FARMING_INTERVAL_MS);

  if (recovered > 0) {
    user.farmingCount = Math.min(MAX_FARMING_COUNT, user.farmingCount + (2 * recovered));
    user.lastRecharge = last + recovered * FARMING_INTERVAL_MS;
  }
}

router.get("/gamja", async (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ error: "닉네임이 없습니다" });

  let user = await User.findOne({ nickname });
  let newUser = false;

  if (!user) {
    user = new User({ nickname });
    newUser = true;
  }

  checkFarmingRecharge(user);
  await user.save();

  const now = Date.now();
  const nextRecharge = Math.max(0, FARMING_INTERVAL_MS - (now - user.lastRecharge));

  res.json({
    ...user.toObject(),
    nextRecharge,
    newUser
  });
});

router.post("/harvest", async (req, res) => {
  const { nickname, count } = req.body;
  if (!nickname || !count) return res.status(400).json({ error: "요청 정보 부족" });

  const user = await User.findOne({ nickname });
  if (!user) return res.status(404).json({ error: "유저 없음" });

  const amount = parseInt(count) || 0;
  user.potatoCount += amount;
  user.harvestCount += amount;

  await user.save();
  res.json({ message: `감자 ${amount}개 수확 반영 완료`, total: user.potatoCount });
});

router.post("/create-product", async (req, res) => {
  const { type, farm } = req.body;
  if (!type || !farm) return res.status(400).json({ error: "잘못된 요청" });

  const user = await User.findOne({ nickname: farm });
  if (!user) return res.status(404).json({ error: "유저 없음" });

  if (user.potatoCount < 1) {
    return res.status(400).json({ error: "감자 없음" });
  }

  user.potatoCount -= 1;
  const item = user.inventory.find(i => i.name === type);
  if (item) {
    item.count += 1;
  } else {
    user.inventory.push({ name: type, count: 1 });
  }

  await user.save();
  res.json({ message: `${type} 생성됨` });
});

module.exports = router;
