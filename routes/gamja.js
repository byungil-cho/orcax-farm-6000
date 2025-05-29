// 📦 감자 농장 관련 서버 라우터 구조 예시
const express = require("express");
const router = express.Router();
const db = require("../models");

// ✅ 기본 정보 불러오기 + 신규 유저 보상 지급
router.get("/api/gamja", async (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ error: "닉네임이 필요합니다." });

  let user = await db.User.findOne({ nickname });
  let newUser = false;

  if (!user) {
    user = await db.User.create({
      nickname,
      orcx: 5,
      farmingCount: 2,
      water: 10,
      fertilizer: 10,
      items: []
    });
    newUser = true;
  }

  res.json({
    nickname: user.nickname,
    orcx: user.orcx,
    farmingCount: user.farmingCount,
    water: user.water,
    fertilizer: user.fertilizer,
    items: user.items,
    newUser
  });
});

// 🌱 씨감자 교환 (ORCX 차감)
router.post("/api/buy-seed", async (req, res) => {
  const { nickname, count } = req.body;
  const user = await db.User.findOne({ nickname });
  if (!user || user.orcx < count) return res.status(400).json({ message: "잔액 부족" });

  user.orcx -= count;
  user.farmingCount += count;
  await user.save();
  res.json({ message: `씨감자 ${count}개 교환 완료` });
});

// 💧 제품 → 물 또는 거름 교환
router.post("/api/exchange", async (req, res) => {
  const { nickname, sourceProduct, itemType } = req.body; // itemType: '물' or '거름'
  const user = await db.User.findOne({ nickname });
  if (!user) return res.status(404).json({ error: "사용자 없음" });

  const product = user.items.find(i => i.name === sourceProduct);
  if (!product || product.count <= 0) {
    return res.status(400).json({ error: "제품 수량 부족" });
  }

  product.count -= 1;
  if (itemType === "물") user.water += 1;
  else if (itemType === "거름") user.fertilizer += 1;

  await user.save();
  res.json({ message: `${sourceProduct} → ${itemType} 교환 성공` });
});

module.exports = router;
