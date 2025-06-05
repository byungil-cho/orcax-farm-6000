
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/orcax', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB 연결됨'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// Farm 모델 정의 (간단한 스키마 예시)
const farmSchema = new mongoose.Schema({
  nickname: String,
  water: Number,
  fertilizer: Number,
  token: Number,
  potatoCount: Number
});
const Farm = mongoose.model('Farm', farmSchema);

// 기존 API
app.get('/api/users', async (req, res) => {
  try {
    const users = await Farm.find({}, 'nickname water fertilizer token potatoCount');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 추가된 API
app.get('/api/userdata', async (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ success: false, message: '닉네임이 필요합니다.' });

  try {
    const user = await Farm.findOne({ nickname });
    if (!user) return res.json({ success: false, message: '사용자를 찾을 수 없습니다.' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
