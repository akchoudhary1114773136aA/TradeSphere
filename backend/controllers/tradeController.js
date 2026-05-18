const { HoldingsModel } = require("../models/HoldingsModel");
const { OrdersModel } = require("../models/OrdersModel");
const User = require("../models/User");
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

const executeTrade = async (req, res) => {
  const { stockSymbol, quantity, type } = req.body;
  const userId = req.user.id; // Extracted by authMiddleware

  if (!stockSymbol || !quantity || !type) {
    return res.status(400).json({ message: "Missing required fields: stockSymbol, quantity, type" });
  }

  if (type !== "BUY" && type !== "SELL") {
    return res.status(400).json({ message: "Invalid trade type. Must be BUY or SELL." });
  }

  try {
    // 1. Fetch live price (server-side only)
    const quote = await yahooFinance.quote(stockSymbol);
    if (!quote || !quote.regularMarketPrice) {
      return res.status(400).json({ message: "Could not fetch live price for symbol" });
    }
    const livePrice = quote.regularMarketPrice;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let updatedHolding = null;

    if (type === "BUY") {
      const totalCost = livePrice * quantity;
      
      // 3. Check wallet balance
      if (user.walletBalance < totalCost) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      // 4. Deduct totalCost
      user.walletBalance -= totalCost;
      await user.save();

      // 5. Update Holding
      let holding = await HoldingsModel.findOne({ stockSymbol, userId });
      if (holding) {
        const existingQty = holding.quantity;
        const existingAvgPrice = holding.averagePrice;
        // Recalculate average price
        const newAveragePrice = ((existingQty * existingAvgPrice) + (quantity * livePrice)) / (existingQty + quantity);
        
        holding.quantity += quantity;
        holding.averagePrice = newAveragePrice;
        holding.price = livePrice; // Optional: updating latest tracked price
        updatedHolding = await holding.save();
      } else {
        const newHolding = new HoldingsModel({
          stockSymbol,
          quantity,
          averagePrice: livePrice,
          price: livePrice,
          userId
        });
        updatedHolding = await newHolding.save();
      }

      // 6. Create Transaction (Order)
      const newOrder = new OrdersModel({
        stockSymbol,
        quantity,
        price: livePrice,
        mode: "BUY",
        userId
      });
      await newOrder.save();

    } else if (type === "SELL") {
      // 2. Find user's Holding
      let holding = await HoldingsModel.findOne({ stockSymbol, userId });
      if (!holding) {
        return res.status(400).json({ message: "You do not hold this stock" });
      }

      // 3. Check quantity
      if (holding.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient shares" });
      }

      // 4. Calculate totalReturn
      const totalReturn = livePrice * quantity;

      // 5. Add totalReturn to walletBalance
      user.walletBalance += totalReturn;
      await user.save();

      // 6. Reduce holding
      holding.quantity -= quantity;
      if (holding.quantity === 0) {
        await HoldingsModel.deleteOne({ _id: holding._id });
      } else {
        holding.price = livePrice;
        updatedHolding = await holding.save();
      }

      // 7. Create Transaction (Order)
      const newOrder = new OrdersModel({
        stockSymbol,
        quantity,
        price: livePrice,
        mode: "SELL",
        userId
      });
      await newOrder.save();
    }

    // 8. Return updated wallet and holding
    return res.json({
      message: "Trade executed successfully",
      walletBalance: user.walletBalance,
      holding: updatedHolding
    });

  } catch (error) {
    console.error("Trade execution error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { executeTrade };
