const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const axios = require("axios");

router.post("/notify", async (req, res) => {
  const { name, phone, wallet, nft } = req.body;

  const message = `
[OrcaX 주문]
🧑 이름: ${name}
📱 전화번호: ${phone}
👛 지갑주소: ${wallet}
🎁 NFT 주문내역: ${nft}
`;

  try {
    // 문자 전송
    const smsResponse = await axios.post("https://apis.aligo.in/send/", null, {
      params: {
        key: process.env.SMS_API_KEY,
        user_id: process.env.ALIGO_USER_ID,
        sender: process.env.ALIGO_SENDER,
        receiver: process.env.SELLER_PHONE,
        msg: message,
        msg_type: 'SMS'
      }
    });
    console.log("✅ 문자 전송 성공");

    // 이메일 전송
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: "[OrcaX] NFT 주문 알림",
      text: message,
    });

    console.log("✅ 이메일 전송 성공");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ 전송 실패:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;


