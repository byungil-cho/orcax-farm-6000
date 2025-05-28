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

const userSchema = new mongoose.Schema({
  kakaoId: String,
  nickname: String,
  token: { type: Number, default: 5 },
  fertilizer: { type: Number, default: 10 },
  water: { type: Number, default: 10 },
  freeFarmsUsed: { type: Number, default: 0 },
  seeds: { type: Number, default: 0 },
  lastFarmTime: Date
});

const Potato = mongoose.model("Potato", potatoSchema);
const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(bodyParser.json());

// 사용자 초기화
app.post("/api/user/init", async (req, res) => {
  const { kakaoId, nickname } = req.body;
  try {
    const existing = await User.findOne({ kakaoId });
    if (existing) return res.json(existing);
    const newUser = await User.create({ kakaoId, nickname });
    res.json(newUser);
  } catch (err) {
    console.error("❌ 사용자 초기화 실패:", err);
    res.status(500).json({ error: "사용자 초기화 중 오류 발생" });
  }
});

// 씨감자 구매
app.post("/api/seed/buy", async (req, res) => {
  const { kakaoId, count } = req.body;
  try {
    const user = await User.findOne({ kakaoId });
    if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    if (count > 3) return res.status(400).json({ error: "씨감자는 최대 3개까지 구매 가능합니다." });
    if (user.token < count) return res.status(400).json({ error: "토큰이 부족합니다." });
    user.token -= count;
    user.seeds += count;
    await user.save();
    res.json({ message: `${count}개의 씨감자를 구매했습니다.`, seeds: user.seeds, token: user.token });
  } catch (err) {
    console.error("❌ 씨감자 구매 실패:", err);
    res.status(500).json({ error: "씨감자 구매 중 오류 발생" });
  }
});

// 씨감자 농사 (쿨타임 포함)
app.post("/api/seed/farm", async (req, res) => {
  const { kakaoId, farm, count = 1 } = req.body;
  const COOLDOWN_HOURS = 2;
  try {
    const user = await User.findOne({ kakaoId });
    if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    const now = new Date();
    const last = user.lastFarmTime || new Date(0);
    const diff = (now - last) / 1000 / 60 / 60;
    if (user.seeds < count) return res.status(400).json({ error: "씨감자가 부족합니다." });
    if (user.seeds === 0 && user.freeFarmsUsed >= 2 && diff < COOLDOWN_HOURS) {
      return res.status(429).json({ error: `무료 농사 횟수를 모두 사용하셨습니다. ${Math.ceil(COOLDOWN_HOURS - diff)}시간 후 다시 시도하세요.` });
    }
    if (user.seeds === 0) user.freeFarmsUsed += 1;
    else user.seeds -= count;
    user.lastFarmTime = now;
    await user.save();
    const log = { action: "harvest", user: kakaoId, farm, count, time: now.toISOString() };
    await Potato.create(log);
    res.json({ message: `감자 ${count}개 수확 완료. 씨감자: ${user.seeds}, 무료농사횟수: ${user.freeFarmsUsed}`, seeds: user.seeds, freeFarmsUsed: user.freeFarmsUsed });
  } catch (err) {
    console.error("❌ 씨감자 농사 실패:", err);
    res.status(500).json({ error: "씨감자 농사 중 오류 발생" });
  }
});

// 감자 수확
app.post("/api/harvest", async (req, res) => {
  const { farm, count, user = "익명손님" } = req.body;
  const log = { action: "harvest", user, farm, count, time: new Date().toISOString() };
  await Potato.create(log);
  console.log(`🌾 수확 도착: ${farm} 농장에서 ${count}개 by ${user}`);
  res.json({ status: "success", count });
});

// 제품 생산
let broadcastMessages = [];
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
  const message = `${farm}에서 ${type} 신상품이 출시되었습니다.`;
  broadcastMessages.push({ message, time: new Date().toISOString() });
  if (broadcastMessages.length > 20) broadcastMessages.shift();
  console.log(`🥔 제품 생산: ${type} from ${farm} by ${user}`);
  res.json({ name: type, result: "done" });
});

// 제품 판매
app.post("/api/sell", async (req, res) => {
  const { kakaoId, type, count = 1 } = req.body;
  try {
    const user = await User.findOne({ kakaoId });
    if (!user) return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });

    const owned = await Potato.countDocuments({ action: "create", user: kakaoId, type });
    const sold = await Potato.countDocuments({ action: "sell", user: kakaoId, type });
    const available = owned - sold;

    if (available < count) return res.status(400).json({ error: "판매 가능한 수량이 부족합니다." });

    await Potato.create({ action: "sell", user: kakaoId, type, count, time: new Date().toISOString() });
    user.token += count;
    await user.save();

    res.json({ message: `${type} ${count}개 판매 완료`, token: user.token });
  } catch (err) {
    console.error("❌ 판매 처리 실패:", err);
    res.status(500).json({ error: "판매 처리 중 오류 발생" });
  }
});

// 판매 내역
app.get("/api/sell/logs", async (req, res) => {
  try {
    const logs = await Potato.find({ action: "sell" }).sort({ time: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    console.error("❌ 판매 내역 실패:", err);
    res.status(500).json({ error: "판매 로그 불러오기 실패" });
  }
});

// 시장 제품 요약
app.get("/api/market", async (req, res) => {
  try {
    const data = await Potato.aggregate([
      { $match: { action: "sell" } },
      { $group: { _id: "$type", count: { $sum: "$count" } } },
      { $project: { type: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    console.error("❌ 시장 조회 실패:", err);
    res.status(500).json({ error: "시장 데이터 불러오기 실패" });
  }
});

let cachedPrices = [];
let lastPriceUpdate = 0;

// 제품 시세 계산 함수 (10분 단위 캐싱)
async function updateMarketPrices() {
  const marketData = await Potato.aggregate([
    { $match: { action: "sell" } },
    { $group: { _id: "$type", total: { $sum: "$count" } } }
  ]);

  const totalSold = marketData.reduce((sum, item) => sum + item.total, 0);
  const itemCount = marketData.length;
  const avg = totalSold / (itemCount || 1);

  cachedPrices = marketData.map((item) => {
    const basePrice = 1;
    const ratio = item.total / avg;
    const price = +(basePrice / ratio).toFixed(2);
    return { type: item._id, count: item.total, price };
  });

  lastPriceUpdate = Date.now();
}

// 시세 API
app.get("/api/market/prices", async (req, res) => {
  try {
    const TEN_MINUTES = 10 * 60 * 1000;
    const now = Date.now();
    if (now - lastPriceUpdate > TEN_MINUTES || cachedPrices.length === 0) {
      await updateMarketPrices();
    }

    const totalSold = cachedPrices.reduce((sum, item) => sum + item.count, 0);
    const itemCount = cachedPrices.length;
    const avg = totalSold / (itemCount || 1);

    res.json({
      total: totalSold,
      average: avg,
      prices: cachedPrices,
      notice: "모든 제품은 시세에 따라 언제든지 교환 가능하며, 개인 보유 토큰이 5만 이상이면 이메일을 통해 환전 신청이 가능합니다."
    });
  } catch (err) {
    console.error("❌ 시세 계산 실패:", err);
    res.status(500).json({ error: "제품 시세를 계산하지 못했습니다." });
  }
});

// 서버 실행
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 server.js 가동 중 at port ${PORT}`);
});
