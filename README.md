# FinEdge - Personal Finance Manager

A modern, full-stack personal finance management application built with **Node.js**, **Express**, and **MongoDB**. Track income, expenses, budgets, and financial goals with ease.

## 🎯 Features

### Core Functionality
- ✅ **User Management** - Registration, authentication, password hashing with bcryptjs
- ✅ **Transaction Tracking** - Record income/expense with categories, tags, and payment methods
- ✅ **Budget Planning** - Set monthly budgets and savings targets with spending alerts
- ✅ **Financial Analytics** - View income/expense summaries, category analysis, spending trends
- ✅ **Advanced Queries** - Filter by type, category, date range, and tags with pagination

### Technical Excellence
- ✅ **Async/Await** - All operations use modern async patterns
- ✅ **MongoDB Integration** - Production-ready with Mongoose ODM and automatic indexing
- ✅ **Error Handling** - Global middleware, custom error classes, comprehensive logging
- ✅ **Input Validation** - Multi-layer validation (middleware + schema level)
- ✅ **Security** - Password hashing, JWT tokens, data validation
- ✅ **Testing** - Full test suite with 19+ passing tests
- ✅ **Documentation** - Comprehensive guides and API reference

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd FinEdge

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI
```

### Run

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Testing
npm test
```

Server starts at `http://localhost:3000`

## 📊 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JWT, bcryptjs |
| **Validation** | Custom middleware, Mongoose schemas |
| **Testing** | Jest |
| **Logging** | Custom logger |
| **Error Handling** | Custom error classes |

## 📁 Project Structure

```
src/
├── config/           # Configuration & database setup
├── controllers/      # Request handlers
├── middleware/       # Authentication, validation, error handling, logging
├── models/          # Mongoose schemas & legacy models
├── routes/          # API route definitions
├── services/        # Business logic (file-based & MongoDB)
├── utils/           # Database wrappers, error classes, helpers
├── app.js           # Express app setup
└── server.js        # Server entry point with DB initialization

tests/               # Test suites
public/             # Static assets
data/               # Local file storage (optional)
logs/               # Application logs
```

## 🔌 API Endpoints

### Users
```
POST   /users                      Register new user
GET    /users/:id                  Get user profile
PATCH  /users/:id/preferences      Update preferences
DELETE /users/:id                  Delete account
```

### Transactions
```
POST   /transactions               Create transaction
GET    /transactions               List transactions (filterable)
GET    /transactions/:id           Get transaction details
PATCH  /transactions/:id           Update transaction
DELETE /transactions/:id           Delete transaction
```

### Analytics
```
GET    /summary                    Get income/expense summary
GET    /summary/category/:cat      Category breakdown
GET    /summary/monthly-comparison Compare months
```

### Health
```
GET    /health                     Server health check
```

## 📝 API Examples

### Register User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Create Transaction
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "type": "income",
    "category": "Salary",
    "amount": 5000,
    "description": "Monthly salary",
    "date": "2024-01-15"
  }'
```

### Get Summary
```bash
curl "http://localhost:3000/summary?userId=user_id_here&month=2024-01"
```

Response:
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000,
    "totalExpense": 1500,
    "netSavings": 3500,
    "savingsPercentage": 70,
    "period": "2024-01"
  }
}
```

## 🗄️ Database Schema

### Users Collection
```
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  preferences: {currency, theme, notifications, language},
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions Collection
```
{
  _id: ObjectId,
  userId: ObjectId (ref),
  type: "income" | "expense",
  category: String,
  amount: Number,
  description: String,
  tags: [String],
  paymentMethod: String,
  date: Date,
  isRecurring: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Budgets Collection
```
{
  _id: ObjectId,
  userId: ObjectId (ref),
  month: String (YYYY-MM),
  monthlyGoal: Number,
  savingsTarget: Number,
  categories: Map<String, Number>,
  alerts: {thresholdPercentage, enabled},
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **Password Hashing** - bcryptjs with 10-round salt
- **Email Validation** - RFC-compliant validation + uniqueness
- **Input Validation** - Multi-layer validation before DB operations
- **Error Handling** - No stack traces exposed to clients
- **ACID Transactions** - Ensures data consistency
- **CORS Ready** - Can be enabled for multi-domain access

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Current Test Coverage:**
- ✅ 19 tests passing
- ✅ User Service (7 tests)
- ✅ Transaction Service (6 tests)
- ✅ JWT Service (6 tests)

## 🔄 Architecture

### MVC Pattern
- **Models** - Mongoose schemas with validation
- **Views** - JSON API responses
- **Controllers** - Request handling & response formatting

### Service Layer
- `UserService` / `UserServiceMongo` - User operations
- `TransactionService` / `TransactionServiceMongo` - Transaction operations
- `JWTService` - Token management

### Data Access Layer
- `MongoDBService` - CRUD wrapper with aggregation
- `FileStorageService` - JSON file persistence (optional)

## 📚 Environment Variables

```env
# Application
APP_NAME=FinEdge
NODE_ENV=development
PORT=3000

# Database
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/finedge

# Security
JWT_SECRET=your-secret-key
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=info
LOG_TO_FILE=false
```

See `.env` file for full configuration options.

## 🚀 Deployment

### MongoDB Atlas (Recommended)
1. Create MongoDB Atlas account
2. Create cluster and get connection string
3. Update `MONGODB_URI` in environment
4. Deploy server (Heroku, Railway, DigitalOcean, etc.)

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up monitoring/logging
- [ ] Enable database backups
- [ ] Configure rate limiting

## 📖 Documentation

- **QUICKSTART_MONGODB.md** - 5-minute MongoDB setup
- **MONGODB_SETUP.md** - Detailed installation guide
- **MONGODB_INTEGRATION.md** - Features and architecture
- **PROJECT_STRUCTURE.md** - Directory structure reference

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED localhost:27017` | Start MongoDB: `mongosh` or `brew services start mongodb-community` |
| `MONGODB_URI not set` | Add to `.env`: `MONGODB_URI=mongodb://localhost:27017/finedge` |
| `Password validation failed` | Passwords must be 6+ characters |
| `Duplicate key error` | Email already exists - use unique email |
| `Port 3000 in use` | Change PORT in `.env` or kill process using port |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📋 Future Enhancements

- [ ] Role-based access control (RBAC)
- [ ] Recurring transactions automation
- [ ] Multi-currency support
- [ ] Export to CSV/PDF
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Advanced charts and analytics
- [ ] Multi-user budgets
- [ ] Investment tracking
- [ ] Bill reminders

## 📄 License

This project is licensed under the ISC License - see package.json for details.

## 👨‍💻 Author

**Amlan Dutta**

## 📞 Support

For issues, questions, or suggestions:
1. Check documentation in project root
2. Review test files for usage examples
3. Open an issue on GitHub
4. Contact development team

## 🎓 Learning Resources

- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose ODM](https://mongoosejs.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Version**: 1.0.0  
**Last Updated**: February 16, 2026  
**Status**: Production Ready ✅

Happy coding! 🚀
\ n P R :   t e s t   b r a n c h   f o r   c r e a t i n g   a   p u l l   r e q u e s t  
 