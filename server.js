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

// 👋 감자 핑 응답
app.get("/api/ping", (req, res) => {
  console.log("✅ 감자 공장 ping 받음");
  res.json({ message: "pong" });
});

// 감자 수확 (예시)
app.post("/api/harvest", async (req, res) => {
  const { farm, count, user = "익명손님" } = req.body;
  const log = { action: "harvest", user, farm, count, time: new Date().toISOString() };
  await Potato.create({ ...log });
  console.log(`🌾 수확 도착: ${farm} 농장에서 ${count}개 by ${user}`);
  res.json({ status: "success", count });
});

// 감자 제품 만들기 (예시)
app.post("/api/create-product", async (req, res) => {
  const { type, farm, user = "익명손님" } = req.body;
  const harvestedCount = await Potato.aggregate([
    { $match: { action: "harvest" } },
    { $group: { _id: null, total: { $sum: "$count" } } }
  ]);
  const createdCount = await Potato.countDocuments({ action: "create" });
  const totalHarvested = harvestedCount[0]?.total || 0;

  if (createdCount >= totalHarvested) {
    return res.status(400).json({ error: "감자가 부족합니다." });
  }

  const log = { action: "create", user, farm, type, count: 1, time: new Date().toISOString() };
  await Potato.create(log);
  console.log(`🥔 제품 생산: ${type} from ${farm} by ${user}`);
  res.json({ name: type, result: "done" });
});

// 🧃 감자 보관함 조회
app.get("/api/gamja", async (req, res) => {
  try {
    const harvestData = await Potato.aggregate([
      { $match: { action: "harvest" } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);

    const dbItems = await Potato.aggregate([
      { $match: { action: "create" } },
      { $group: { _id: "$type", count: { $sum: "$count" } } },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    const harvested = harvestData[0]?.total || 0;
    const totalProducts = dbItems.reduce((sum, item) => sum + item.count, 0);
    const potatoesLeft = harvested - totalProducts;

    res.json({
      harvested,
      potatoes: potatoesLeft,
      items: dbItems,
      totalCollected: harvested
    });
  } catch (err) {
    console.error("❌ 보관함 조회 실패:", err);
    res.status(500).json({ error: "보관함 데이터를 불러오지 못했습니다." });
  }
});

// 감자 작업 로그 조회
app.get("/api/logs", async (req, res) => {
  try {
    const logs = await Potato.find().sort({ time: -1 });
    res.json(logs);
  } catch (err) {
    console.error("❌ 로그 조회 실패:", err);
    res.status(500).json({ error: "작업 로그를 불러오지 못했습니다." });
  }
});

// 🎤 서버 시작
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 server.js 가동 중 at port ${PORT}`);
});
