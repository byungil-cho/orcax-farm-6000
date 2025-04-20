require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const nodemailer = require('nodemailer');
const axios = require('axios');

const connection = new Connection('https://api.mainnet-beta.solana.com');
const sellerWallet = new PublicKey('VxuxprfZzUuUonU7cBJtGngs1LGF5DcqR4iRFKWp7DZ');

function sendEmail() {
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
    text: '팬텀 지갑에 ORCX가 입금되었습니다. 확인해주세요!'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
    else console.log('Email sent: ' + info.response);
  });
}

function sendSMS() {
  const smsUrl = 'https://apis.aligo.in/send/';
  const payload = new URLSearchParams({
    key: process.env.ALIGO_API_KEY,
    user_id: process.env.ALIGO_USER_ID,
    sender: process.env.ALIGO_SENDER,
    receiver: process.env.SELLER_PHONE,
    msg: '📱 ORCX 구매 발생! 지갑을 확인하세요.',
    title: 'ORCX 알림'
  });

  axios.post(smsUrl, payload)
    .then(response => console.log('SMS sent:', response.data))
    .catch(error => console.log('SMS error:', error));
}

function sendTelegram() {
  const msg = encodeURIComponent('📢 ORCX 구매 발생! 팬텀 지갑을 확인하세요.');
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${msg}`;
  axios.get(url)
    .then(() => console.log('Telegram message sent.'))
    .catch(err => console.log('Telegram error:', err));
}

connection.onAccountChange(sellerWallet, () => {
  console.log('💸 ORCX 입금 감지됨! 알림 전송 시작...');
  sendEmail();
  sendSMS();
  sendTelegram();
});

