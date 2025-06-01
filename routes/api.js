const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const Product = require('../models/Product');
const ProductLog = require('../models/ProductLog');

// 감자 가공 - 감자 → 감자제품
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

// 📦 창고에서 가공제품 보기
router.get('/factory/products/:nickname', async (req, res) => {
  const products = await Product.find({ owner: req.params.nickname, isSold: false })
    .sort({ createdAt: -1 });
  res.json({ success: true, products });
});

/* ========================
    🧑‍🌾 사용자 로그인 시 기본 지급 기능 추가
   ======================== */

// POST /api/login → 유저 최초 로그인 시 기본 자원 제공 + 시간 등록
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

// GET /api/farm/status/:nickname → 시간 기준 무료 농사 여부 판단
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
    timeRemaining = Math.ceil((2 - elapsed) * 60); // 분 단위 남은 시간
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

// POST /api/farm/useFree → 무료 농사 1회 차감
router.post('/farm/useFree', async (req, res) => {
  const { nickname } = req.body;
  const farm = await Farm.findOne({ nickname });
  if (!farm || farm.freeFarmCount <= 0) return res.json({ success: false });
  farm.freeFarmCount--;
  farm.potatoCount++;
  await farm.save();
  res.json({ success: true, remaining: farm.freeFarmCount, potatoCount: farm.potatoCount });
});

// POST /api/farm/useSeed → 씨감자 농사 (씨감자 1개 → 감자 1개 수확)
router.post('/farm/useSeed', async (req, res) => {
  const { nickname } = req.body;
  const farm = await Farm.findOne({ nickname });
  if (!farm || farm.seedPotato <= 0) return res.json({ success: false, message: '씨감자 없음' });
  farm.seedPotato--;
  farm.potatoCount++;
  await farm.save();
  res.json({ success: true, seedPotato: farm.seedPotato, potatoCount: farm.potatoCount });
});

// POST /api/farm/buySeed → 씨감자 구매 후 즉시 농사 (1개당 1토큰)
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

// POST /api/market/register → 판매 처리 + 로그
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

// GET /api/logs/:nickname → 판매 로그 불러오기
router.get('/logs/:nickname', async (req, res) => {
  const logs = await ProductLog.find({ owner: req.params.nickname })
    .sort({ timestamp: -1 })
    .limit(100);
  res.json({ logs });
});

module.exports = router;