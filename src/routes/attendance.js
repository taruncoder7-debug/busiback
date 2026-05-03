const express = require('express');
const Attendance = require('../models/Attendance');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get attendance records
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query = { userId: req.user.id };
    }
    
    const records = await Attendance.find(query)
      .populate('userId', 'name email')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clock in
router.post('/clock-in', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let record = await Attendance.findOne({ userId: req.user.id, date: today });
    if (!record) {
      record = new Attendance({
        userId: req.user.id,
        date: today,
        clockIn: new Date(),
        status: 'present'
      });
    } else {
      record.clockIn = new Date();
    }
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clock out
router.post('/clock-out', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const record = await Attendance.findOne({ userId: req.user.id, date: today });
    if (!record) return res.status(404).json({ message: 'No clock-in found' });
    
    record.clockOut = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance by user ID (manager/admin)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'employee' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const records = await Attendance.find({ userId: req.params.userId })
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update attendance (admin/manager)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const { status, notes, clockIn, clockOut } = req.body;
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, notes, clockIn, clockOut },
      { new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
