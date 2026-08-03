const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { sequelize } = require('./src/models');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ========== CORS ঠিক করা ==========
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ========== ডাটাবেস কানেক্ট ==========
sequelize.sync({ alter: true })
  .then(() => console.log('✅ PostgreSQL connected!'))
  .catch(err => console.error('❌ Database error:', err));

// ========== ফাইল আপলোড কনফিগ ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter 
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ 
    success: true, 
    fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
    fileType: req.file.mimetype
  });
});

// ========== রাউট ==========
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send('Server running!'));

// ========== Socket.io ==========
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ========== ডিভাইস ট্র্যাকিং ==========
const deviceSessions = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Auth error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.phone;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  const deviceId = socket.handshake.query.deviceId || 'web-' + Date.now();
  const deviceName = socket.handshake.query.deviceName || 'Unknown Device';
  
  if (!deviceSessions.has(userId)) deviceSessions.set(userId, []);
  const userDevices = deviceSessions.get(userId);
  const existing = userDevices.find(d => d.deviceId === deviceId);
  
  if (!existing) {
    userDevices.push({ deviceId, deviceName, connectedAt: new Date().toISOString(), lastActive: new Date().toISOString(), socketId: socket.id });
  } else {
    existing.lastActive = new Date().toISOString();
    existing.socketId = socket.id;
  }
  deviceSessions.set(userId, userDevices);
  socket.emit('deviceList', userDevices);
  socket.broadcast.emit('userOnline', { userId, status: 'online' });

  // টাইপিং
  socket.on('typing', ({ receiverId }) => {
    socket.to(`user_${receiverId}`).emit('typing', { from: userId });
  });
  socket.on('stopTyping', ({ receiverId }) => {
    socket.to(`user_${receiverId}`).emit('stopTyping', { from: userId });
  });

  // মেসেজ
  socket.on('sendMessage', (msg) => {
    const messageId = Date.now().toString();
    const msgWithId = { ...msg, id: messageId, delivered: false, read: false };
    io.to(`user_${msg.receiver}`).emit('receiveMessage', msgWithId);
    socket.emit('messageDelivered', { messageId });
  });

  socket.on('messageRead', ({ messageId, senderId }) => {
    io.to(`user_${senderId}`).emit('messageRead', { messageId });
  });

  // ডিভাইস
  socket.on('getDevices', () => {
    socket.emit('deviceList', deviceSessions.get(userId) || []);
  });
  socket.on('logoutDevice', ({ deviceId: targetId }) => {
    const devices = deviceSessions.get(userId) || [];
    const target = devices.find(d => d.deviceId === targetId);
    if (target) {
      io.to(target.socketId).emit('forceLogout');
      const updated = devices.filter(d => d.deviceId !== targetId);
      deviceSessions.set(userId, updated);
      socket.emit('deviceList', updated);
    }
  });
  socket.on('logoutAllDevices', () => {
    const devices = deviceSessions.get(userId) || [];
    devices.forEach(d => { if (d.socketId !== socket.id) io.to(d.socketId).emit('forceLogout'); });
    const updated = devices.filter(d => d.socketId === socket.id);
    deviceSessions.set(userId, updated);
    socket.emit('deviceList', updated);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('userOffline', { userId });
    const devices = deviceSessions.get(userId) || [];
    const updated = devices.filter(d => d.socketId !== socket.id);
    if (updated.length === 0) deviceSessions.delete(userId);
    else deviceSessions.set(userId, updated);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
