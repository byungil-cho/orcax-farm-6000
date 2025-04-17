// controllers/ordersController.js

const fs = require('fs');
const path = require('path');

// 주문 저장 경로 (임시 JSON DB 대체)
const ordersFile = path.join(__dirname, '../data/orders.json');

// 주문 저장
function saveOrder(order) {
  const existing = fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile)) : [];
  existing.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(existing, null, 2));
}

// 주문 생성 컨트롤러
exports.createOrder = (req, res) => {
  const { name, phone, wallet, product, quantity } = req.body;

  if (!name || !phone || !wallet || !product || !quantity) {
    return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
  }

  const newOrder = {
    id: Date.now(),
    name,
    phone,
    wallet,
    product,
    quantity,
    status: 'pending'
  };

  saveOrder(newOrder);

  // TODO: 여기에 텔레그램 알림 연동할 예정
  console.log('✅ 주문 생성됨:', newOrder);

  res.status(201).json({ message: '주문이 접수되었습니다.', order: newOrder });
};
