const express = require('express');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Task = require('../models/Task');
const Invoice = require('../models/Invoice');
const Attendance = require('../models/Attendance');
const InventoryItem = require('../models/InventoryItem');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Export tasks to Excel
router.get('/tasks/excel', authMiddleware, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks');
    
    worksheet.columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 15 },
      { header: 'Assigned To', key: 'assignedTo', width: 20 },
      { header: 'Due Date', key: 'dueDate', width: 15 },
      { header: 'Created', key: 'createdAt', width: 15 }
    ];
    
    const tasks = await Task.find().populate('assignedTo', 'name');
    tasks.forEach(task => {
      worksheet.addRow({
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo?.name || 'Unassigned',
        dueDate: task.dueDate,
        createdAt: task.createdAt
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks.xlsx"');
    await workbook.xlsx.write(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export invoices to Excel
router.get('/invoices/excel', authMiddleware, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');
    
    worksheet.columns = [
      { header: 'Invoice #', key: 'invoiceNumber', width: 15 },
      { header: 'Customer', key: 'customerName', width: 20 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date', key: 'invoiceDate', width: 15 }
    ];
    
    const invoices = await Invoice.find();
    invoices.forEach(inv => {
      worksheet.addRow({
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        total: inv.total,
        status: inv.status,
        invoiceDate: inv.invoiceDate
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="invoices.xlsx"');
    await workbook.xlsx.write(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export attendance to Excel
router.get('/attendance/excel', authMiddleware, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');
    
    worksheet.columns = [
      { header: 'Employee', key: 'employee', width: 20 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Clock In', key: 'clockIn', width: 15 },
      { header: 'Clock Out', key: 'clockOut', width: 15 },
      { header: 'Status', key: 'status', width: 12 }
    ];
    
    const records = await Attendance.find().populate('userId', 'name');
    records.forEach(rec => {
      worksheet.addRow({
        employee: rec.userId.name,
        date: rec.date,
        clockIn: rec.clockIn,
        clockOut: rec.clockOut,
        status: rec.status
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance.xlsx"');
    await workbook.xlsx.write(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export inventory to Excel
router.get('/inventory/excel', authMiddleware, requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventory');
    
    worksheet.columns = [
      { header: 'SKU', key: 'sku', width: 12 },
      { header: 'Item', key: 'name', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Price', key: 'price', width: 10 },
      { header: 'Reorder Level', key: 'reorderLevel', width: 12 }
    ];
    
    const items = await InventoryItem.find();
    items.forEach(item => {
      worksheet.addRow({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        reorderLevel: item.reorderLevel
      });
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory.xlsx"');
    await workbook.xlsx.write(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
