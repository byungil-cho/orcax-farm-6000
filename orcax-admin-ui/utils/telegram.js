const axios = require('axios');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(text) {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: text
    });
    console.log('📨 텔레그램 전송 성공:', response.data);
  } catch (err) {
    console.error('❌ 텔레그램 전송 실패:', err.response ? err.response.data : err.message);
  }
}

module.exports = sendTelegramMessage;
