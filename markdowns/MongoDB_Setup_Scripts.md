# MongoDB Setup Scripts
## Copy-paste ready initialization commands

---

## Script 1: Create Database & Collections

Save as: `scripts/mongodb-init.js`

```javascript
// MongoDB Initialization Script
// Run with: mongosh < scripts/mongodb-init.js

// Connect to database
use stockly

console.log("Creating STOCKLY database...");

// ====== DROP EXISTING COLLECTIONS (Optional - for fresh start) ======
// db.users.drop()
// db.holdings.drop()
// db.transactions.drop()
// db.documents.drop()
// db.auditlogs.drop()

// ====== 1. CREATE USERS COLLECTION ======
console.log("Creating users collection...");
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password"],
      properties: {
        _id: { bsonType: "objectId" },
        email: { 
          bsonType: "string",
          description: "User email - must be unique"
        },
        password: { 
          bsonType: "string",
          description: "Hashed password"
        },
        fullName: { 
          bsonType: "string",
          description: "Full name of user"
        },
        phoneNumber: { 
          bsonType: "string",
          description: "Phone number"
        },
        isVerified: { 
          bsonType: "bool",
          description: "Email verification status"
        },
        isActive: { 
          bsonType: "bool",
          description: "Account active status"
        },
        accountStatus: { 
          bsonType: "string",
          enum: ["active", "suspended", "closed"]
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        lastLogin: { bsonType: "date" }
      }
    }
  }
})

// Create indexes on Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ verificationToken: 1 }, { sparse: true })
db.users.createIndex({ resetPasswordToken: 1 }, { sparse: true })
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ kycStatus: 1 })
db.users.createIndex({ lockUntil: 1 }, { sparse: true })

console.log("✅ Users collection created with indexes");

// ====== 2. CREATE HOLDINGS COLLECTION ======
console.log("Creating holdings collection...");
db.createCollection("holdings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "stockSymbol", "quantity", "averagePrice"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { 
          bsonType: "objectId",
          description: "Reference to user"
        },
        stockSymbol: { 
          bsonType: "string",
          description: "Stock symbol (uppercase)"
        },
        companyName: { bsonType: "string" },
        sector: { bsonType: "string" },
        quantity: { 
          bsonType: "number",
          description: "Number of shares"
        },
        averagePrice: { 
          bsonType: "number",
          description: "Average cost per share"
        },
        currentPrice: { bsonType: "number" },
        totalCostValue: { bsonType: "number" },
        currentMarketValue: { bsonType: "number" },
        gainLoss: { bsonType: "number" },
        gainLossPercent: { bsonType: "number" },
        purchaseDate: { bsonType: "date" },
        lastUpdated: { bsonType: "date" }
      }
    }
  }
})

// Create indexes on Holdings
db.holdings.createIndex({ userId: 1, stockSymbol: 1 }, { unique: true })
db.holdings.createIndex({ userId: 1 })
db.holdings.createIndex({ stockSymbol: 1 })
db.holdings.createIndex({ userId: 1, gainLossPercent: -1 })
db.holdings.createIndex({ userId: 1, createdAt: -1 })
db.holdings.createIndex({ sector: 1, userId: 1 })

console.log("✅ Holdings collection created with indexes");

// ====== 3. CREATE TRANSACTIONS COLLECTION ======
console.log("Creating transactions collection...");
db.createCollection("transactions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "stockSymbol", "transactionType", "quantity", "pricePerUnit"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { 
          bsonType: "objectId",
          description: "Reference to user"
        },
        transactionId: { 
          bsonType: "string",
          description: "Unique transaction ID"
        },
        transactionType: { 
          bsonType: "string",
          enum: ["buy", "sell"],
          description: "Transaction type"
        },
        stockSymbol: { 
          bsonType: "string",
          description: "Stock symbol"
        },
        companyName: { bsonType: "string" },
        quantity: { 
          bsonType: "number",
          description: "Number of shares"
        },
        pricePerUnit: { 
          bsonType: "number",
          description: "Price per share"
        },
        totalAmount: { bsonType: "number" },
        commission: { bsonType: "number" },
        netAmount: { bsonType: "number" },
        status: { 
          bsonType: "string",
          enum: ["pending", "executed", "failed", "cancelled"]
        },
        transactionDate: { bsonType: "date" },
        settlementDate: { bsonType: "date" }
      }
    }
  }
})

// Create indexes on Transactions
db.transactions.createIndex({ userId: 1, transactionDate: -1 })
db.transactions.createIndex({ userId: 1, transactionType: 1 })
db.transactions.createIndex({ stockSymbol: 1, userId: 1 })
db.transactions.createIndex({ transactionId: 1 }, { unique: true })
db.transactions.createIndex({ status: 1, userId: 1 })

console.log("✅ Transactions collection created with indexes");

// ====== 4. CREATE DOCUMENTS COLLECTION ======
console.log("Creating documents collection...");
db.createCollection("documents", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "documentType"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { 
          bsonType: "objectId",
          description: "Reference to user"
        },
        documentType: { 
          bsonType: "string",
          enum: ["PAN", "Aadhaar", "DL", "Passport", "Utility_Bill"],
          description: "Type of document"
        },
        documentNumber: { 
          bsonType: "string",
          description: "Document number"
        },
        verificationStatus: { 
          bsonType: "string",
          enum: ["pending", "verified", "rejected"]
        },
        uploadedAt: { bsonType: "date" },
        verifiedAt: { bsonType: "date" }
      }
    }
  }
})

// Create indexes on Documents
db.documents.createIndex({ userId: 1 })
db.documents.createIndex({ userId: 1, documentType: 1 })
db.documents.createIndex({ documentNumber: 1 }, { unique: true, sparse: true })
db.documents.createIndex({ verificationStatus: 1 })

console.log("✅ Documents collection created with indexes");

// ====== 5. CREATE AUDITLOGS COLLECTION ======
console.log("Creating auditlogs collection...");
db.createCollection("auditlogs")

db.auditlogs.createIndex({ userId: 1, timestamp: -1 })
db.auditlogs.createIndex({ action: 1, timestamp: -1 })
db.auditlogs.createIndex({ entityId: 1 })

console.log("✅ AuditLogs collection created with indexes");

// ====== FINAL STATUS ======
console.log("\n" + "=".repeat(50));
console.log("✅ DATABASE SETUP COMPLETE");
console.log("=".repeat(50));

// Show collections
console.log("\nCollections created:");
db.getCollectionNames().forEach(name => console.log("  ✓ " + name));

console.log("\nDatabase ready for use!");
```

