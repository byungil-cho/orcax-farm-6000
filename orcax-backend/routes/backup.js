// routes/backup.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const router = express.Router();

const DATA_PATH = path.join(__dirname, '../data/orders.json');
const OUTPUT_PATH = path.join(__dirname, '../data/backup.xlsx');

router.get('/download/excel', async (req, res) => {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return res.status(404).send('주문 데이터가 없습니다.');
    }

    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('OrcaX 주문내역');

    // ✅ 컬럼명 한글화
    worksheet.columns = [
      { header: '이름', key: 'name' },
      { header: '전화번호', key: 'phone' },
      { header: '팬텀 지갑 주소', key: 'wallet' },
      { header: '수량', key: 'qty' },
      { header: 'NFT 상품명', key: 'nft' },
      { header: '주문 시간', key: 'timestamp' }
    ];

    data.forEach(entry => {
      worksheet.addRow(entry);
    });

    await workbook.xlsx.writeFile(OUTPUT_PATH);
    res.download(OUTPUT_PATH);

  } catch (err) {
    console.error('엑셀 생성 실패:', err.message);
    res.status(500).send('엑셀 파일 생성 중 오류 발생');
  }
});

module.exports = router;
