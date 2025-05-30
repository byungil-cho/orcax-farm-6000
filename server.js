const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// 환경변수 불러오기 (.env 파일에서 PORT 등 가져오기)
require('dotenv').config();

// MongoDB 연결
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB 연결 성공!'))
.catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// 👉 API 라우터 연결 (api.js 포함)
const apiRouter = require('./api');
app.use('/api', apiRouter);

// 서버 실행 포트 설정
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

