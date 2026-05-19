require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./models/HoldingsModel");

const { PositionsModel } = require("./models/PositionsModel");
const { OrdersModel } = require("./models/OrdersModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

mongoose.set("bufferCommands", false);

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "stockly-local-dev-secret";
}

const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stockRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const { runSeed } = require("./seed");

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"]
}));
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/portfolio", portfolioRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// app.get("/addHoldings", async (req, res) => {
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach((item) => {
//     let newHolding = new HoldingsModel({
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.day,
//       day: item.day,
//     });

//     newHolding.save();
//   });
//   res.send("Done!");
// });

// app.get("/addPositions", async (req, res) => {
//   let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({
//       product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

//     newPosition.save();
//   });
//   res.send("Done!");
// });

const toDashboardHolding = (holding) => {
  const raw = typeof holding.toObject === "function" ? holding.toObject() : holding;
  const name = raw.name || raw.stockSymbol || "";
  const avg = Number(raw.avg ?? raw.averagePrice ?? raw.price ?? 0);
  const price = Number(raw.price ?? raw.currentPrice ?? avg);
  const qty = Number(raw.qty ?? raw.quantity ?? 0);
  const netValue = avg ? ((price - avg) / avg) * 100 : 0;

  return {
    name: name.replace(".NS", ""),
    qty,
    avg,
    price,
    net: raw.net || `${netValue >= 0 ? "+" : ""}${netValue.toFixed(2)}%`,
    day: raw.day || `${netValue >= 0 ? "+" : ""}${netValue.toFixed(2)}%`,
    isLoss: raw.isLoss ?? price < avg,
  };
};

app.get("/allHoldings", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([]);
  }

  try {
    let allHoldings = await HoldingsModel.find({});
    res.json(allHoldings.map(toDashboardHolding));
  } catch (err) {
    res.json([]);
  }
});

app.get("/allPositions", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json([]);
  }

  try {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (err) {
    res.json([]);
  }
});

app.post("/newOrder", async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(202).json({ message: "Order received in demo mode" });
  }

  try {
    const stockSymbol = req.body.stockSymbol || req.body.name;
    const quantity = Number(req.body.quantity ?? req.body.qty ?? 0);
    const price = Number(req.body.price ?? 0);

    let newOrder = new OrdersModel({
      stockSymbol,
      quantity,
      price,
      mode: req.body.mode,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved!" });
  } catch (err) {
    res.status(202).json({ message: "Order received" });
  }
});

app.listen(PORT, () => {
  console.log("App started!");
  if (!uri) {
    console.warn("MONGO_URL is not set. Backend is running in demo fallback mode.");
    return;
  }

  mongoose.connection.once("open", () => {
    runSeed();
  });

  mongoose.connect(uri).catch((err) => {
    console.error("DB connection failed:", err.message);
  });
  // mongoose.connect(uri)
  // .then(() => {
  //   app.listen(PORT, () => {
  //     console.log("App started and connected to DB!");
  //   });
  // })
  // .catch((err) => {
  //   console.error("DB connection failed:", err.message);
  //   process.exit(1); // don't start server without DB
  // });
});
