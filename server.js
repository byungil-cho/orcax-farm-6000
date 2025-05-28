// server.js (6000 포트용, 통합 서버: 농장 + 마켓)
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

// 기본 농장 상태
let farmData = {
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
};

// 공장 살아있나 체크용
app.get("/api/ping", (req, res) => {
  res.send({ message: "pong" });
});

// 감자 상태 요청
app.get("/api/gamja", (req, res) => {
  res.send({
    potatoes: farmData.potatoes,
    harvested: farmData.harvested,
    items: farmData.items,
  });
});

// 제품 가공
app.post("/api/create-product", (req, res) => {
  const { type, farm } = req.body;
  if (farmData.potatoes <= 0) {
    return res.status(400).send({ message: "감자가 없습니다." });
  }
  farmData.potatoes -= 1;
  const existing = farmData.items.find(i => i.name === type);
  if (existing) {
    existing.count += 1;
  } else {
    farmData.items.push({ name: type, count: 1 });
  }
  farmData.history.push({ type, action: "가공", time: new Date(), farm });
  res.send({ name: type, message: `${type} 가공 완료`, farm });
});

// 씨감자 구매 (1 토큰 -> 1 감자)
app.post("/api/buy-seed", (req, res) => {
  const { count } = req.body;
  if (farmData.tokens < count) {
    return res.status(400).send({ message: "토큰 부족" });
  }
  farmData.tokens -= count;
  farmData.potatoes += count;
  res.send({ message: `${count}개 씨감자 구매 완료` });
});

// 물/거름 교환 (제품으로 얻기)
app.post("/api/exchange", (req, res) => {
  const { itemType } = req.body;
  const target = farmData.items.find(i => i.name === itemType);
  if (!target || target.count < 1) {
    return res.status(400).send({ message: "제품 부족" });
  }
  target.count -= 1;
  if (itemType.includes("물")) farmData.water += 1;
  else farmData.compost += 1;
  res.send({ message: `${itemType}로 교환 완료` });
});

// 마켓 시세 확인용
app.get("/api/price", (req, res) => {
  const total = farmData.items.reduce((sum, i) => sum + i.count, 0) || 1;
  const prices = farmData.items.map(i => {
    const avg = total / farmData.items.length;
    const ratio = avg / i.count;
    const price = Number((ratio).toFixed(2));
    return { name: i.name, price };
  });
  res.send({ prices });
});

// 제품 판매 → 시세 기반 토큰 지급
app.post("/api/sell", (req, res) => {
  const { name, count } = req.body;
  const item = farmData.items.find(i => i.name === name);
  if (!item || item.count < count) {
    return res.status(400).send({ message: "수량 부족" });
  }
  item.count -= count;

  const total = farmData.items.reduce((sum, i) => sum + i.count, 0) || 1;
  const avg = total / farmData.items.length;
  const ratio = avg / (item.count || 1);
  const price = Number((ratio).toFixed(2));

  const earned = Math.round(count * price);
  farmData.tokens += earned;
  res.send({ message: `${name} ${count}개 판매 완료`, earned, tokens: farmData.tokens });
});

app.listen(PORT, () => {
  console.log(`🟢 서버 실행 중: http://localhost:${PORT}`);
});
