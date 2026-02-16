# MongoDB Setup Guide for FinEdge

## Installation

### Option 1: Local MongoDB (Development)

#### Windows
```powershell
# Install MongoDB Community Edition
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB

# Verify connection
mongosh

# Create database
use finedge
db.createCollection("users")
```

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
mongosh
```

#### Linux
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod
mongosh
```

### Option 2: MongoDB Atlas (Cloud) - Recommended for Production

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string:
   - Click "Connect"
   - Select "Connect your application"
   - Copy the connection string
5. Update `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finedge
```

## Configuration

Update `.env` file with your MongoDB URI:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/finedge

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finedge
```

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB (if local)
```bash
# Windows
net start MongoDB

# macOS/Linux
mongosh
```

### 3. Start FinEdge Server
```bash
npm start
```

Or with auto-reload:
```bash
npm run dev
```

## Database Schemas

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  preferences: {
    currency: String,
    theme: String,
    notifications: Boolean,
    language: String
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (enum: income, expense),
  category: String,
  amount: Number,
  description: String,
  tags: [String],
  date: Date,
  paymentMethod: String,
  isRecurring: Boolean,
  recurringFrequency: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Budget Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  month: String (YYYY-MM),
  monthlyGoal: Number,
  savingsTarget: Number,
  categories: Map<String, Number>,
  spent: Number,
  alerts: {
    thresholdPercentage: Number,
    enabled: Boolean
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Verify Connection

### Test Connection
```bash
# Run the health check endpoint
curl http://localhost:3000/health
```

### Check Logs
```bash
# Look for:
# [MongoDB] Connected successfully
# [Server] Server is Running
```

### Query Data with Mongoose
```javascript
// In Node REPL or your app
const User = require('./src/models/UserModel');
const users = await User.find();
console.log(users);
```

## Common Commands

### MongoDB Shell Commands
```bash
# Connect
mongosh

# List databases
show dbs

# Use database
use finedge

# List collections
show collections

# Query users
db.users.find()

# Query transactions
db.transactions.find()

# Count documents
db.users.countDocuments()

# Delete all (CAUTION!)
db.users.deleteMany({})
```

## API Endpoints Using MongoDB

### Create User (with password hashing)
```bash
POST /users
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Create Transaction
```bash
POST /transactions
{
  "userId": "userId",
  "type": "income",
  "category": "Salary",
  "amount": 5000,
  "description": "Monthly salary",
  "date": "2024-01-15"
}
```

### Get Summary
```bash
GET /summary?userId=userId&month=2024-01
```

## Performance Tips

1. **Indexing**: Models already have optimized indexes
   - User: email, createdAt
   - Transaction: userId+date, userId+type, userId+category
   - Budget: userId+month

2. **Pagination**: Always use skip/limit for large datasets
   ```bash
   GET /transactions?skip=0&limit=10
   ```

3. **Connection Pooling**: Mongoose handles this automatically

4. **Aggregation Pipeline**: Use for complex queries
   ```javascript
   db.transactions.aggregate([
     { $match: { userId: ObjectId("...") } },
     { $group: { _id: "$category", total: { $sum: "$amount" } } }
   ])
   ```

## Troubleshooting

### Connection Error: "connect ECONNREFUSED"
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify localhost:27017 is accessible

### Authentication Error
- Check username/password in MongoDB Atlas
- Ensure IP is whitelisted (for Atlas)
- Check database name in connection string

### Duplicate Key Error
- Clear data: `db.users.deleteMany({})`
- Or drop collection: `db.users.drop()`

### Performance Issues
- Check indexes: `db.users.getIndexes()`
- Use aggregation for complex queries
- Enable slow query logs

## Next Steps

1. ✅ MongoDB is configured
2. Run tests: `npm test`
3. Start development: `npm run dev`
4. Deploy to production with MongoDB Atlas
