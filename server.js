const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// 유저 기반 감자 저장소
const users = {};
const inventory = {};
const exchangeLogs = {};

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// 수확 API
app.post("/api/gamja/harvest", (req, res) => {
  const { nickname } = req.body;
  if (!nickname) return res.status(400).json({ error: "닉네임 누락" });

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
  }

  users[nickname].potatoCount += 10;  // 예: 수확량 10
  users[nickname].harvestCount += 10;

  res.json({ message: "감자 10개 수확 완료", potatoCount: users[nickname].potatoCount });
});

// 사용자 기반 정보 요청
app.get("/api/gamja", (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ error: "닉네임 누락" });

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
  }

  const items = inventory[nickname] || [];

  res.json({
    ...users[nickname],
    items,
    exchangeLogs: exchangeLogs[nickname]
  });
});

app.post("/api/create-product", (req, res) => {
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

// 기본 index.html 제공
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ 감자 서버 실행 중: http://localhost:${PORT}`);
});