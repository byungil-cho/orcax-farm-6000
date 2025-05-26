const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const farmRoutes = require('./routes/farm');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/farm', farmRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB 연결 완료'))
.catch((err) => console.error('❌ MongoDB 연결 실패', err));

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`🚀 감자 서버 작동 중: http://localhost:${PORT}`);
});