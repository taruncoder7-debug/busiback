const express = require('express');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const User = require('../models/User');
const InventoryItem = require('../models/InventoryItem');
const Attendance = require('../models/Attendance');
const Invoice = require('../models/Invoice');
const Purchase = require('../models/Purchase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data (role-dependent)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    
    let data = {};
    
    if (role === 'admin') {
      const totalUsers = await User.countDocuments();
      const totalTasks = await Task.countDocuments();
      const lowStockItems = await InventoryItem.countDocuments({
        $expr: { $lte: ['$quantity', '$reorderLevel'] }
      });
      const totalInvoices = await Invoice.countDocuments();
      const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
      
      data = {
        widgets: [
          { kpi: 'Total Employees', value: totalUsers, icon: 'people' },
          { kpi: 'Total Tasks', value: totalTasks, icon: 'tasks' },
          { kpi: 'Low Stock Items', value: lowStockItems, icon: 'alert' },
          { kpi: 'Total Revenue', value: '$1,200,000', icon: 'money' }
        ],
        recentTasks: await Task.find().limit(5).populate('assignedTo', 'name').sort({ createdAt: -1 }),
        lowStockAlerts: await InventoryItem.find({
          $expr: { $lte: ['$quantity', '$reorderLevel'] }
        }).limit(5)
        ,
        recentInvoices: await Invoice.find().limit(5).sort({ invoiceDate: -1 }),
        recentPurchases: await Purchase.find().limit(5).sort({ purchaseDate: -1 })
      };
    } else if (role === 'manager') {
      const teamTasks = await Task.countDocuments({ createdBy: req.user.id });
      const completedTasks = await Task.countDocuments({ createdBy: req.user.id, status: 'completed' });
      
      data = {
        widgets: [
          { kpi: 'Team Tasks', value: teamTasks, icon: 'tasks' },
          { kpi: 'Completed', value: completedTasks, icon: 'check' },
          { kpi: 'Pending', value: teamTasks - completedTasks, icon: 'pending' }
        ],
        assignedTasks: await Task.find({ createdBy: req.user.id })
          .limit(10)
          .populate('assignedTo', 'name')
          .sort({ dueDate: 1 })
      };
    } else {
      const myTasks = await Task.countDocuments({ assignedTo: req.user.id });
      const completedMyTasks = await Task.countDocuments({ assignedTo: req.user.id, status: 'completed' });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const attendanceToday = await Attendance.findOne({ userId: req.user.id, date: today });
      
      data = {
        widgets: [
          { kpi: 'My Tasks', value: myTasks, icon: 'tasks' },
          { kpi: 'Completed', value: completedMyTasks, icon: 'check' },
          { kpi: 'Pending', value: myTasks - completedMyTasks, icon: 'pending' },
          { kpi: 'Status', value: attendanceToday ? 'Present' : 'Not Marked', icon: 'clock' }
        ],
        myTasks: await Task.find({ assignedTo: req.user.id })
          .limit(5)
          .sort({ dueDate: 1 })
      };
    }
    
    res.json({ role, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get notifications
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
