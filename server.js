
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

// 메모리 기반 감자 창고 데이터
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

// 헬스 체크
app.get("/api/ping", (req, res) => {
  res.send("pong");
});

// 감자 보관함 불러오기
app.get("/api/gamja", (req, res) => {
  const items = Object.entries(inventory).map(([name, count]) => ({ name, count }));
  const total = items.reduce((sum, item) => sum + item.count, 0);
  res.json({ total, items });
});

// 제품 만들기
app.post("/api/create-product", (req, res) => {
  const { type } = req.body;
  const name = `OrcaX${type}`;
  if (inventory[name]) {
    inventory[name]++;
  } else {
    inventory[name] = 1;
  }
  res.json({ name });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🥔 감자 서버 실행 중: http://localhost:${PORT}`);
});
