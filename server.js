
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

// Farm 모델 정의 (카카오 닉네임 기반 사용자 관리)
const farmSchema = new mongoose.Schema({
  nickname: String, // ✅ 카카오 로그인에서 받은 닉네임
  water: Number,
  fertilizer: Number,
  token: Number,
  potatoCount: Number
});
const Farm = mongoose.model('Farm', farmSchema);

// 전체 사용자 조회
app.get('/api/users', async (req, res) => {
  try {
    const users = await Farm.find({}, 'nickname water fertilizer token potatoCount');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 카카오 닉네임으로 개별 사용자 조회
app.get('/api/userdata', async (req, res) => {
  const nickname = req.query.nickname;
  if (!nickname) return res.status(400).json({ success: false, message: '카카오 닉네임이 필요합니다.' });

  try {
    const user = await Farm.findOne({ nickname });
    if (!user) return res.json({ success: false, message: '카카오 닉네임에 해당하는 사용자를 찾을 수 없습니다.' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
