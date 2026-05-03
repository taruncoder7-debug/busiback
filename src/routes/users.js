const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('department');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('department');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user (admin only)
router.post('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    
    const hashedPwd = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPwd, role, department, phone });
    await user.save();
    
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user (admin or self)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === req.params.id;
    if (!isAdmin && !isSelf) return res.status(403).json({ message: 'Forbidden' });
    
    const { name, email, phone, department, active } = req.body;
    const update = { name, email, phone, department, updatedAt: new Date() };
    if (isAdmin) update.active = active;
    
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
