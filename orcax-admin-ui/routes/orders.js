const now = new Date().toLocaleString();
const message = `
🛒 [주문 알림]
- 이름: ${orderData.name}
- 상품: ${orderData.item}
- 금액: ${orderData.amount || '확인 중'}
- 시간: ${now}
`;
sendTelegramMessage(message);
