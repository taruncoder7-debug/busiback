# Company Management System - Backend

A comprehensive Node.js/Express REST API for enterprise company management with role-based access control, real-time features, and advanced reporting.

## Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, Manager, Employee)
- Secure password hashing with bcrypt

✅ **User Management**
- Create/edit/delete users (admin only)
- Role assignment and department management
- User profiles with phone and contact info

✅ **Task Management**  
- Create tasks and assign to employees
- Status tracking (Pending, In-progress, Completed, On-hold)
- Priority levels and due dates
- Employees can update their task status

✅ **Inventory Management**
- Track inventory items with SKU
- Low-stock alerts
- Supplier management
- Automatic quantity tracking

✅ **Billing & Purchases**
- Create purchase orders
- Auto-generate invoices
- PDF export for invoices
- Auto inventory updates on receipt

✅ **Attendance**
- Clock in/out functionality
- Attendance records with timestamps
- Manual entry correction (admin/manager)
- Export attendance reports

✅ **Real-time Features**
- Socket.IO integration for live chat
- Multiple conference rooms
- Message history

✅ **Reporting**
- Export tasks to Excel
- Export invoices to Excel
- Export attendance records to Excel
- Export inventory listings

✅ **Notifications & Audit**
- User action logging
- Notification system
- Activity tracking

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcryptjs
- **Real-time:** Socket.IO
- **PDF:** pdfkit
- **Excel:** exceljs
- **File Upload:** multer

## Installation

```bash
cd backend
npm install
```

## Configuration

Create a `.env` file in the backend directory:

```
MONGO_URI=mongodb://localhost:27017/company_db
JWT_SECRET=your_jwt_secret_key
PORT=4000
```

## Database Setup

### Option 1: Local MongoDB

```bash
# Start MongoDB (Windows)
mongod

# Or if installed as service
net start MongoDB
```

### Option 2: MongoDB Atlas (Cloud)

Update `.env`:
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/company_db?retryWrites=true&w=majority
```

### Seed Sample Data

```bash
node seed.js
```

This creates:
- 5 sample users (admin, manager, 3 employees)
- 4 sample tasks
- 5 sample inventory items

**Sample Credentials:**
- Admin: `admin@example.com` / `adminpass`
- Manager: `manager@example.com` / `managerpass`
- Employee: `employee1@example.com` / `employeepass`

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Server runs on `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tasks
- `GET /api/tasks` - List tasks (role-filtered)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task (manager/admin)
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task (manager/admin)

### Inventory
- `GET /api/inventory` - List all items
- `GET /api/inventory/alerts/low-stock` - Get low-stock alerts
- `GET /api/inventory/:id` - Get item details
- `POST /api/inventory` - Create item (admin only)
- `PUT /api/inventory/:id` - Update item (admin only)
- `PATCH /api/inventory/:id/quantity` - Update quantity
- `DELETE /api/inventory/:id` - Delete item (admin only)

### Purchases
- `GET /api/purchases` - List purchases
- `GET /api/purchases/:id` - Get purchase details
- `POST /api/purchases` - Create purchase order
- `PATCH /api/purchases/:id/status` - Update status (auto-updates inventory)
- `DELETE /api/purchases/:id` - Delete purchase

### Invoices
- `GET /api/invoices` - List invoices
- `GET /api/invoices/:id` - Get invoice details
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id/pdf` - Generate PDF
- `PATCH /api/invoices/:id/status` - Update status
- `DELETE /api/invoices/:id` - Delete invoice

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/clock-in` - Clock in (employee)
- `POST /api/attendance/clock-out` - Clock out (employee)
- `GET /api/attendance/user/:userId` - Get user attendance
- `PUT /api/attendance/:id` - Update record (manager/admin)

### Dashboard
- `GET /api/dashboard` - Get dashboard data (role-specific)
- `GET /api/dashboard/notifications` - Get notifications
- `PATCH /api/dashboard/notifications/:id/read` - Mark as read

### Reports
- `GET /api/reports/tasks/excel` - Export tasks
- `GET /api/reports/invoices/excel` - Export invoices
- `GET /api/reports/attendance/excel` - Export attendance
- `GET /api/reports/inventory/excel` - Export inventory

## Roles & Permissions

| Feature | Admin | Manager | Employee |
|---------|-------|---------|----------|
| Manage Users | ✅ | ❌ | ❌ |
| Create Tasks | ✅ | ✅ | ❌ |
| View All Tasks | ✅ | ✅ | Own only |
| Update Task Status | ✅ | ✅ | Own only |
| Inventory Mgmt | ✅ | View | View |
| Manage Purchases | ✅ | ✅ | ❌ |
| Manage Invoices | ✅ | ✅ | View |
| View Attendance | ✅ | ✅ | Own only |
| Clock In/Out | ✅ | ✅ | ✅ |
| Export Reports | ✅ | ✅ | ❌ |
| Admin Dashboard | ✅ | ❌ | ❌ |

## Real-time Chat (Socket.IO)

### Connection
```javascript
const socket = io('http://localhost:4000');
```

### Events
- `join-room` - Join a chat room
- `send-message` - Send message to room
- `receive-message` - Receive message from room

### Example
```javascript
socket.emit('join-room', 'general');
socket.emit('send-message', { room: 'general', message: 'Hello!', userId: 'user123' });
socket.on('receive-message', (data) => console.log(data));
```

## Database Schema

See `seed.js` for complete schema structure with sample data.

**Collections:**
- Users
- Tasks
- InventoryItems
- Purchases
- Invoices
- Attendance
- Messages
- Notifications
- Departments
- Suppliers
- AuditLogs

## Error Handling

All endpoints return JSON with error messages:
```json
{ "message": "Error description" }
```

Common status codes:
- 200 - Success
- 201 - Created
- 400 - Bad request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not found
- 500 - Server error

## Deployment

### Docker

```bash
docker build -t company-backend .
docker run -p 4000:4000 -e MONGO_URI=mongodb://mongo:27017/company_db company-backend
```

### Docker Compose

```bash
docker-compose up
```

## Development Notes

- Modify models in `src/models/`
- Add routes in `src/routes/`
- Update middleware in `src/middleware/`
- Socket.IO handlers in `src/server.js`

## License

MIT

