const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(bodyParser.json());

// 👋 감자 핑 응답
app.get("/api/ping", (req, res) => {
  console.log("✅ 감자 공장 ping 받음");
  res.json({ message: "pong" });
});

// 감자 수확 (예시)
app.post("/api/harvest", (req, res) => {
  const { farm, count } = req.body;
  console.log(`🌾 수확 도착: ${farm} 농장에서 ${count}개`);
  res.json({ status: "success", count });
});

// 감자 제품 만들기 (예시)
app.post("/api/create-product", (req, res) => {
  const { type, farm } = req.body;
  console.log(`🥔 제품 생산: ${type} from ${farm}`);
  res.json({ name: type, result: "done" });
});

// 🧃 감자 보관함 조회
app.get("/api/gamja", (req, res) => {
  res.json({
    potatoes: 12,
    harvested: 4,
    items: [
      { name: "감자칩", count: 2 },
      { name: "감자전", count: 1 }
    ]
  });
});

// 🎤 서버 시작
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 server.js 가동 중 at port ${PORT}`);
});