// server.js (6000 // server.js (6000 \uud55c역 포트, 경쟁력 가지고 배포도 되고)
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors({ origin: ["https://byungil-cho.github.io"], credentials: false }));
app.use(express.json());

mongoose.connect("mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/farmDB?retryWrites=true&w=majority", {
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
  lastHarvestTime: Date,
});

const Farm = mongoose.model("Farm", farmSchema);

async function getFarm() {
  let farm = await Farm.findOne();
  if (!farm) {
    farm = new Farm({
      potatoes: 10,
      harvested: 3,
      items: [
        { name: "감자칩", count: 2 },
        { name: "감자전", count: 1 }
      ],
      tokens: 5,
      compost: 10,
      water: 10,
      history: [],
      announcements: [],
      lastHarvestTime: new Date(0)
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
  if (farm.potatoes <= 0) return res.status(400).send({ message: "감자가 없습니다." });
  farm.potatoes -= 1;
  const existing = farm.items.find(i => i.name === type);
  if (existing) existing.count += 1;
  else farm.items.push({ name: type, count: 1 });
  farm.history.push({ type, action: "가공", time: new Date(), farm: farmName });
  const message = `${farmName} 농장에서 ${type} 신상품이 출시되었습니다.`;
  farm.announcements.unshift({ message, time: new Date() });
  if (farm.announcements.length > 10) farm.announcements.pop();
  await farm.save();
  res.send({ name: type, message: `${type} 가공 완료`, farm: farmName });
});

app.post("/api/free-harvest", async (req, res) => {
  const now = new Date();
  const farm = await getFarm();
  const last = farm.lastHarvestTime || new Date(0);
  const hoursPassed = (now - last) / (1000 * 60 * 60);
  if (hoursPassed < 2) return res.status(400).send({ message: "무료 농사 가능 시간이 아직 안 됐습니다." });

  farm.potatoes += 2;
  farm.harvested += 2;
  farm.lastHarvestTime = now;
  await farm.save();
  res.send({ message: "무료 감자 수확 2개 완료!" });
});

app.listen(PORT, () => {
  console.log(`🟢 서버 실행 중: http://localhost:${PORT}`);
});
