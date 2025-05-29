const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 6000;

app.use(bodyParser.json());
app.use(express.static("public"));

const DATA_PATH = path.join(__dirname, "data", "users.json");
let users = {}, inventory = {}, exchangeLogs = {};

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

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.get("/api/gamja", (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ error: "닉네임이 없습니다" });
  initializeUser(nickname);

  res.json({
    ...users[nickname],
    items: inventory[nickname],
    exchangeLogs: exchangeLogs[nickname]
  });
});

app.post("/api/harvest", (req, res) => {
  const { nickname } = req.body;
  if (!nickname || !users[nickname]) return res.status(400).json({ error: "유저 없음" });

  users[nickname].potatoCount += 10;
  users[nickname].harvestCount += 1;
  saveData();

  res.json({ message: "감자 10개 수확!", potatoCount: users[nickname].potatoCount });
});

app.post("/api/create-product", (req, res) => {
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
  saveData();
  res.json({ message: `${type} 생성됨` });
});

app.listen(PORT, () => {
  loadData();
  console.log("✅ 정상 작동: 감자 서버 가동 중");
});