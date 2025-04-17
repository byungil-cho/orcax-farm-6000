const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 문자 전송 라우터
const smsRoutes = require('./routes/sms');
app.use('/api/sms', smsRoutes);

// 문자 로그 조회 라우터
const smsLogRoutes = require('./routes/sms-log');
app.use('/api/sms-log', smsLogRoutes);

// 테스트용 루트
app.get('/', (req, res) => {
  res.send('📡 OrcaX SMS Backend is alive!');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ OrcaX SMS Server is running at http://localhost:${PORT}`);
});
