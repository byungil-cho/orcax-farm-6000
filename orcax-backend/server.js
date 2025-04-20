const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ✔️ 경로명 수정: routes → 경로
const ordersRouter = require('./경로/orders');

app.use(cors());
app.use(bodyParser.json());

// REST API 경로 등록
app.use('/orders', ordersRouter);

// 테스트 라우터
app.get('/', (req, res) => {
  res.send('Hello from OrcaX backend, where dreams go to debug.');
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