**Run it:**
```bash
mongosh mongodb://localhost:27017/stockly < scripts/mongodb-init.js
```

---

## Script 2: Insert Sample Data

Save as: `scripts/seed-data.js`

```javascript
// Seed Sample Data
use stockly

console.log("Inserting sample data...");

// ====== INSERT SAMPLE USERS ======
const userData = [
  {
    email: "john@example.com",
    password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456789", // hashed "password123"
    fullName: "John Doe",
    phoneNumber: "+91-9876543210",
    isVerified: true,
    isActive: true,
    accountStatus: "active",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    lastLogin: new Date("2024-01-20"),
    currency: "INR",
    timezone: "IST",
    kycStatus: "approved",
    role: "user"
  },
  {
    email: "jane@example.com",
    password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456789",
    fullName: "Jane Smith",
    phoneNumber: "+91-9876543211",
    isVerified: true,
    isActive: true,
    accountStatus: "active",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    lastLogin: new Date("2024-01-18"),
    currency: "INR",
    timezone: "IST",
    kycStatus: "approved",
    role: "user"
  }
];

const insertedUsers = db.users.insertMany(userData);
const userId1 = insertedUsers.insertedIds[0];
const userId2 = insertedUsers.insertedIds[1];

console.log(`✅ Inserted ${insertedUsers.insertedIds.length} users`);

// ====== INSERT SAMPLE HOLDINGS ======
const holdingsData = [
  {
    userId: userId1,
    stockSymbol: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    quantity: 100,
    averagePrice: 150.50,
    currentPrice: 175.25,
    totalCostValue: 15050,
    currentMarketValue: 17525,
    gainLoss: 2475,
    gainLossPercent: 16.43,
    purchaseDate: new Date("2024-01-10"),
    lastUpdated: new Date("2024-01-20"),
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-20"),
    currency: "USD"
  },
  {
    userId: userId1,
    stockSymbol: "GOOGL",
    companyName: "Alphabet Inc.",
    sector: "Technology",
    quantity: 50,
    averagePrice: 140.00,
    currentPrice: 155.75,
    totalCostValue: 7000,
    currentMarketValue: 7787.50,
    gainLoss: 787.50,
    gainLossPercent: 11.25,
    purchaseDate: new Date("2024-01-12"),
    lastUpdated: new Date("2024-01-20"),
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-20"),
    currency: "USD"
  },
  {
    userId: userId2,
    stockSymbol: "MSFT",
    companyName: "Microsoft Corporation",
    sector: "Technology",
    quantity: 75,
    averagePrice: 380.00,
    currentPrice: 395.50,
    totalCostValue: 28500,
    currentMarketValue: 29662.50,
    gainLoss: 1162.50,
    gainLossPercent: 4.08,
    purchaseDate: new Date("2024-01-08"),
    lastUpdated: new Date("2024-01-20"),
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-20"),
    currency: "USD"
  }
];

const insertedHoldings = db.holdings.insertMany(holdingsData);
console.log(`✅ Inserted ${insertedHoldings.insertedIds.length} holdings`);

// ====== INSERT SAMPLE TRANSACTIONS ======
const transactionsData = [
  {
    userId: userId1,
    transactionId: "TXN_20240115_001",
    transactionType: "buy",
    stockSymbol: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    quantity: 100,
    pricePerUnit: 150.50,
    totalAmount: 15050,
    commission: 0,
    netAmount: 15050,
    status: "executed",
    transactionDate: new Date("2024-01-15"),
    settlementDate: new Date("2024-01-16"),
    createdAt: new Date("2024-01-15"),
    currency: "USD"
  },
  {
    userId: userId1,
    transactionId: "TXN_20240117_002",
    transactionType: "buy",
    stockSymbol: "GOOGL",
    companyName: "Alphabet Inc.",
    sector: "Technology",
    quantity: 50,
    pricePerUnit: 140.00,
    totalAmount: 7000,
    commission: 0,
    netAmount: 7000,
    status: "executed",
    transactionDate: new Date("2024-01-17"),
    settlementDate: new Date("2024-01-18"),
    createdAt: new Date("2024-01-17"),
    currency: "USD"
  },
  {
    userId: userId2,
    transactionId: "TXN_20240114_003",
    transactionType: "buy",
    stockSymbol: "MSFT",
    companyName: "Microsoft Corporation",
    sector: "Technology",
    quantity: 75,
    pricePerUnit: 380.00,
    totalAmount: 28500,
    commission: 0,
    netAmount: 28500,
    status: "executed",
    transactionDate: new Date("2024-01-14"),
    settlementDate: new Date("2024-01-15"),
    createdAt: new Date("2024-01-14"),
    currency: "USD"
  }
];

const insertedTransactions = db.transactions.insertMany(transactionsData);
console.log(`✅ Inserted ${insertedTransactions.insertedIds.length} transactions`);

// ====== INSERT SAMPLE DOCUMENTS ======
const documentsData = [
  {
    userId: userId1,
    documentType: "PAN",
    documentNumber: "AABPD1234K",
    verificationStatus: "verified",
    uploadedAt: new Date("2024-01-16"),
    verifiedAt: new Date("2024-01-17")
  },
  {
    userId: userId2,
    documentType: "Aadhaar",
    documentNumber: "1234-5678-9012",
    verificationStatus: "verified",
    uploadedAt: new Date("2024-01-14"),
    verifiedAt: new Date("2024-01-15")
  }
];

const insertedDocuments = db.documents.insertMany(documentsData);
console.log(`✅ Inserted ${insertedDocuments.insertedIds.length} documents`);

// ====== FINAL STATUS ======
console.log("\n" + "=".repeat(50));
console.log("✅ SAMPLE DATA INSERTED SUCCESSFULLY");
console.log("=".repeat(50));
console.log(`\nUsers: ${db.users.countDocuments()}`);
console.log(`Holdings: ${db.holdings.countDocuments()}`);
console.log(`Transactions: ${db.transactions.countDocuments()}`);
console.log(`Documents: ${db.documents.countDocuments()}`);
```

