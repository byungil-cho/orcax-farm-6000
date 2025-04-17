const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// 주문 데이터 백업
router.get('/orders', (req, res) => {
  const filePath = path.join(__dirname, '../data/orders.json');
  res.download(filePath);
});

// 문자 로그 백업
router.get('/sms', (req, res) => {
  const filePath = path.join(__dirname, '../data/sms-log.json');
  res.download(filePath);
});

// 룰렛 점수 백업
router.get('/spins', (req, res) => {
  const filePath = path.join(__dirname, '../data/spins.json');
  res.download(filePath);
});

// 공지사항 백업
router.get('/notices', (req, res) => {
  const filePath = path.join(__dirname, '../data/notice.json');
  res.download(filePath);
});

// 📥 통계 통합 JSON 다운로드
router.get('/stats', (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/orders.json'), 'utf-8'));
    const smsLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sms-log.json'), 'utf-8'));
    const spins = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/spins.json'), 'utf-8'));

    const result = { orders, smsLog, spins };

    res.setHeader('Content-Disposition', 'attachment; filename="stats.json"');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('❌ 통계 백업 에러:', err);
    res.status(500).json({ error: '통계 백업 실패' });
  }
});

// 📥 통계 통합 Excel 다운로드
router.get('/stats/excel', async (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/orders.json'), 'utf-8'));
    const smsLog = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sms-log.json'), 'utf-8'));
    const spins = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/spins.json'), 'utf-8'));

    const workbook = new ExcelJS.Workbook();

    const ordersSheet = workbook.addWorksheet('Orders');
    const smsSheet = workbook.addWorksheet('SMS Logs');
    const spinsSheet = workbook.addWorksheet('Spins');

    if (orders.length > 0) {
      ordersSheet.columns = Object.keys(orders[0]).map(key => ({ header: key, key }));
      orders.forEach(row => ordersSheet.addRow(row));
    }

    if (smsLog.length > 0) {
      smsSheet.columns = Object.keys(smsLog[0]).map(key => ({ header: key, key }));
      smsLog.forEach(row => smsSheet.addRow(row));
    }

    if (spins.length > 0) {
      spinsSheet.columns = Object.keys(spins[0]).map(key => ({ header: key, key }));
      spins.forEach(row => spinsSheet.addRow(row));
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="stats.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ 엑셀 통계 백업 실패:', err);
    res.status(500).json({ error: '엑셀 백업 실패' });
  }
});

module.exports = router;
