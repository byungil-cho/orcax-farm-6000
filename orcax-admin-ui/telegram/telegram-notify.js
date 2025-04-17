const axios = require('axios');

const TOKEN = '여기에_봇토큰_입력';
const CHAT_ID = '2110580333'; // 아미한테 보고된 ID

function sendTelegramMessage(message) {
  return axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: message,
  })
  .then(() => console.log('✅ 텔레그램 메시지 전송됨'))
  .catch(err => console.error('❌ 텔레그램 메시지 실패:', err));
}

module.exports = sendTelegramMessage;