**Run it:**
```bash
mongosh mongodb://localhost:27017/stockly < scripts/seed-data.js
```

---

## Script 3: Reset Database

Save as: `scripts/reset-db.js`

```javascript
// ⚠️ WARNING: This will delete all data!
use stockly

console.log("⚠️  RESETTING DATABASE - ALL DATA WILL BE DELETED");

// Drop all collections
db.users.drop()
db.holdings.drop()
db.transactions.drop()
db.documents.drop()
db.auditlogs.drop()

console.log("✅ All collections dropped");

// Re-run mongodb-init.js to recreate empty collections
console.log("Run 'mongosh < scripts/mongodb-init.js' to recreate collections");
```

**Run it:**
```bash
mongosh mongodb://localhost:27017/stockly < scripts/reset-db.js
```

---

## Script 4: Database Statistics

Save as: `scripts/db-stats.js`

```javascript
use stockly

console.log("\n" + "=".repeat(60));
console.log("DATABASE STATISTICS - STOCKLY");
console.log("=".repeat(60));

// Database size
const stats = db.stats();
console.log(`\nDatabase Name: ${stats.db}`);
console.log(`Database Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);

// Collections
console.log(`\nCollections: ${stats.collections}`);

// Users Collection
const usersCount = db.users.countDocuments();
console.log(`\n📊 USERS Collection`);
console.log(`  Total documents: ${usersCount}`);
console.log(`  Size: ${(db.users.stats().size / 1024).toFixed(2)} KB`);
console.log(`  Indexes: ${db.users.getIndexes().length}`);

