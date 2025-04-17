const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const ordersRouter = require('./routes/orders');
app.use('/orders', ordersRouter);
app.use(cors());
app.use(bodyParser.json());

// 테스트용 기본 라우터
app.get('/', (req, res) => {
  res.send('Hello from OrcaX backend, where dreams go to debug.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
