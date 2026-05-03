const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Task = require('./src/models/Task');
const InventoryItem = require('./src/models/InventoryItem');
const Department = require('./src/models/Department');
const Supplier = require('./src/models/Supplier');
const Purchase = require('./src/models/Purchase');
const Invoice = require('./src/models/Invoice');
const Notification = require('./src/models/Notification');
const Message = require('./src/models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/company_db';

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await InventoryItem.deleteMany({});
    await Department.deleteMany({});

    // Create departments
    const dept1 = await Department.create({ name: 'Engineering' });
    const dept2 = await Department.create({ name: 'Sales' });
    const dept3 = await Department.create({ name: 'Support' });

    // Create users
    const admin = await User.create({
      name: 'Alice Johnson',
      email: 'admin@example.com',
      password: await bcrypt.hash('adminpass', 10),
      role: 'admin',
      department: dept1._id,
      phone: '555-0100'
    });

    const manager = await User.create({
      name: 'Bob Smith',
      email: 'manager@example.com',
      password: await bcrypt.hash('managerpass', 10),
      role: 'manager',
      department: dept1._id,
      phone: '555-0101'
    });

    const emp1 = await User.create({
      name: 'Carol Davis',
      email: 'employee1@example.com',
      password: await bcrypt.hash('employeepass', 10),
      role: 'employee',
      department: dept1._id,
      phone: '555-0102'
    });

    const emp2 = await User.create({
      name: 'David Wilson',
      email: 'employee2@example.com',
      password: await bcrypt.hash('employeepass', 10),
      role: 'employee',
      department: dept2._id,
      phone: '555-0103'
    });

    const emp3 = await User.create({
      name: 'Eve Martinez',
      email: 'employee3@example.com',
      password: await bcrypt.hash('employeepass', 10),
      role: 'employee',
      department: dept3._id,
      phone: '555-0104'
    });

    console.log('✓ Created 5 users');

    // Create tasks
    await Task.create([
      {
        title: 'Setup new server infrastructure',
        description: 'Configure and deploy new cloud infrastructure',
        createdBy: manager._id,
        assignedTo: emp1._id,
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Update API documentation',
        description: 'Document all new endpoints',
        createdBy: manager._id,
        assignedTo: emp2._id,
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Customer support ticket #5421',
        description: 'Resolve database connectivity issue',
        createdBy: manager._id,
        assignedTo: emp3._id,
        status: 'pending',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Code review for feature branch',
        description: 'Review and approve pending pull requests',
        createdBy: admin._id,
        assignedTo: emp1._id,
        status: 'completed',
        priority: 'low'
      }
    ]);

    console.log('✓ Created 4 tasks');

    // Create inventory items
    await InventoryItem.create([
      {
        sku: 'LAP-001',
        name: 'Dell Laptop',
        description: 'Dell XPS 15 inch laptop',
        category: 'Hardware',
        quantity: 5,
        reorderLevel: 2,
        price: 1299.99,
        location: 'Warehouse A'
      },
      {
        sku: 'MON-002',
        name: 'Desktop Monitor',
        description: '27 inch 4K monitor',
        category: 'Hardware',
        quantity: 1,
        reorderLevel: 3,
        price: 499.99,
        location: 'Warehouse A'
      },
      {
        sku: 'KEY-003',
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        category: 'Accessories',
        quantity: 15,
        reorderLevel: 5,
        price: 129.99,
        location: 'Warehouse B'
      },
      {
        sku: 'MOU-004',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        category: 'Accessories',
        quantity: 8,
        reorderLevel: 10,
        price: 49.99,
        location: 'Warehouse B'
      },
      {
        sku: 'CAB-005',
        name: 'USB-C Cable',
        description: 'High speed USB-C cable',
        category: 'Cables',
        quantity: 50,
        reorderLevel: 20,
        price: 19.99,
        location: 'Warehouse C'
      }
    ]);

    console.log('✓ Created 5 inventory items');

    // Create suppliers (idempotent - upsert)
    const sup1 = await Supplier.findOneAndUpdate(
      { name: 'Global Tech Supplies' },
      { $set: { email: 'sales@globaltech.com', phone: '555-0200', address: '12 Tech Park', city: 'London', country: 'UK' } },
      { upsert: true, new: true }
    )
    const sup2 = await Supplier.findOneAndUpdate(
      { name: 'Office Essentials Ltd' },
      { $set: { email: 'info@officeessentials.com', phone: '555-0201', address: '45 Station Rd', city: 'Stockholm', country: 'Sweden' } },
      { upsert: true, new: true }
    )
    const sup3 = await Supplier.findOneAndUpdate(
      { name: 'Cables & More' },
      { $set: { email: 'sales@cablesmore.com', phone: '555-0202', address: '78 Industrial Ave', city: 'Istanbul', country: 'Turkey' } },
      { upsert: true, new: true }
    )

    // Create purchases (idempotent)
    await Purchase.findOneAndUpdate(
      { billNumber: 'BILL-1001' },
      {
        $setOnInsert: {
          vendor: sup1._id,
          items: [ { itemId: (await InventoryItem.findOne({ sku: 'LAP-001' }))._id, quantity: 3, unitPrice: 1299.99, total: 3899.97 } ],
          subtotal: 3899.97,
          total: 3899.97,
          billNumber: 'BILL-1001',
          status: 'received',
          createdBy: admin._id,
          purchaseDate: new Date()
        }
      },
      { upsert: true, new: true }
    )

    await Purchase.findOneAndUpdate(
      { billNumber: 'BILL-1002' },
      {
        $setOnInsert: {
          vendor: sup2._id,
          items: [ { itemId: (await InventoryItem.findOne({ sku: 'KEY-003' }))._id, quantity: 10, unitPrice: 129.99, total: 1299.90 } ],
          subtotal: 1299.90,
          total: 1299.90,
          billNumber: 'BILL-1002',
          status: 'pending',
          createdBy: manager._id,
          purchaseDate: new Date()
        }
      },
      { upsert: true, new: true }
    )

    // Create invoices (idempotent)
    await Invoice.findOneAndUpdate(
      { invoiceNumber: 'INV-2025-001' },
      {
        $setOnInsert: {
          invoiceNumber: 'INV-2025-001',
          customerName: 'Acme Corp',
          items: [ { itemId: (await InventoryItem.findOne({ sku: 'MOU-004' }))._id, description: 'Wireless Mouse', quantity: 5, unitPrice: 49.99, total: 249.95 } ],
          subtotal: 249.95,
          total: 249.95,
          status: 'paid',
          createdBy: admin._id,
          invoiceDate: new Date()
        }
      },
      { upsert: true, new: true }
    )

    await Invoice.findOneAndUpdate(
      { invoiceNumber: 'INV-2025-002' },
      {
        $setOnInsert: {
          invoiceNumber: 'INV-2025-002',
          customerName: 'Beta LLC',
          items: [ { itemId: (await InventoryItem.findOne({ sku: 'CAB-005' }))._id, description: 'USB-C Cable', quantity: 20, unitPrice: 19.99, total: 399.80 } ],
          subtotal: 399.80,
          total: 399.80,
          status: 'sent',
          createdBy: manager._id,
          invoiceDate: new Date()
        }
      },
      { upsert: true, new: true }
    )

    // Notifications (note: Notification schema requires `type`)
    await Notification.create({ userId: admin._id, type: 'system', title: 'Welcome', payload: { text: 'Your admin account is ready' }, read: false })
    await Notification.create({ userId: emp1._id, type: 'task', title: 'Task Assigned', payload: { text: 'You have been assigned a new task' }, read: false })

    // Messages (use room and sender fields required by schema)
    await Message.findOneAndUpdate(
      { room: 'general', sender: manager._id, message: 'Please review the new deployment plan.' },
      { $setOnInsert: { room: 'general', sender: manager._id, message: 'Please review the new deployment plan.' } },
      { upsert: true, new: true }
    )
    await Message.findOneAndUpdate(
      { room: 'general', sender: admin._id, message: 'Looks good, schedule it for Friday.' },
      { $setOnInsert: { room: 'general', sender: admin._id, message: 'Looks good, schedule it for Friday.' } },
      { upsert: true, new: true }
    )

    console.log('✓ Created suppliers, purchases, invoices, notifications, and messages');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@example.com / adminpass');
    console.log('Manager: manager@example.com / managerpass');
    console.log('Employee: employee1@example.com / employeepass');

    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedDB();
