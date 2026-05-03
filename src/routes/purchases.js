const express = require('express');
const Purchase = require('../models/Purchase');
const InventoryItem = require('../models/InventoryItem');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all purchases
router.get('/', authMiddleware, async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('vendor')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get purchase by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('vendor')
      .populate('createdBy')
      .populate('items.itemId');
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create purchase
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { vendor, items, subtotal, tax, billNumber, deliveryDate, notes } = req.body;
    
    const total = subtotal + (tax || 0);
    const purchase = new Purchase({
      vendor,
      items,
      subtotal,
      tax,
      total,
      billNumber: billNumber || `PO-${Date.now()}`,
      deliveryDate,
      notes,
      createdBy: req.user.id
    });
    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update purchase status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
    
    purchase.status = status;
    
    // Update inventory when received
    if (status === 'received') {
      for (const item of purchase.items) {
        await InventoryItem.findByIdAndUpdate(
          item.itemId,
          { $inc: { quantity: item.quantity } }
        );
      }
    }
    
    await purchase.save();
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete purchase
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
