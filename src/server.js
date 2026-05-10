require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
mongoose.set('bufferCommands', false);

// Middleware
app.use(cors());
app.use(express.json());

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: isDatabaseConnected() ? 'connected' : 'disconnected'
  });
});

app.use('/api', (req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      message: 'Database is not connected. Check MONGO_URI in the backend environment.'
    });
  }
  next();
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/company_db';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000
})
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));

// Serve frontend in production (assumes Vite build output in ../frontend/dist)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../frontend/dist')
  if (require('fs').existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')))
  }
}

// Socket.IO for real-time chat
const Message = require('./models/Message');
const { authMiddleware } = require('./middleware/auth');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });
  
  socket.on('send-message', async (data) => {
    try {
      const { room, message, userId } = data;
      const msg = new Message({
        room,
        sender: userId,
        message
      });
      await msg.save();
      io.to(room).emit('receive-message', { message, userId, timestamp: new Date() });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`💬 WebSocket ready for real-time chat`);
});

