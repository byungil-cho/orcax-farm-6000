require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 6000;

const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL;
if (!mongoUrl) {
  console.error("❌ MONGO_URL 환경변수가 필요합니다!");
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ API 라우터 연결
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// ✅ MongoDB 연결
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB 연결 성공!");
})
.catch(err => {
  console.error("❌ MongoDB 연결 실패:", err.message);
  process.exit(1);
});

// ✅ 서버 상태 확인용 라우트
app.get("/api/status", (req, res) => {
  res.json({ message: "🥔 감자 서버 작동 중!" });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 감자 서버가 ${PORT}번 포트에서 실행 중입니다!`);
});

