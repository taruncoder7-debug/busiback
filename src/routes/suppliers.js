const express = require('express');
const Supplier = require('../models/Supplier');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public suppliers list (authenticated)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