// Holdings Collection
const holdingsCount = db.holdings.countDocuments();
console.log(`\n📊 HOLDINGS Collection`);
console.log(`  Total documents: ${holdingsCount}`);
console.log(`  Size: ${(db.holdings.stats().size / 1024).toFixed(2)} KB`);
console.log(`  Indexes: ${db.holdings.getIndexes().length}`);

// Transactions Collection
const transactionsCount = db.transactions.countDocuments();
console.log(`\n📊 TRANSACTIONS Collection`);
console.log(`  Total documents: ${transactionsCount}`);
console.log(`  Size: ${(db.transactions.stats().size / 1024).toFixed(2)} KB`);
console.log(`  Indexes: ${db.transactions.getIndexes().length}`);

// Documents Collection
const documentsCount = db.documents.countDocuments();
console.log(`\n📊 DOCUMENTS Collection`);
console.log(`  Total documents: ${documentsCount}`);
console.log(`  Size: ${(db.documents.stats().size / 1024).toFixed(2)} KB`);
console.log(`  Indexes: ${db.documents.getIndexes().length}`);

// AuditLogs Collection
const auditlogsCount = db.auditlogs.countDocuments();
console.log(`\n📊 AUDITLOGS Collection`);
console.log(`  Total documents: ${auditlogsCount}`);
console.log(`  Size: ${(db.auditlogs.stats().size / 1024).toFixed(2)} KB`);

console.log("\n" + "=".repeat(60));

// Show Users
console.log("\n👥 RECENT USERS:");
db.users.find({}, { email: 1, fullName: 1, createdAt: 1 }).limit(5).forEach(doc => {
  console.log(`  • ${doc.email} (${doc.fullName})`);
});

// Show Holdings by User
console.log("\n📈 HOLDINGS BY SECTOR:");
db.holdings.aggregate([
  { $group: { _id: "$sector", count: { $sum: 1 }, totalValue: { $sum: "$currentMarketValue" } } },
  { $sort: { totalValue: -1 } }
]).forEach(doc => {
  console.log(`  • ${doc._id}: ${doc.count} stocks, Value: $${doc.totalValue.toFixed(2)}`);
});

// Show Recent Transactions
console.log("\n💼 RECENT TRANSACTIONS:");
db.transactions.find({}).sort({ transactionDate: -1 }).limit(5).forEach(doc => {
  console.log(`  • ${doc.transactionType.toUpperCase()} ${doc.quantity} x ${doc.stockSymbol} @ $${doc.pricePerUnit}`);
});

