import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ 서버 정상 작동 중입니다.');
});

export default app;
