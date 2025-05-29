// server.js (전기선 연결 & 구조 정비 완료)
const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 6000;

// 🔌 핵심: api.js 라우터 연결
const apiRouter = require("./api");
app.use("/api", apiRouter);

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

// ✅ 서버 상태 확인용 ping 엔드포인트 (기존 유지)
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

// ✅ api.js로 모든 핵심 API 기능 위임 완료

app.listen(PORT, () => {
  loadData();
  console.log("✅ 정상 작동: 감자 서버 가동 중");
});
