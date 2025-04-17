const express = require('express');
const path = require('path');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000;

// 📦 세션 없이 간단 로그인 처리
const { router: authRouter, requireAuth } = require('./routes/auth');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 로그인 API
app.use('/api', authRouter);

// 📄 공지사항 API
const noticeRoutes = require('./routes/notices');
app.use('/api/notices', noticeRoutes);

// 💾 백업 API
const backupRoutes = require('./routes/backup');
app.use('/api/backup', backupRoutes);

// 📈 통계 API
const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);

// 📜 로그인 기록
const loginLogRoutes = require('./routes/login-log');
app.use('/api/login-log', loginLogRoutes);

// 💬 문자 전송 프록시 (3001 포트로 리다이렉트)
app.use('/api/sms', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

app.use('/api/sms-log', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

// 📍 관리자 대시보드
app.get('/admin.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 🔐 로그인 후 진입점
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// 🚀 서버 시작
app.listen(port, () => {
  console.log(`✅ OrcaX Admin UI is running at http://localhost:${port}`);
});
