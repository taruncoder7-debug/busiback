const mongoose = require('mongoose');
// Ensure Department model is registered so populate('department') works reliably
require('./Department');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'employee'], required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  phone: String,
  avatar: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
