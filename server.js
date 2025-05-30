
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Mongo 연결
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Mongo 연결 성공!'))
.catch(err => console.error('❌ Mongo 연결 실패:', err));

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ✅ API 라우터 연결
const apiRouter = require('./api');
app.use('/api', apiRouter);

// 포트 설정 및 서버 시작
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`🚀 감자 서버 ${PORT}번 포트에서 실행 중!`);
});

