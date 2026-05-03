const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all inventory items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await InventoryItem.find().populate('supplier');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get low stock items
router.get('/alerts/low-stock', authMiddleware, async (req, res) => {
  try {
    const items = await InventoryItem.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).populate('supplier');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get item by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id).populate('supplier');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create item (admin only)
router.post('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { sku, name, description, category, quantity, reorderLevel, price, supplier, location } = req.body;
    const item = new InventoryItem({
      sku,
      name,
      description,
      category,
      quantity,
      reorderLevel,
      price,
      supplier,
      location
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item (admin only)
router.put('/:id', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quantity
router.patch('/:id/quantity', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    item.quantity = quantity;
    item.lastRestocked = new Date();
    item.updatedAt = new Date();
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item (admin only)
router.delete('/:id', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
