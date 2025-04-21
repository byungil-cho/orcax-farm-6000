require('dotenv').config();
const express = require('express');
const app = express();
const { Connection, PublicKey } = require('@solana/web3.js');
const nodemailer = require('nodemailer');
const axios = require('axios');

app.use(express.json());

// 기본 API (POST /order)
app.post('/order', (req, res) => {
  const { name, phone, wallet, quantity, nft } = req.body;
  console.log('📥 주문 접수:', { name, phone, wallet, quantity, nft });

  sendEmail(name, phone, wallet, quantity, nft);
  sendSMS(phone);
  sendTelegram(name);

  res.send({ success: true });
});

// Solana 지갑 감지 (원래 기능 유지)
const connection = new Connection('https://api.mainnet-beta.solana.com');
const sellerWallet = new PublicKey('VxuxprfZzUuUonU7cBJtGngs1LGF5DcqR4iRFKWp7DZ');
connection.onAccountChange(sellerWallet, () => {
  console.log('💸 ORCX 입금 감지됨! 알림 전송 시작...');
  sendEmail();
  sendSMS();
  sendTelegram();
});

// 이메일 알림
function sendEmail(name, phone, wallet, quantity, nft) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECEIVER,
    subject: '🛒 ORCX 구매 알림',
    text: `📥 주문자: ${name}\n📱 전화번호: ${phone}\n👛 지갑주소: ${wallet}\n🎟️ 수량: ${nft}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
    else console.log('Email sent: ' + info.response);
  });
}

// SMS 알림
function sendSMS(phone = process.env.SELLER_PHONE) {
  const smsUrl = 'https://apis.aligo.in/send/';
  const payload = new URLSearchParams({
    key: process.env.ALIGO_API_KEY,
    user_id: process.env.ALIGO_USER_ID,
    sender: process.env.ALIGO_SENDER,
    receiver: phone,
    msg: '📱 ORCX 구매 발생! 지갑을 확인하세요.',
    title: 'ORCX 알림'
  });

  axios.post(smsUrl, payload)
    .then(response => console.log('SMS sent:', response.data))
    .catch(error => console.log('SMS error:', error));
}

// Telegram 알림
function sendTelegram(name = '익명') {
  const msg = encodeURIComponent(`📢 ${name}님의 ORCX 구매 발생! 팬텀 지갑을 확인하세요.`);
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${msg}`;
  axios.get(url)
    .then(() => console.log('Telegram message sent.'))
    .catch(err => console.log('Telegram error:', err));
}

// 서버 시작
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));

