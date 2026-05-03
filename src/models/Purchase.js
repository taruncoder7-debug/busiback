const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  tax: { type: Number, default: 0 },
  total: Number,
  billNumber: String,
  purchaseDate: { type: Date, default: Date.now },
  deliveryDate: Date,
  status: { type: String, enum: ['pending', 'received', 'invoiced'], default: 'pending' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
