
const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');

router.post('/harvest', async (req, res) => {
  try {
    const { farm, count } = req.body;

    if (!farm || !count) {
      return res.status(400).json({ error: '농장 이름과 감자 수가 필요합니다.' });
    }

    await Farm.updateOne(
      { name: farm },
      { $inc: { potatoes: count } },
      { upsert: true }
    );

    res.json({ message: '수확 저장 완료', farm, added: count });
  } catch (error) {
    console.error('❌ 수확 저장 실패:', error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

module.exports = router;
