const express = require('express');
const router = express.Router();
const session = require('express-session');
require('dotenv').config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'orcax1234';

// 세션 설정
router.use(
  session({
    secret: 'orcax-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } // 1시간
  })
);

// 로그인 처리
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// 로그아웃 처리
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
});

// 인증 확인 미들웨어
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

module.exports = { router, requireAuth };
