require('dotenv').config();
const express = require('express');
const cors = require('cors');
const smsRoutes = require('./routes/sms');

const app = express();
const PORT = process.env.PORT || 3004;

// CORS 허용 (브라우저에서 fetch 요청 막히지 않게)
app.use(cors());

// JSON 파싱 (body-parser 안 써도 됨)
app.use(express.json());

// SMS API 라우터 등록
app.use('/api/sms', smsRoutes);

// 환경변수 확인용 로그
console.log('📦 Loaded PORT:', process.env.PORT);
console.log('🔑 Loaded API Key:', process.env.SMS_API_KEY);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 SMS 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});

