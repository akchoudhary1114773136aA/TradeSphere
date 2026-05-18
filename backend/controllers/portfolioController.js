const { HoldingsModel } = require("../models/HoldingsModel");
const { OrdersModel } = require("../models/OrdersModel");
const User = require("../models/User");
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

const getHoldings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const holdings = await HoldingsModel.find({ userId });

    const results = await Promise.allSettled(
      holdings.map((holding) => 
        yahooFinance.quote(holding.stockSymbol)
          .then(quote => ({ holding, currentPrice: quote.regularMarketPrice }))
          .catch(() => ({ holding, currentPrice: null }))
      )
    );

    let totalInvested = 0;
    let totalCurrent = 0;

    const formattedHoldings = results.map(r => {
      const { holding, currentPrice } = r.value;
      const investedValue = holding.averagePrice * holding.quantity;
      let currentValue = null;
      let profitLoss = null;
      let profitLossPct = null;

      if (currentPrice !== null) {
        currentValue = currentPrice * holding.quantity;
        profitLoss = currentValue - investedValue;
        profitLossPct = ((currentValue - investedValue) / investedValue) * 100;

        totalInvested += investedValue;
        totalCurrent += currentValue;
      } else {
        totalInvested += investedValue;
      }

      return {
        stockSymbol: holding.stockSymbol,
        stockName: holding.stockSymbol, // Using symbol as name for now
        quantity: holding.quantity,
        averagePrice: holding.averagePrice,
        currentPrice,
        investedValue,
        currentValue,
        profitLoss,
        profitLossPct
      };
    });

    const totalProfitLoss = totalCurrent ? totalCurrent - totalInvested : null;

    res.json({
      summary: {
        totalInvested,
        totalCurrent,
        totalProfitLoss,
        walletBalance: user ? user.walletBalance : 0
      },
      holdings: formattedHoldings
    });
  } catch (err) {
    console.error("Error fetching holdings:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await OrdersModel.find({ userId }).sort({ _id: -1 });
    
    const formattedOrders = orders.map(order => ({
      stockSymbol: order.stockSymbol,
      type: order.mode,
      quantity: order.quantity,
      priceAtTransaction: order.price,
      totalAmount: order.price * order.quantity,
      timestamp: order._id.getTimestamp() 
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error("Error fetching transaction history:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

module.exports = {
  getHoldings,
  getTransactionHistory
};
