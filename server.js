// ✅ 1. 환경변수 제일 먼저 불러야 함
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 6000;

// ✅ 2. MONGO_URL 없으면 서버 종료
const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL;
if (!mongoUrl) {
  console.error("❌ MONGO_URL 환경변수가 필요합니다!");
  process.exit(1);
}

// ✅ 3. 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 4. API 라우터 연결
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// ✅ 5. MongoDB 연결 시도
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

// ✅ 6. 헬스 체크
app.get("/api/status", (req, res) => {
  res.json({ message: "🥔 감자 서버 작동 중!" });
});

// ✅ 7. 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 감자 서버가 ${PORT}번 포트에서 실행 중입니다!`);
});


