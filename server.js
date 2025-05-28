
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const farmSchema = new mongoose.Schema({
  potatoes: Number,
  harvested: Number,
  items: [{ name: String, count: Number }],
  tokens: Number,
  compost: Number,
  water: Number,
  history: Array,
  announcements: Array,
});

const Farm = mongoose.model("Farm", farmSchema);

async function getFarm() {
  let farm = await Farm.findOne();
  if (!farm) {
    farm = new Farm({
      potatoes: 10,
      harvested: 3,
      items: [{ name: "감자칩", count: 2 }, { name: "감자전", count: 1 }],
      tokens: 5,
      compost: 10,
      water: 10,
      history: [],
      announcements: []
    });
    await farm.save();
  }
  return farm;
}

app.get("/api/ping", (req, res) => {
  res.send({ message: "pong" });
});

app.get("/api/gamja", async (req, res) => {
  const farm = await getFarm();
  res.send({
    potatoes: farm.potatoes,
    harvested: farm.harvested,
    items: farm.items,
  });
});

app.post("/api/create-product", async (req, res) => {
  const { type, farm: farmName } = req.body;
  const farm = await getFarm();
  if (farm.potatoes <= 0) {
    return res.status(400).send({ message: "감자가 없습니다." });
  }
  farm.potatoes -= 1;
  const existing = farm.items.find(i => i.name === type);
  if (existing) {
    existing.count += 1;
  } else {
    farm.items.push({ name: type, count: 1 });
  }
  farm.history.push({ type, action: "가공", time: new Date(), farm: farmName });
  const message = `${farmName} 농장에서 ${type} 신상품이 출시되었습니다.`;
  farm.announcements.unshift({ message, time: new Date() });
  if (farm.announcements.length > 10) farm.announcements.pop();
  await farm.save();
  res.send({ name: type, message: `${type} 가공 완료`, farm: farmName });
});

app.get("/api/announcements", async (req, res) => {
  const farm = await getFarm();
  res.send({ announcements: farm.announcements });
});

app.post("/api/buy-seed", async (req, res) => {
  const { count } = req.body;
  const farm = await getFarm();
  if (farm.tokens < count) {
    return res.status(400).send({ message: "토큰 부족" });
  }
  farm.tokens -= count;
  farm.potatoes += count;
  await farm.save();
  res.send({ message: `${count}개 씨감자 구매 완료` });
});

app.post("/api/exchange", async (req, res) => {
  const { itemType } = req.body;
  const farm = await getFarm();
  const target = farm.items.find(i => i.name === itemType);
  if (!target || target.count < 1) {
    return res.status(400).send({ message: "제품 부족" });
  }
  target.count -= 1;
  if (itemType.includes("물")) farm.water += 1;
  else farm.compost += 1;
  await farm.save();
  res.send({ message: `${itemType}로 교환 완료` });
});

app.get("/api/price", async (req, res) => {
  const farm = await getFarm();
  const total = farm.items.reduce((sum, i) => sum + i.count, 0) || 1;
  const prices = farm.items.map(i => {
    const avg = total / farm.items.length;
    const ratio = avg / i.count;
    const price = Number((ratio).toFixed(2));
    return { name: i.name, price };
  });
  res.send({ prices });
});

app.post("/api/sell", async (req, res) => {
  const { name, count } = req.body;
  const farm = await getFarm();
  const item = farm.items.find(i => i.name === name);
  if (!item || item.count < count) {
    return res.status(400).send({ message: "수량 부족" });
  }
  item.count -= count;
  const total = farm.items.reduce((sum, i) => sum + i.count, 0) || 1;
  const avg = total / farm.items.length;
  const ratio = avg / (item.count || 1);
  const price = Number((ratio).toFixed(2));
  const earned = Math.round(count * price);
  farm.tokens += earned;
  await farm.save();
  res.send({ message: `${name} ${count}개 판매 완료`, earned, tokens: farm.tokens });
});

app.listen(PORT, () => {
  console.log(`🟢 서버 실행 중: http://localhost:${PORT}`);
});
