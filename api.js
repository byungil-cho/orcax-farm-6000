// api.js (감자 밭의 두뇌)
const express = require("express");
const router = express.Router();

let users = {};
let inventory = {};
let exchangeLogs = {};
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

router.get("/gamja", (req, res) => {
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

router.post("/harvest", (req, res) => {
  const { nickname, count } = req.body;
  if (!nickname || !users[nickname]) return res.status(400).json({ error: "유저 정보 없음" });

  const amount = parseInt(count) || 0;
  users[nickname].potatoCount += amount;
  users[nickname].harvestCount += amount;

  res.json({ message: `감자 ${amount}개 수확 반영 완료`, total: users[nickname].potatoCount });
});

router.post("/create-product", (req, res) => {
  const { type, farm } = req.body;
  if (!type || !farm || !users[farm]) return res.status(400).json({ error: "잘못된 요청" });

  if (users[farm].potatoCount < 1) {
    return res.status(400).json({ error: "감자 없음" });
  }

  users[farm].potatoCount -= 1;
  const items = inventory[farm];
  const found = items.find(i => i.name === type);
  if (found) {
    found.count += 1;
  } else {
    items.push({ name: type, count: 1 });
  }

  res.json({ message: `${type} 생성됨`, name: type });
});

module.exports = router;
