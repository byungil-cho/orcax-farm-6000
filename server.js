
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 6000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB 연결 완료"))
.catch(err => console.error("❌ MongoDB 연결 실패:", err));

app.use(cors());
app.use(bodyParser.json());

const harvestRouter = require('./routes/harvest');
app.use('/api', harvestRouter);

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
