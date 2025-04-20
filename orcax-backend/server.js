const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/orders', async (req, res) => {
  const { name, phone, wallet, quantity, price } = req.body;
  const message = `✅ 주문 접수
이름: ${name}
전화: ${phone}
지갑: ${wallet}
수량: ${quantity}
금액: ${price}`;

  // 텔레그램
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message
    });
    console.log("📨 텔레그램 전송 성공");
  } catch (e) {
    console.error("❌ 텔레그램 실패:", e.message);
  }

  // 이메일
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: '📧 ORCX 주문 알림',
      text: message
    });

    console.log("📧 이메일 전송 성공");
  } catch (e) {
    console.error("❌ 이메일 실패:", e.message);
  }

  // 문자 (알리고)
  try {
    await axios.post('https://apis.aligo.in/send/', null, {
      params: {
        key: process.env.ALIGO_API_KEY,
        user_id: process.env.ALIGO_USER_ID,
        sender: process.env.ALIGO_SENDER,
        receiver: process.env.SELLER_PHONE,
        msg: message,
        title: 'ORCX 주문 알림'
      }
    });
    console.log("📱 문자 전송 성공");
  } catch (e) {
    console.error("❌ 문자 실패:", e.message);
  }

  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
