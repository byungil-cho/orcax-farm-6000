// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 등록
app.use(cors());
app.use(express.json());

// 기본 라우터 예시
app.get('/', (req, res) => {
  res.send('API is working!');
});

// 기존 주문 POST 예시
app.post('/order', (req, res) => {
  console.log('받은 데이터:', req.body);
  res.status(200).json({ message: 'Order received!' });
});

// ✅ 프론트에서 요청하는 /orders 엔드포인트 추가
app.post('/orders', (req, res) => {
  const order = req.body;
  console.log('📦 주문 접수:', order);

  // 필요한 경우: 문자 API, 파일 저장, 슬랙 연동 등 처리 가능

  res.status(200).json({ success: true });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

export default app;
