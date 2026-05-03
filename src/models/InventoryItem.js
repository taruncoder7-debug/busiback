const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  category: String,
  quantity: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 10 },
  price: { type: Number, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  location: String,
  lastRestocked: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
