const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerId: String,
  customerName: String,
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  tax: { type: Number, default: 0 },
  total: Number,
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: Date,
  paidDate: Date,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pdfPath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
