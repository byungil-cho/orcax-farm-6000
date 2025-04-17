const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000;

// 📦 미들웨어 세팅
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 로그인 관련 라우터
const { router: authRouter, requireAuth } = require('./routes/auth');
app.use('/api', authRouter);

// 📢 공지사항 라우터 등록
const noticeRoutes = require('./routes/api/notices');
app.use('/api/notices', noticeRoutes);

// 💾 백업 API
const backupRoutes = require('./routes/backup');
app.use('/api/backup', backupRoutes);

// 📈 통계 API
const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);

// 📜 로그인 기록 API
const loginLogRoutes = require('./routes/login-log');
app.use('/api/login-log', loginLogRoutes);

// 💬 문자 프록시 - 다른 서버로 넘김
app.use('/api/sms', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

app.use('/api/sms-log', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

// 👮‍♀️ 관리자 페이지 (로그인 필요)
app.get('/admin.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 👋 루트 진입시 로그인 페이지로 리디렉션
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// 🚀 서버 스타트!
app.listen(port, () => {
  console.log(`✅ OrcaX Admin UI is running at http://localhost:${port}`);
});
