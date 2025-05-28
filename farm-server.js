// farm-server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://<your-credentials>@cluster.mongodb.net/orcaxFarm", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const farmSchema = new mongoose.Schema({
  kakaoId: String,
  farmName: String,
  potatoes: Number,
  lastFarmingTime: Date,
  freeFarmingUsed: Number,
  seedPotatoes: Number,
});

const Farm = mongoose.model("Farm", farmSchema);

// 기본 로그인 시 초기 지급
app.post("/api/farm/init", async (req, res) => {
  const { kakaoId, farmName } = req.body;
  let farm = await Farm.findOne({ kakaoId });
  if (!farm) {
    farm = new Farm({
      kakaoId,
      farmName,
      potatoes: 0,
      seedPotatoes: 0,
      freeFarmingUsed: 0,
      lastFarmingTime: null
    });
    await farm.save();
  }
  res.sendStatus(200);
});

// 농사 짓기 (무료 2회 + 2시간 쿨타임, 이후 씨감자 필요)
app.post("/api/farm/plant", async (req, res) => {
  const { kakaoId } = req.body;
  const farm = await Farm.findOne({ kakaoId });
  if (!farm) return res.status(404).send("농장 없음");

  const now = new Date();
  const twoHours = 2 * 60 * 60 * 1000;
  const elapsed = farm.lastFarmingTime ? (now - farm.lastFarmingTime) : Infinity;

  if (farm.freeFarmingUsed < 2) {
    farm.potatoes += randomHarvest();
    farm.lastFarmingTime = now;
    farm.freeFarmingUsed += 1;
    await farm.save();
    return res.json({ status: "FREE", potatoes: farm.potatoes });
  } else if (elapsed < twoHours) {
    return res.status(403).send("무료 농사 시간 대기 중");
  } else if (farm.seedPotatoes > 0) {
    farm.potatoes += randomHarvest();
    farm.seedPotatoes -= 1;
    farm.lastFarmingTime = now;
    await farm.save();
    return res.json({ status: "SEED", potatoes: farm.potatoes });
  } else {
    return res.status(403).send("씨감자 없음");
  }
});

// 감자 가공 → 제품 (간단 처리)
app.post("/api/farm/process", async (req, res) => {
  const { kakaoId, count, productName } = req.body;
  const farm = await Farm.findOne({ kakaoId });
  if (!farm || farm.potatoes < count) return res.status(400).send("감자 부족");

  farm.potatoes -= count;
  await farm.save();

  // 실제로는 Product 컬렉션에 추가해야 함
  res.json({ message: `${farm.farmName} 농장에서 ${productName} 신상품이 출시되었습니다.` });
});

// 씨감자 구매
app.post("/api/farm/seed", async (req, res) => {
  const { kakaoId, amount } = req.body;
  const price = 1; // 씨감자 1개 = 1토큰

  const Token = mongoose.model("Token", new mongoose.Schema({ kakaoId: String, token: Number }));
  const farm = await Farm.findOne({ kakaoId });
  const user = await Token.findOne({ kakaoId });

  if (!user || user.token < amount * price) return res.status(400).send("토큰 부족");

  user.token -= amount * price;
  farm.seedPotatoes += amount;
  await user.save();
  await farm.save();
  res.sendStatus(200);
});

// 농장 상태 조회
app.get("/api/farm/:kakaoId", async (req, res) => {
  const farm = await Farm.findOne({ kakaoId: req.params.kakaoId });
  res.json(farm);
});

function randomHarvest() {
  return Math.floor(Math.random() * 6) + 5; // 5~10개 사이 수확
}

const PORT = process.env.FARM_PORT || 7000;
app.listen(PORT, () => {
  console.log(`🌱 Farm Server 실행 중: http://localhost:${PORT}`);
});
