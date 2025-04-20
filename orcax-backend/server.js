import express from 'express';
import cors from 'cors';

const app = express();

// 미들웨어 등록
app.use(cors());
app.use(express.json());

// 기본 라우터 예시
app.get('/', (req, res) => {
  res.send('API is working!');
});

// POST 예시
app.post('/order', (req, res) => {
  console.log('받은 데이터:', req.body);
  res.status(200).json({ message: 'Order received!' });
});

export default app;
