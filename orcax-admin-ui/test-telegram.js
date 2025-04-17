// test-telegram.js
require('dotenv').config();
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const message = '🐳 OrcaX 알림 테스트 메시지입니다!';

axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
  chat_id: chatId,
  text: message
})
.then(res => {
  console.log('✅ 텔레그램 메시지 전송 성공:', res.data);
})
.catch(err => {
  console.error('❌ 텔레그램 메시지 전송 실패:', err.response?.data || err.message);
});
