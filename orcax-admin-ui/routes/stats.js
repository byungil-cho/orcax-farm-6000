const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 통계 API
router.get('/', (req, res) => {
  try {
    // 주문 수량
    const ordersPath = path.join(__dirname, '../data/orders.json');
    const smsPath = path.join(__dirname, '../data/sms-log.json');
    const spinsPath = path.join(__dirname, '../data/spins.json');

    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8')) || [];
    const smsLogs = JSON.parse(fs.readFileSync(smsPath, 'utf-8')) || [];
    const spins = JSON.parse(fs.readFileSync(spinsPath, 'utf-8')) || [];

    const orderCount = orders.length;
    const smsCount = smsLogs.length;
    const spinTotal = spins.reduce((sum, item) => sum + (item.score || 0), 0);

    res.json({ orderCount, smsCount, spinTotal });
  } catch (err) {
    console.error('📛 통계 API 오류:', err);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

module.exports = router;
