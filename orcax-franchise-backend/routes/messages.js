const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: '메시지 불러오기 실패' });
  }
});

router.post('/', async (req, res) => {
  const { nickname, content, type } = req.body;
  if (!nickname || !content) {
    return res.status(400).json({ error: '닉네임과 내용은 필수입니다' });
  }

  try {
    const newMessage = new Message({ nickname, content, type });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: '메시지 저장 실패' });
  }
});

module.exports = router;
