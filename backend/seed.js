const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const { HoldingsModel } = require("./models/HoldingsModel");
const { OrdersModel } = require("./models/OrdersModel");

const runSeed = async () => {
  try {
    // 1. Check if the Demo User already exists
    const existingDemoUser = await User.findOne({ email: "demo@stockly.com" });
    if (existingDemoUser) {
      console.log("Demo user already exists. Skipping seed.");
      return; 
    }

    // 2. Create demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("demo1234", salt);

    const demoUser = new User({
      name: "Demo User",
      email: "demo@stockly.com",
      password: hashedPassword,
      walletBalance: 85000 
    });
    
    await demoUser.save();
    const userId = demoUser._id;

    // 3. Create 3 Holdings
    const holdings = [
      { stockSymbol: "RELIANCE.NS", quantity: 5, averagePrice: 2800 },
      { stockSymbol: "TCS.NS", quantity: 2, averagePrice: 3800 },
      { stockSymbol: "HDFCBANK.NS", quantity: 10, averagePrice: 1600 }
    ];

    for (let h of holdings) {
      const holdingDoc = new HoldingsModel({
        stockSymbol: h.stockSymbol,
        quantity: h.quantity,
        averagePrice: h.averagePrice,
        price: h.averagePrice, 
        userId
      });
      await holdingDoc.save();
    }

    // 4. Create 10 Transactions
    const transactions = [
      { stockSymbol: "RELIANCE.NS", quantity: 2, price: 2750, mode: "BUY" },
      { stockSymbol: "RELIANCE.NS", quantity: 3, price: 2833.33, mode: "BUY" },
      { stockSymbol: "TCS.NS", quantity: 1, price: 3750, mode: "BUY" },
      { stockSymbol: "TCS.NS", quantity: 1, price: 3850, mode: "BUY" },
      { stockSymbol: "HDFCBANK.NS", quantity: 5, price: 1550, mode: "BUY" },
      { stockSymbol: "HDFCBANK.NS", quantity: 10, price: 1625, mode: "BUY" },
      { stockSymbol: "HDFCBANK.NS", quantity: 5, price: 1600, mode: "SELL" },
      { stockSymbol: "INFY.NS", quantity: 4, price: 1400, mode: "BUY" },
      { stockSymbol: "INFY.NS", quantity: 4, price: 1450, mode: "SELL" },
      { stockSymbol: "SBIN.NS", quantity: 2, price: 600, mode: "BUY" }
    ];

    for (let t of transactions) {
      const orderDoc = new OrdersModel({
        stockSymbol: t.stockSymbol,
        quantity: t.quantity,
        price: t.price,
        mode: t.mode,
        userId
      });
      await orderDoc.save();
    }

    console.log("Database seeded successfully");
  } catch (err) {
    console.error("Seeding error:", err);
  }
};

module.exports = { runSeed };
