
const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const Product = require('../models/Product');
const ProductLog = require('../models/ProductLog');

/* ========== 로그인 ========== */
router.post('/login', async (req, res) => {
  const { nickname } = req.body;
  let user = await Farm.findOne({ nickname });
  if (!user) {
    user = await Farm.create({
      nickname,
      water: 10,
      fertilizer: 10,
      token: 5,
      lastFreeTime: new Date(),
      freeFarmCount: 2,
      seedPotato: 0,
      potatoCount: 0
    });
  }
  res.json({ success: true, nickname });
});

/* ========== 사용자 전체 리스트 ========== */
router.get('/users', async (req, res) => {
  try {
    const users = await Farm.find({}, 'nickname water fertilizer token potatoCount');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

/* ========== ✨ 새로운 /userdata 라우터 추가 ========== */
router.get('/userdata', async (req, res) => {
  const { nickname } = req.query;
  if (!nickname) {
    return res.status(400).json({ success: false, message: 'nickname이 필요함 이노마' });
  }

  const user = await Farm.findOne({ nickname });
  if (!user) {
    return res.status(404).json({ success: false, message: '없는 유저다 이놈아' });
  }

  res.json({
    success: true,
    user: {
      nickname: user.nickname,
      water: user.water,
      fertilizer: user.fertilizer,
      token: user.token,
      seedPotato: user.seedPotato || 0,
      potatoCount: user.potatoCount || 0,
      freeFarmCount: user.freeFarmCount || 0,
      lastFreeTime: user.lastFreeTime || null
    }
  });
});

/* ========== 감자 가공소 ========== */
router.post('/factory/process', async (req, res) => {
  const { nickname, productName } = req.body;
  const farm = await Farm.findOne({ nickname });
  if (!farm || farm.potatoCount <= 0) {
    return res.json({ success: false, message: '감자가 부족합니다.' });
  }

  const product = await Product.create({
    productName,
    owner: nickname,
    isSold: false
  });

  farm.potatoCount -= 1;
  await farm.save();

  res.json({ success: true, product });
});

router.get('/factory/products/:nickname', async (req, res) => {
  const products = await Product.find({ owner: req.params.nickname, isSold: false }).sort({ createdAt: -1 });
  res.json({ success: true, products });
});

/* ========== 농사 기능 ========== */
router.get('/farm/status/:nickname', async (req, res) => {
  const farm = await Farm.findOne({ nickname: req.params.nickname });
  if (!farm) return res.json({ success: false });

  const now = new Date();
  const elapsed = (now - farm.lastFreeTime) / 1000 / 60 / 60;
  let freeFarmCount = farm.freeFarmCount;
  let timeRemaining = 0;

  if (elapsed >= 2) {
    freeFarmCount = 2;
    farm.freeFarmCount = 2;
    farm.lastFreeTime = now;
    await farm.save();
  } else {
    timeRemaining = Math.ceil((2 - elapsed) * 60);
  }

  res.json({
    success: true,
    freeFarmCount,
    water: farm.water,
    fertilizer: farm.fertilizer,
    token: farm.token,
    seedPotato: farm.seedPotato || 0,
    potatoCount: farm.potatoCount || 0,
    timeRemaining
  });
});

router.post('/farm/useFree', async (req, res) => {
  const { nickname } = req.body;
  const farm = await Farm.findOne({ nickname });
  if (!farm || farm.freeFarmCount <= 0) return res.json({ success: false });
  farm.freeFarmCount--;
  farm.potatoCount++;
  await farm.save();
  res.json({ success: true, remaining: farm.freeFarmCount, potatoCount: farm.potatoCount });
});

router.post('/farm/useSeed', async (req, res) => {
  const { nickname } = req.body;
  const farm = await Farm.findOne({ nickname });
  if (!farm || farm.seedPotato <= 0) return res.json({ success: false, message: '씨감자 없음' });
  farm.seedPotato--;
  farm.potatoCount++;
  await farm.save();
  res.json({ success: true, seedPotato: farm.seedPotato, potatoCount: farm.potatoCount });
});

router.post('/farm/buySeed', async (req, res) => {
  const { nickname, quantity } = req.body;
  const cost = quantity;
  const farm = await Farm.findOne({ nickname });
  if (!farm || farm.token < cost) return res.json({ success: false, message: '토큰 부족' });

  farm.token -= cost;
  farm.potatoCount += quantity;
  await farm.save();

  res.json({ success: true, seedPotatoUsed: quantity, potatoCount: farm.potatoCount, token: farm.token });
});

/* ========== 마켓 판매 ========== */
router.post('/market/register', async (req, res) => {
  const { productId, nickname } = req.body;
  const product = await Product.findById(productId);
  if (!product || product.isSold) return res.json({ success: false, message: "유효하지 않은 제품" });

  const products = await Product.aggregate([
    { $group: { _id: '$productName', totalCount: { $sum: 1 } } }
  ]);
  const total = products.reduce((sum, p) => sum + p.totalCount, 0);
  const avg = total / products.length;
  const currentCount = products.find(p => p._id === product.productName)?.totalCount || 1;
  const price = parseFloat((1 / (currentCount / avg)).toFixed(2));

  product.isSold = true;
  await product.save();

  await ProductLog.create({
    productName: product.productName,
    action: "판매",
    owner: nickname,
    price: price,
    timestamp: new Date()
  });

  await Farm.findOneAndUpdate(
    { nickname },
    { $inc: { token: price } }
  );

  res.json({ success: true, tokenGain: price });
});

/* ========== 전광판 시세 제공 ========== */
router.get('/market', async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { isSold: true } },
      {
        $group: {
          _id: "$productName",
          count: { $sum: 1 }
        }
      }
    ]);

    const total = products.reduce((sum, p) => sum + p.count, 0);
    const avg = total / (products.length || 1);

    const result = products.map(p => ({
      name: p._id,
      price: parseFloat((1 / (p.count / avg)).toFixed(2))
    }));

    res.json(result);
  } catch (err) {
    console.error("시세 불러오기 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

/* ========== 로그 확인 ========== */
router.get('/logs/:nickname', async (req, res) => {
  const logs = await ProductLog.find({ owner: req.params.nickname })
    .sort({ timestamp: -1 })
    .limit(100);
  res.json({ logs });
});

/* ========== 감자 상태 확인용 ========== */
router.get('/감자', (req, res) => {
  res.json({ 감자: "🥔 감자 도착 완료. 서버도 살아있고 나도 이젠 지쳤다." });
});

module.exports = router;
