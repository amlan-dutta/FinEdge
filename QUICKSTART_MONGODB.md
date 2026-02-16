# Quick Start Guide - MongoDB Integration

## 🚀 5-Minute Setup

### Step 1: Install MongoDB

**Windows:**
- Download: https://www.mongodb.com/try/download/community
- Run installer
- Choose "Install MongoDB as a Service"
- Done!

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

### Step 2: Update Dependencies
```bash
npm install
```

### Step 3: Configure Connection

Edit `.env`:
```env
# Already set to local MongoDB
MONGODB_URI=mongodb://localhost:27017/finedge
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finedge
```

### Step 4: Start Server
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║        FinEdge - Finance Manager       ║
║          Server is Running             ║
╚════════════════════════════════════════╝

✓ Application: FinEdge
✓ Version: 1.0.0
✓ Environment: development
✓ Server: http://localhost:3000
✓ Database: mongodb
✓ Timestamp: 2024-01-15T10:30:00.000Z
```

### Step 5: Test It Out

```bash
# Check health
curl http://localhost:3000/health

# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Create a transaction
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "type": "income",
    "category": "Salary",
    "amount": 5000,
    "description": "Monthly salary"
  }'
```

## 📊 Database Content

View your data with MongoDB shell:

```bash
# Open MongoDB shell
mongosh

# Use finedge database
use finedge

# View users
db.users.find()

# View transactions
db.transactions.find()

# Count records
db.users.countDocuments()
db.transactions.countDocuments()
```

## 🔄 Switching Between File Storage and MongoDB

### Current Setup: MongoDB
- Production-ready
- Persistent data
- Advanced queries
- Password hashing

### To Use File Storage (Development):

Update `src/services/UserService.js` imports:
```javascript
// Change from:
const User = require('../models/UserModel');
const MongoDBService = require('../utils/mongoDBService');

// To:
const FileStorageService = require('../utils/fileStorage');
const config = require('../config/config');
```

## ✅ Verification Checklist

- [ ] MongoDB is installed and running
- [ ] `.env` has `MONGODB_URI` configured
- [ ] `npm install` completed
- [ ] `npm start` shows "Database: mongodb"
- [ ] Health check returns 200
- [ ] Can create users (password auto-hashed)
- [ ] Can create transactions
- [ ] `npm test` passes (uses file storage)

## 📖 Key Features

### Automatic Password Hashing
```javascript
// Password is automatically hashed when user is created
// Never stored in plain text
user.password // bcrypt hash, not visible in JSON responses
```

### Advanced Transactions
```bash
# Filter by type, category, date range, tags
GET /transactions?userId=X&type=expense&category=Food&startDate=2024-01-01

# Get spending trends
GET /transactions?userId=X&month=2024-01

# Recurring transactions support
POST /transactions
{
  "isRecurring": true,
  "recurringFrequency": "monthly"
}
```

### Query Optimization
- Automatic indexes on common queries
- Compound indexes for multi-field searches
- Aggregation pipeline for analytics

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| `connect ECONNREFUSED` | Start MongoDB: `net start MongoDB` (Windows) |
| `MONGODB_URI not found` | Add to `.env`: `MONGODB_URI=mongodb://localhost:27017/finedge` |
| `Authentication failed` | Check MongoDB Atlas credentials in connection string |
| `Port 27017 in use` | MongoDB already running or port conflict |
| `Insert failed` | Ensure MongoDB is running: `mongosh` should connect |

## 🚀 Next Steps

1. Create your first user
2. Add transactions
3. Query spending data
4. Deploy to production
5. Use MongoDB Atlas for hosting

## 📚 Learn More

- Full setup guide: `MONGODB_SETUP.md`
- Integration details: `MONGODB_INTEGRATION.md`
- Mongoose docs: https://mongoosejs.com
- MongoDB docs: https://docs.mongodb.com

## Support

```bash
# Check MongoDB status
mongosh

# View connection details
echo $MONGODB_URI

# Run tests
npm test

# Development server
npm run dev
```

Happy coding! 🎉
