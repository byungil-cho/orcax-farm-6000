const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6000;

// 🔧 CORS 설정 – 감자 외부 접근 허용
app.use(cors({
  origin: 'https://climbing-wholly-grouper.ngrok-free.app',
  credentials: true
}));

app.use(express.json());

// 🧪 몽고DB 감자창고 연결
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/orcax', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB 연결 완료'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 🛠️ 세션 설정 – 쿠키로 감자들 기억
app.use(session({
  secret: 'orcax_secret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/orcax'
  })
}));

app.use(passport.initialize());
app.use(passport.session());

// 📦 감자 API 라우터 연결
const apiRoutes = require('./api'); // 같은 폴더에 api.js가 있어야 함
app.use('/api', apiRoutes);

// 🧪 감자 핑 테스트
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: "감자 서버 살아있음!" });
});

// 🚀 감자 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 감자 서버 구동 중: http://localhost:${PORT}`);
});
