// server.js
import dotenv from 'dotenv';
dotenv.config();

require("dotenv").config();
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors'); // ✅ CORS 불러오기

dotenv.config();

const app = express();

app.use(cors()); // ✅ CORS 설정 적용

app.use(bodyParser.json());

// 여기부터 라우터, 엔드포인트 등등
app.get('/api/test', (req, res) => {
  res.send('CORS 설정 성공!');
});
app.listen(3010, () => {
  console.log('서버가 3010번 포트에서 실행 중입니다.');
});

const sendSMS = async (phone, msg) => {
  const response = await axios.post('https://apis.aligo.in/send/', new URLSearchParams({
    key: process.env.ALIGO_API_KEY,
    user_id: process.env.ALIGO_USER_ID,
    sender: process.env.ALIGO_SENDER,
    receiver: phone,
    msg,
    title: '📢 ORCX 주문 알림'
  }));

  return res.data;// ✅ 수정된 부분
};

const sendEmail = async (subject, text) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"OrcaX 알림봇" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_RECEIVER,
    subject,
    text,
  });
};

app.post('/api/notify', async (req, res) => {
  const { name, phone, wallet, nft } = req.body;
  const msg = `📦 주문 도착!\n\n🧑 이름: ${name}\n📱 전화: ${phone}\n👛 지갑: ${wallet}\n🪙 NFT: ${nft}`;

  try {
    const sms = await sendSMS(process.env.SELLER_PHONE, msg);
    console.log('✅ 문자 전송 성공:', sms);

    await sendEmail('📢 OrcaX 주문 알림', msg);
    console.log('📬 이메일 전송 성공');

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ 알림 전송 실패:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 알림 서버가 포트 ${PORT}에서 실행 중입니다.`);
});


app.listen(PORT, () => {
  console.log(`🚀 알림 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

