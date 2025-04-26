const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new MongoClient(process.env.MONGO_URI);
let users;

async function start() {
  await client.connect();
  const db = client.db('orcax');
  users = db.collection('users');
  console.log('✅ 몽고DB 연결 성공');

  app.listen(3020, () => {
    console.log('✅ 서버 실행 중 (포트 3020)');
  });
}
start();

// nodemailer 설정 (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '당신의이메일@gmail.com',  // 본인 Gmail 주소
    pass: '앱비밀번호'                // Gmail 앱 비밀번호
  }
});

// 회원가입 API
app.post('/api/register', async (req, res) => {
  try {
    const { wallet, email, password } = req.body;
    if (!wallet || !email || !password) {
      return res.status(400).json({ success: false, message: "❌ 모든 필드를 입력하세요" });
    }
    const exists = await users.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "❌ 이미 존재하는 이메일입니다" });
    }
    await users.insertOne({ wallet, email, password });
    res.json({ success: true, message: "✅ 회원가입 성공" });
  } catch (err) {
    console.error('❌ 회원가입 오류:', err);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ success: false, message: "❌ 이메일 또는 비밀번호가 틀렸습니다" });
    }
    res.json({ success: true, message: "✅ 로그인 성공" });
  } catch (err) {
    console.error('❌ 로그인 오류:', err);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 비밀번호 찾기 API 추가 (NEW)
app.get('/api/find-password', async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) {
      return res.status(400).json({ success: false, message: "❌ 지갑 주소를 입력하세요" });
    }
    const user = await users.findOne({ wallet });
    if (!user) {
      return res.json({ success: false, message: "❌ 등록된 지갑 주소가 없습니다" });
    }
    res.json({ success: true, password: user.password });
  } catch (error) {
    console.error('❌ 비밀번호 찾기 오류:', error);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 비밀번호 재설정 링크 이메일 발송 API
app.post('/api/send-reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "❌ 이메일을 입력하세요" });
    }
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "❌ 해당 이메일로 등록된 사용자가 없습니다" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpire = Date.now() + 1000 * 60 * 15; // 15분 유효

    await users.updateOne({ email }, { $set: { resetToken, resetTokenExpire } });

    const resetLink = `https://orcax-roulette-backend.onrender.com/reset-password.html?token=${resetToken}`;

    await transporter.sendMail({
      from: '당신의이메일@gmail.com',
      to: email,
      subject: '비밀번호 재설정 링크',
      html: `
        <p>비밀번호를 재설정하려면 아래 링크를 클릭하세요:</p>
        <a href="${resetLink}">비밀번호 재설정하기</a>
        <p>링크는 15분 동안만 유효합니다.</p>
      `
    });

    res.json({ success: true, message: "✅ 비밀번호 재설정 링크가 이메일로 전송되었습니다." });

  } catch (error) {
    console.error('❌ 비밀번호 재설정 메일 오류:', error);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});

// 비밀번호 재설정 API
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "❌ 토큰과 새 비밀번호를 입력하세요" });
    }

    const user = await users.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ success: false, message: "❌ 유효하지 않거나 만료된 토큰입니다" });
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { password: newPassword }, $unset: { resetToken: "", resetTokenExpire: "" } }
    );

    res.json({ success: true, message: "✅ 비밀번호가 성공적으로 변경되었습니다" });

  } catch (error) {
    console.error('❌ 비밀번호 변경 오류:', error);
    res.status(500).json({ success: false, message: "❌ 서버 오류" });
  }
});
