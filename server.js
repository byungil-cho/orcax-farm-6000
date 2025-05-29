
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

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
      harvested: 0,
      items: [],
      tokens: 5,
      compost: 5,
      water: 5,
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

app.post("/api/gamja/harvest", async (req, res) => {
  const { count } = req.body;
  const farm = await getFarm();
  farm.potatoes += count;
  farm.harvested += count;
  await farm.save();
  res.send({ message: `감자 ${count}개 수확 반영 완료`, total: farm.potatoes });
});

app.post("/api/create-product", async (req, res) => {
  const { type } = req.body;
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
  await farm.save();
  res.send({ name: type, message: `${type} 가공 완료` });
});

app.listen(PORT, () => {
  console.log(`✅ 감자 서버 실행 중: http://localhost:${PORT}`);
});
