// server.js (메타버스급 감자 백엔드 통제실)
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // .env로 환경변수 불러옴

const app = express();
const PORT = process.env.PORT || 6000;

// 🔌 감자 전기 배선 통합
const apiRouter = require("./api");

// 🧠 미들웨어 등록
app.use(cors());
app.use(bodyParser.json());
app.use("/api", apiRouter);

// ✅ 상태 확인용 API
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", meta: "감자 메타버스 가동 중" });
});

// 🏁 서버 시동
app.listen(PORT, () => {
  console.log(`🚀 감자 서버 작동 중: http://localhost:${PORT}`);
});
