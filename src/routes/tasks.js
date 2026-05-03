const express = require('express');
const Task = require('../models/Task');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get tasks (filter by user role)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'employee') {
      query = { assignedTo: req.user.id };
    } else {
      query = {};
    }
    
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy')
      .populate('assignedTo');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task (admin/manager)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admin/manager can create tasks' });
    }
    
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      createdBy: req.user.id,
      assignedTo,
      priority,
      dueDate
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, status, priority, dueDate, updatedAt: new Date() },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status (employee can update own tasks)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Cannot update other\'s tasks' });
    }
    
    task.status = status;
    task.updatedAt = new Date();
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task (admin/manager)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