console.log("\n" + "=".repeat(60) + "\n");
```

**Run it:**
```bash
mongosh mongodb://localhost:27017/stockly < scripts/db-stats.js
```

---

## Script 5: Create Indexes

Save as: `scripts/create-indexes.js`

```javascript
use stockly

console.log("Creating indexes...");

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ verificationToken: 1 }, { sparse: true });
db.users.createIndex({ resetPasswordToken: 1 }, { sparse: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ kycStatus: 1 });
db.users.createIndex({ lockUntil: 1 }, { sparse: true });

// Holdings indexes
db.holdings.createIndex({ userId: 1, stockSymbol: 1 }, { unique: true });
db.holdings.createIndex({ userId: 1 });
db.holdings.createIndex({ stockSymbol: 1 });
db.holdings.createIndex({ userId: 1, gainLossPercent: -1 });
db.holdings.createIndex({ sector: 1, userId: 1 });

// Transactions indexes
db.transactions.createIndex({ userId: 1, transactionDate: -1 });
db.transactions.createIndex({ userId: 1, transactionType: 1 });
db.transactions.createIndex({ stockSymbol: 1, userId: 1 });
db.transactions.createIndex({ transactionId: 1 }, { unique: true });
db.transactions.createIndex({ status: 1, userId: 1 });

// Documents indexes
db.documents.createIndex({ userId: 1 });
db.documents.createIndex({ documentNumber: 1 }, { unique: true, sparse: true });
db.documents.createIndex({ verificationStatus: 1 });

// AuditLogs indexes
db.auditlogs.createIndex({ userId: 1, timestamp: -1 });
db.auditlogs.createIndex({ action: 1, timestamp: -1 });

console.log("✅ All indexes created successfully!");
```

**Run it:**
```bash
mongosh mongodb://localhost:27017/stockly < scripts/create-indexes.js
```

---

## Full Setup Command (All in One)

```bash
# 1. Initialize database
mongosh mongodb://localhost:27017/stockly < scripts/mongodb-init.js

# 2. Insert sample data
mongosh mongodb://localhost:27017/stockly < scripts/seed-data.js

# 3. Check statistics
mongosh mongodb://localhost:27017/stockly < scripts/db-stats.js
```

---

## Quick Commands Reference

```bash
# Connect to database
mongosh mongodb://localhost:27017/stockly

# Show all collections
show collections

# Count documents
db.users.countDocuments()
db.holdings.countDocuments()

# Find a user
db.users.findOne({ email: "john@example.com" })

# Find all holdings for a user
db.holdings.find({ email: "john@example.com" })

# View indexes
db.users.getIndexes()

# Delete all data (use with caution!)
db.users.deleteMany({})
db.holdings.deleteMany({})

# Drop entire database
db.dropDatabase()

# Exit
exit
```

---

## Environment Variables

Add to your `.env` file:

```
# Local MongoDB
MONGO_URL=mongodb://localhost:27017/stockly

# MongoDB Atlas
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/stockly

# Port
PORT=3002

# Secrets
JWT_SECRET=your_super_secret_key_change_this
```

---

## Testing Queries

```javascript
// Get portfolio summary for a user
const userId = ObjectId("507f1f77bcf86cd799439011");

const summary = db.holdings.aggregate([
  { $match: { userId: userId } },
  { $group: { 
    _id: null, 
    totalCost: { $sum: "$totalCostValue" },
    totalMarket: { $sum: "$currentMarketValue" },
    totalGain: { $sum: "$gainLoss" },
    holdings: { $sum: 1 }
  }},
  { $project: {
    _id: 0,
    totalCost: 1,
    totalMarket: 1,
    totalGain: 1,
    gainPercent: { $multiply: [{ $divide: ["$totalGain", "$totalCost"] }, 100] },
    holdings: 1
  }}
]);

console.log(summary.toArray());
```

---

## Summary

You now have:
✅ Complete database initialization script  
✅ Sample data seeding  
✅ Reset script  
✅ Statistics viewer  
✅ Index creation  
✅ Quick reference commands  

**Ready to use with your MongoDB!**
