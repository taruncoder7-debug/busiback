const express = require('express');
const Invoice = require('../models/Invoice');
const InventoryItem = require('../models/InventoryItem');
const PDFDocument = require('pdfkit');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all invoices
router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('createdBy', 'name')
      .sort({ invoiceDate: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get invoice by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('createdBy')
      .populate('items.itemId');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create invoice
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { customerId, customerName, items, subtotal, tax, dueDate, notes } = req.body;
    
    const total = subtotal + (tax || 0);
    const invoiceNumber = `INV-${Date.now()}`;
    
    const invoice = new Invoice({
      invoiceNumber,
      customerId,
      customerName,
      items,
      subtotal,
      tax,
      total,
      dueDate,
      notes,
      createdBy: req.user.id
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate PDF
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);
    
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.fontSize(10).text(`Invoice #: ${invoice.invoiceNumber}`, 50, 100);
    doc.text(`Date: ${invoice.invoiceDate.toDateString()}`);
    doc.text(`Due: ${invoice.dueDate ? invoice.dueDate.toDateString() : 'N/A'}`);
    
    doc.text(`Customer: ${invoice.customerName}`, 50, 150);
    
    doc.text('Items:', 50, 200);
    let y = 220;
    (invoice.items || []).forEach((item, i) => {
      doc.text(`${i+1}. Item: Qty: ${item.quantity}, Price: $${item.unitPrice}, Total: $${item.total}`, 50, y);
      y += 20;
    });
    
    doc.text(`Subtotal: $${invoice.subtotal}`, 50, y + 20);
    doc.text(`Tax: $${invoice.tax || 0}`, 50, y + 40);
    doc.fontSize(12).text(`TOTAL: $${invoice.total}`, 50, y + 60);
    
    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update invoice status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'paid') update.paidDate = new Date();
    
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete invoice
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
