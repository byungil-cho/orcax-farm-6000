const express = require("express");
const router = express.Router();

const users = {};
const inventory = {};
const exchangeLogs = {};
const farmingHistory = {};

const FARMING_INTERVAL_MS = 2 * 60 * 60 * 1000;
const MAX_FARMING_COUNT = 2;

function initializeUser(nickname) {
  if (!users[nickname]) {
    users[nickname] = {
      orcx: 5,
      farmingCount: 2,
      water: 10,
      fertilizer: 10,
      lastRecharge: Date.now(),
      potatoCount: 0,
      harvestCount: 0
    };
    inventory[nickname] = [];
    exchangeLogs[nickname] = [];
    farmingHistory[nickname] = Date.now();
    return true;
  }
  return false;
}

function checkFarmingRecharge(nickname) {
  const now = Date.now();
  const last = users[nickname].lastRecharge || 0;
  const elapsed = now - last;
  const recovered = Math.floor(elapsed / FARMING_INTERVAL_MS);

  if (recovered > 0) {
    const newCount = Math.min(MAX_FARMING_COUNT, users[nickname].farmingCount + (2 * recovered));
    users[nickname].farmingCount = newCount;
    users[nickname].lastRecharge = last + recovered * FARMING_INTERVAL_MS;
  }
}

router.get("/", (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ error: "닉네임이 없습니다" });

  const isNew = initializeUser(nickname);
  checkFarmingRecharge(nickname);

  const userData = users[nickname];
  const userItems = inventory[nickname] || [];
  const userLogs = exchangeLogs[nickname] || [];
  const lastRecharge = users[nickname].lastRecharge;
  const now = Date.now();
  const nextRecharge = Math.max(0, FARMING_INTERVAL_MS - (now - lastRecharge));

  res.json({
    ...userData,
    items: userItems,
    exchangeLogs: userLogs,
    nextRecharge,
    newUser: isNew
  });
});

router.post("/create-product", (req, res) => {
  const { type, farm } = req.body;
  const nickname = farm;
  if (!type || !nickname || !users[nickname]) {
    return res.status(400).json({ error: "정보 누락 또는 유저 없음" });
  }

  if (users[nickname].potatoCount <= 0) {
    return res.status(400).json({ error: "감자 부족" });
  }

  users[nickname].potatoCount -= 1;
  const items = inventory[nickname] || [];
  const found = items.find(i => i.name === type);
  if (found) {
    found.count += 1;
  } else {
    items.push({ name: type, count: 1 });
  }

  res.json({ name: type, message: "제품 생성 완료" });
});

router.post("/buy-seed", (req, res) => {
  const { nickname, count } = req.body;
  if (!nickname || !users[nickname]) return res.status(400).json({ error: "유저 정보 없음" });

  const amount = parseInt(count) || 1;
  if (users[nickname].orcx < amount) {
    return res.status(400).json({ error: "ORCX 부족" });
  }

  users[nickname].orcx -= amount;
  users[nickname].farmingCount += amount;

  exchangeLogs[nickname].push({
    type: "씨감자 교환",
    amount,
    orcxUsed: amount,
    timestamp: new Date().toISOString()
  });

  res.json({ message: `씨감자 ${amount}개 교환 완료` });
});

router.post("/exchange", (req, res) => {
  const { nickname, sourceProduct, itemType } = req.body;
  if (!nickname || !sourceProduct || !itemType) {
    return res.status(400).json({ error: "필수 정보 누락" });
  }

  const items = inventory[nickname] || [];
  const itemIndex = items.findIndex(i => i.name === sourceProduct && i.count > 0);

  if (itemIndex === -1) {
    return res.status(400).json({ error: "제품 없음 또는 수량 부족" });
  }

  items[itemIndex].count -= 1;
  if (items[itemIndex].count === 0) {
    items.splice(itemIndex, 1);
  }

  if (itemType === "물") {
    users[nickname].water += 1;
  } else if (itemType === "거름") {
    users[nickname].fertilizer += 1;
  }

  exchangeLogs[nickname].push({
    type: "자원 교환",
    product: sourceProduct,
    to: itemType,
    timestamp: new Date().toISOString()
  });

  res.json({ message: `${sourceProduct} → ${itemType} 교환 성공` });
});

module.exports = router;