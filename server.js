const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 6000;

mongoose.connect(process.env.MONGO_URI || "your-mongo-uri-here", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("🍠 MongoDB 연결 성공!");
}).catch((err) => {
  console.error("❌ MongoDB 연결 실패:", err);
});

const potatoSchema = new mongoose.Schema({
  type: String,
  count: Number,
  user: String,
  farm: String,
  action: String,
  time: { type: Date, default: Date.now }
});

const Potato = mongoose.model("Potato", potatoSchema);

app.use(cors());
app.use(bodyParser.json());

let inventory = {
  potatoes: 12,
  harvested: 4,
  items: [
    { name: "감자칩", count: 2 },
    { name: "감자전", count: 1 }
  ],
  logs: []
};

// 👋 감자 핑 응답
app.get("/api/ping", (req, res) => {
  console.log("✅ 감자 공장 ping 받음");
  res.json({ message: "pong" });
});

// 감자 수확 (예시)
app.post("/api/harvest", async (req, res) => {
  const { farm, count, user = "익명손님" } = req.body;
  inventory.potatoes += count;
  inventory.harvested += count;
  const log = { action: "harvest", user, farm, count, time: new Date().toISOString() };
  inventory.logs.push(log);
  await Potato.create({ ...log });
  console.log(`🌾 수확 도착: ${farm} 농장에서 ${count}개 by ${user}`);
  res.json({ status: "success", count });
});

// 감자 제품 만들기 (예시)
app.post("/api/create-product", async (req, res) => {
  const { type, farm, user = "익명손님" } = req.body;
  if (inventory.potatoes <= 0) {
    return res.status(400).json({ error: "감자가 부족합니다." });
  }

  inventory.potatoes -= 1;
  const existing = inventory.items.find(item => item.name === type);
  if (existing) {
    existing.count += 1;
  } else {
    inventory.items.push({ name: type, count: 1 });
  }

  const log = { action: "create", user, farm, product: type, count: 1, time: new Date().toISOString() };
  inventory.logs.push(log);
  await Potato.create({ ...log, type });
  console.log(`🥔 제품 생산: ${type} from ${farm} by ${user}`);
  res.json({ name: type, result: "done" });
});

// 🧃 감자 보관함 조회
app.get("/api/gamja", (req, res) => {
  res.json({
    ...inventory,
    totalCollected: inventory.potatoes + inventory.items.reduce((sum, item) => sum + item.count, 0)
  });
});

// 감자 작업 로그 조회
app.get("/api/logs", (req, res) => {
  res.json(inventory.logs);
});

// 🎤 서버 시작
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 server.js 가동 중 at port ${PORT}`);
});
