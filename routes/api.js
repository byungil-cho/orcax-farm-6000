// ✅ api.js 전체 수정본
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  potatoCount: { type: Number, default: 0 },
  harvestCount: { type: Number, default: 0 },
  inventory: { type: Array, default: [] }
});

const User = mongoose.model("User", userSchema);

// GET 감자 현황
router.get("/gamja", async (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ error: "닉네임 없음" });

  let user = await User.findOne({ nickname });
  if (!user) {
    user = new User({ nickname });
    await user.save();
  }

  res.json({
    message: `${nickname}님의 감자 상태를 불러왔습니다.`,
    nickname: user.nickname,
    potatoCount: user.potatoCount,
    harvestCount: user.harvestCount,
    inventory: user.inventory
  });
});

// 감자 수확
router.post("/harvest", async (req, res) => {
  const { nickname, count } = req.body;
  const user = await User.findOne({ nickname });
  if (!user) return res.status(404).json({ error: "유저 없음" });

  user.potatoCount += count;
  user.harvestCount += count;
  await user.save();

  res.json({ message: `${count}개 수확`, total: user.potatoCount });
});

// 감자 제품 만들기
router.post("/create-product", async (req, res) => {
  const { type, nickname } = req.body;
  const user = await User.findOne({ nickname });
  if (!user || !type) return res.status(400).json({ error: "잘못된 요청" });

  if (user.potatoCount < 1) {
    return res.status(400).json({ error: "감자 부족" });
  }

  user.potatoCount -= 1;
  const item = user.inventory.find(i => i.type === type);
  if (item) {
    item.count += 1;
  } else {
    user.inventory.push({ type, count: 1 });
  }

  user.markModified('inventory');
  await user.save();

  res.json({ message: `${type} 생산됨`, type });
});

router.get("/ping", (_, res) => {
  res.json({ status: "alive" });
});

module.exports = router;
