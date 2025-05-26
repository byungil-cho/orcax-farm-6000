
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

// 인메모리 재고
let inventory = {
  "감자감자칩": 3,
  "감자감자전": 5,
  "감자감자고구마": 1,
  "감자감자전전": 1,
  "OrcaX감자레전": 1,
  "OrcaX감자타래": 1,
  "OrcaX감자부라보": 1,
  "OrcaX감자동통": 1,
  "OrcaX감자오뚜기": 1,
  "OrcaX감자표범": 1,
  "감자목반": 1
};

// 시세 (기본 가격 설정)
const priceMap = {
  "감자감자칩": 120,
  "감자감자전": 100,
  "감자감자고구마": 80,
  "감자감자전전": 90,
  "OrcaX감자레전": 200,
  "OrcaX감자타래": 220,
  "OrcaX감자부라보": 180,
  "OrcaX감자동통": 160,
  "OrcaX감자오뚜기": 150,
  "OrcaX감자표범": 140,
  "감자목반": 70
};

// ✅ 헬스 체크
app.get("/api/ping", (req, res) => {
  res.send("pong");
});

// ✅ 보관함 데이터
app.get("/api/gamja", (req, res) => {
  const items = Object.entries(inventory).map(([name, count]) => ({ name, count }));
  const total = items.reduce((sum, item) => sum + item.count, 0);
  res.json({ total, items });
});

// ✅ 시세 조회
app.get("/api/market", (req, res) => {
  const data = Object.entries(inventory).map(([name, quantity]) => ({
    name,
    quantity,
    price: priceMap[name] || 100
  }));
  res.json(data);
});

// ✅ 제품 생성
app.post("/api/create-product", (req, res) => {
  const { type } = req.body;
  const name = `OrcaX${type}`;
  inventory[name] = (inventory[name] || 0) + 1;
  if (!priceMap[name]) priceMap[name] = 150;
  res.json({ name });
});

// ✅ 서버 시작
app.listen(PORT, () => {
  console.log(`🥔 감자 종합서버 작동 중: http://localhost:${PORT}`);
});
