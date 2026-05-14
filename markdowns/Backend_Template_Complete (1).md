# STOCKLY Backend Template - User Management System
## Copy-paste ready code for your team

---

## Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── Holding.js
│   └── Transaction.js
├── routes/
│   ├── auth.js
│   ├── holdings.js
│   └── transactions.js
├── middleware/
│   └── authenticate.js
├── .env
├── .gitignore
├── package.json
└── index.js (or server.js)
```

---

## Step 1: package.json

```json
{
  "name": "stockly-backend",
  "version": "1.0.0",
  "description": "User management for STOCKLY",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

**Install:**
```bash
npm install
```

---

## Step 2: .env file

```
MONGO_URL=mongodb://localhost:27017/stockly
# OR for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/stockly

PORT=3002
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## Step 3: .gitignore

```
node_modules/
.env
.env.local
.env.*.local
*.log
.DS_Store
```

---

## Step 4: models/User.js

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    fullName: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

---

## Step 5: models/Holding.js

```javascript
const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stockSymbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    averagePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    currentPrice: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    gainLoss: {
      type: Number,
      default: 0,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
holdingSchema.index({ userId: 1, stockSymbol: 1 });

module.exports = mongoose.model('Holding', holdingSchema);
```

---

## Step 6: models/Transaction.js

```javascript
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stockSymbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    transactionType: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'executed', 'failed'],
      default: 'executed',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for faster queries
transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ stockSymbol: 1, userId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
```

---

## Step 7: middleware/authenticate.js

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired',
    });
  }
};
```

---

## Step 8: routes/auth.js

```javascript
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      fullName: fullName || '',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', require('../middleware/authenticate').authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
```

---

## Step 9: routes/holdings.js

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const Holding = require('../models/Holding');

// @route   POST /api/holdings
// @desc    Add a new holding
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { stockSymbol, companyName, quantity, averagePrice } = req.body;

    // Validation
    if (!stockSymbol || !quantity || !averagePrice) {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol, quantity, and average price are required',
      });
    }

    // Check if holding already exists for this user
    let holding = await Holding.findOne({
      userId: req.user.id,
      stockSymbol,
    });

    if (holding) {
      // Update existing holding
      holding.quantity += quantity;
      holding.totalValue = holding.quantity * holding.averagePrice;
      await holding.save();
    } else {
      // Create new holding
      holding = await Holding.create({
        userId: req.user.id,
        stockSymbol,
        companyName: companyName || stockSymbol,
        quantity,
        averagePrice,
        totalValue: quantity * averagePrice,
        purchaseDate: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Holding added successfully',
      holding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/holdings
// @desc    Get all holdings for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const holdings = await Holding.find({ userId: req.user.id }).sort({
      stockSymbol: 1,
    });

    res.status(200).json({
      success: true,
      count: holdings.length,
      holdings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/holdings/:id
// @desc    Get single holding
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const holding = await Holding.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found',
      });
    }

    res.status(200).json({
      success: true,
      holding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/holdings/:id
// @desc    Update holding
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    let holding = await Holding.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found',
      });
    }

    const { quantity, averagePrice, currentPrice } = req.body;

    if (quantity) holding.quantity = quantity;
    if (averagePrice) holding.averagePrice = averagePrice;
    if (currentPrice) holding.currentPrice = currentPrice;

    // Recalculate total value
    holding.totalValue = holding.quantity * holding.averagePrice;
    if (holding.currentPrice) {
      holding.gainLoss = holding.quantity * (holding.currentPrice - holding.averagePrice);
    }

    await holding.save();

    res.status(200).json({
      success: true,
      message: 'Holding updated successfully',
      holding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/holdings/:id
// @desc    Delete holding
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const holding = await Holding.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: 'Holding not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Holding deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
```

---

## Step 10: routes/transactions.js

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');

// @route   POST /api/transactions
// @desc    Create a transaction
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      stockSymbol,
      companyName,
      transactionType,
      quantity,
      pricePerUnit,
      commission,
    } = req.body;

    // Validation
    if (
      !stockSymbol ||
      !transactionType ||
      !quantity ||
      !pricePerUnit
    ) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Calculate amounts
    const totalAmount = quantity * pricePerUnit;
    const netAmount = totalAmount + (commission || 0);

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      stockSymbol,
      companyName: companyName || stockSymbol,
      transactionType,
      quantity,
      pricePerUnit,
      totalAmount,
      commission: commission || 0,
      netAmount,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions for user
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { stockSymbol, type, status } = req.query;

    // Build filter
    let filter = { userId: req.user.id };
    if (stockSymbol) filter.stockSymbol = stockSymbol.toUpperCase();
    if (type) filter.transactionType = type;
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter).sort({
      transactionDate: -1,
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction (only if pending)
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending transactions can be updated',
      });
    }

    const { quantity, pricePerUnit, commission } = req.body;

    if (quantity) transaction.quantity = quantity;
    if (pricePerUnit) transaction.pricePerUnit = pricePerUnit;
    if (commission !== undefined) transaction.commission = commission;

    // Recalculate amounts
    transaction.totalAmount = transaction.quantity * transaction.pricePerUnit;
    transaction.netAmount =
      transaction.totalAmount + (transaction.commission || 0);

    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
```

---

## Step 11: index.js (Main Server File)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.log('❌ MongoDB connection error:', err);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/holdings', require('./routes/holdings'));
app.use('/api/transactions', require('./routes/transactions'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## API Endpoints Summary

### Authentication
```
POST   /api/auth/register      - Register user
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user
```

### Holdings
```
POST   /api/holdings           - Add holding
GET    /api/holdings           - Get all holdings
GET    /api/holdings/:id       - Get single holding
PUT    /api/holdings/:id       - Update holding
DELETE /api/holdings/:id       - Delete holding
```

### Transactions
```
POST   /api/transactions       - Create transaction
GET    /api/transactions       - Get all transactions
GET    /api/transactions/:id   - Get single transaction
PUT    /api/transactions/:id   - Update transaction
DELETE /api/transactions/:id   - Delete transaction
```

---

## How to Use (For Your Team)

1. **Copy all files** into the backend folder
2. **Create .env** file with MongoDB URL
3. **Run:**
   ```bash
   npm install
   npm start
   ```
4. **Test with Postman:**
   - POST to http://localhost:3002/api/auth/register
   - Body: `{ "email": "test@example.com", "password": "test123", "fullName": "Test User" }`
   - Copy the token
   - Use token in Authorization header: `Bearer {token}`

---

## Testing with Postman/Curl

### Register
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Add Holding (use token from login)
```bash
curl -X POST http://localhost:3002/api/holdings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "stockSymbol": "AAPL",
    "companyName": "Apple Inc",
    "quantity": 100,
    "averagePrice": 150.50
  }'
```

### Get Holdings
```bash
curl -X GET http://localhost:3002/api/holdings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes for Team

- All files are ready to copy-paste
- No need to modify unless you want to customize
- Error handling is basic but functional
- Authentication uses JWT tokens
- Passwords are hashed automatically
- Database indexes are included for performance
- All endpoints require authentication except /api/auth/register and /api/auth/login
- Use the token returned from login/register in all requests
