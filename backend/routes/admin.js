const express = require('express');
const router = express.Router();
const { User, Message } = require('../src/models');

router.get('/users', async (req, res) => {
  const users = await User.findAll({ attributes: ['id', 'phone', 'name', 'isOnline'] });
  res.json({ users });
});

router.get('/stats', async (req, res) => {
  const totalUsers = await User.count();
  const totalMessages = await Message.count();
  const onlineUsers = await User.count({ where: { isOnline: true } });
  res.json({ totalUsers, totalMessages, onlineUsers });
});

module.exports = router;
