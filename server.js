
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 6000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB 연결
const mongoUrl = process.env.MONGODB_URL || process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("❌ MongoDB 연결 주소(MONGODB_URL 또는 MONGO_URL)가 정의되지 않았습니다.");
  process.exit(1);
}

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB 연결 완료");
})
.catch(err => {
  console.error("❌ Mongo 연결 실패:", err.message);
  process.exit(1);
});

// ✅ 기본 API 라우트 예시
app.get("/api/status", (req, res) => {
  res.json({ message: "감자 API 정상 작동 중!" });
});

// 여기에 다른 라우터들 계속 추가 가능

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 감자 서버 ${PORT}번 포트에서 작동 중`);
});


