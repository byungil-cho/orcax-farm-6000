// OrcaX Farm Full Server
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

mongoose.connect("mongodb+srv://<your-credentials>@cluster.mongodb.net/orcaxFarm", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Mongo Schemas
const storageSchema = new mongoose.Schema({ kakaoId: String, type: String, count: Number });
const tokenSchema = new mongoose.Schema({ kakaoId: String, token: Number });
const farmSchema = new mongoose.Schema({ kakaoId: String, farmName: String });

const Storage = mongoose.model("Storage", storageSchema);
const Token = mongoose.model("Token", tokenSchema);
const Farm = mongoose.model("Farm", farmSchema);

// 가격 시세 계산 (간단 버전)
const BASE_TOTAL = 5000;
const UNIT_PRICE = 1;

function getMarketPrices(storageList) {
  const totalMap = {};
  let grandTotal = 0;
  storageList.forEach(item => {
    totalMap[item.type] = (totalMap[item.type] || 0) + item.count;
    grandTotal += item.count;
  });

  const prices = [];
  Object.keys(totalMap).forEach(type => {
    const avg = grandTotal / Object.keys(totalMap).length;
    const current = totalMap[type];
    let price = UNIT_PRICE;
    if (current > avg) price *= 0.8;
    else if (current < avg) price *= 1.2;
    prices.push({ type, count: current, price: price.toFixed(2) });
  });
  return prices;
}

app.get("/api/market/prices", async (req, res) => {
  const allStorage = await Storage.find({});
  const prices = getMarketPrices(allStorage);
  res.json({
    prices,
    notice: "🚜 새로운 제품이 출시되었습니다! 감자칩, 감자국수 등 다양한 상품이 준비되어 있습니다."
  });
});

app.get("/api/storage/:kakaoId", async (req, res) => {
  const data = await Storage.find({ kakaoId: req.params.kakaoId });
  res.json(data);
});

app.get("/api/user/token/:kakaoId", async (req, res) => {
  const result = await Token.findOne({ kakaoId: req.params.kakaoId });
  res.json({ token: result ? result.token : 0 });
});

app.get("/api/user/farm/:kakaoId", async (req, res) => {
  const farm = await Farm.findOne({ kakaoId: req.params.kakaoId });
  res.json({ farmName: farm ? farm.farmName : "농장없음" });
});

app.post("/api/user/farm", async (req, res) => {
  const { kakaoId, farmName } = req.body;
  let farm = await Farm.findOne({ kakaoId });
  if (farm) farm.farmName = farmName;
  else farm = new Farm({ kakaoId, farmName });
  await farm.save();
  res.sendStatus(200);
});

app.post("/api/market/sell", async (req, res) => {
  const { kakaoId, type, count } = req.body;
  const item = await Storage.findOne({ kakaoId, type });
  if (!item || item.count < count) return res.status(400).send("재고 부족");

  item.count -= count;
  if (item.count <= 0) await item.deleteOne();
  else await item.save();

  const price = UNIT_PRICE; // 실제는 getMarketPrices 활용 가능
  const tokenAmount = count * price;
  const user = await Token.findOne({ kakaoId });

  if (user) {
    user.token += tokenAmount;
    await user.save();
  } else {
    await new Token({ kakaoId, token: tokenAmount }).save();
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`🐳 OrcaX 감자 서버 실행 중: http://localhost:${PORT}`);
});
