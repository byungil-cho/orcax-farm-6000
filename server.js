
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 6000;

app.use(bodyParser.json());
app.use(express.static("public"));

const DATA_PATH = path.join(__dirname, "data", "users.json");

let users = {};
let inventory = {};
let exchangeLogs = {};

function loadData() {
  if (fs.existsSync(DATA_PATH)) {
    const raw = fs.readFileSync(DATA_PATH);
    const data = JSON.parse(raw);
    users = data.users || {};
    inventory = data.inventory || {};
    exchangeLogs = data.exchangeLogs || {};
  }
}

function saveData() {
  const data = { users, inventory, exchangeLogs };
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

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
    saveData();
  }
}

function checkFarmingRecharge(nickname) {
  const FARMING_INTERVAL_MS = 2 * 60 * 60 * 1000;
  const MAX_FARMING_COUNT = 2;

  const now = Date.now();
  const last = users[nickname].lastRecharge || 0;
  const elapsed = now - last;
  const recovered = Math.floor(elapsed / FARMING_INTERVAL_MS);

  if (recovered > 0) {
    const newCount = Math.min(MAX_FARMING_COUNT, users[nickname].farmingCount + (2 * recovered));
    users[nickname].farmingCount = newCount;
    users[nickname].lastRecharge = last + recovered * FARMING_INTERVAL_MS;
    saveData();
  }
}

app.get("/api/gamja", (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ error: "닉네임이 없습니다" });

  initializeUser(nickname);
  checkFarmingRecharge(nickname);

  const userData = users[nickname];
  const userItems = inventory[nickname] || [];
  const userLogs = exchangeLogs[nickname] || [];
  const now = Date.now();
  const nextRecharge = Math.max(0, (2 * 60 * 60 * 1000) - (now - userData.lastRecharge));

  res.json({
    ...userData,
    items: userItems,
    exchangeLogs: userLogs,
    nextRecharge
  });
});

app.post("/api/harvest", (req, res) => {
  const { nickname } = req.body;
  if (!nickname || !users[nickname]) return res.status(400).json({ error: "유저 정보 없음" });

  users[nickname].potatoCount += 10;
  users[nickname].harvestCount += 1;
  saveData();
  res.json({ message: "감자 10개 수확 완료", potatoCount: users[nickname].potatoCount });
});

app.post("/api/create-product", (req, res) => {
  const { farm, type } = req.body;
  if (!farm || !type || !users[farm]) return res.status(400).json({ error: "정보 없음" });

  if (users[farm].potatoCount < 1) {
    return res.status(400).json({ error: "감자 부족" });
  }

  users[farm].potatoCount -= 1;
  const items = inventory[farm] || [];
  const index = items.findIndex(i => i.name === type);
  if (index !== -1) {
    items[index].count += 1;
  } else {
    items.push({ name: type, count: 1 });
  }
  inventory[farm] = items;
  saveData();
  res.json({ message: `${type} 1개 생산 완료` });
});

loadData();

app.listen(PORT, () => {
  console.log(`✅ 감자 농장 서버 작동 중: http://localhost:${PORT}`);
});
