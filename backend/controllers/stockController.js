const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

const MARKET_WATCH_STOCKS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries" },
  { symbol: "TCS.NS",      name: "Tata Consultancy Services" },
  { symbol: "INFY.NS",     name: "Infosys" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "ICICIBANK.NS",name: "ICICI Bank" },
  { symbol: "HINDUNILVR.NS",name: "Hindustan Unilever" },
  { symbol: "SBIN.NS",     name: "State Bank of India" },
  { symbol: "BAJFINANCE.NS",name: "Bajaj Finance" },
  { symbol: "WIPRO.NS",    name: "Wipro" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises" },
  { symbol: "TATAMOTORS.NS",name: "Tata Motors" },
  { symbol: "MARUTI.NS",   name: "Maruti Suzuki" },
  { symbol: "SUNPHARMA.NS",name: "Sun Pharmaceutical" },
  { symbol: "AXISBANK.NS", name: "Axis Bank" },
  { symbol: "LT.NS",       name: "Larsen & Toubro" }
];

const getLiveQuote = async (req, res) => {
  const { symbol } = req.params;
  try {
    const quote = await yahooFinance.quote(symbol);
    res.json(quote);
  } catch (error) {
    console.error("Error fetching live quote for", symbol, error);
    res.status(500).json({ message: "Failed to fetch live quote", error: error.message });
  }
};

const getMarketWatch = async (req, res) => {
  try {
    const results = await Promise.allSettled(
      MARKET_WATCH_STOCKS.map(async (stock) => {
        const quote = await yahooFinance.quote(stock.symbol);
        return {
          ...stock,
          quote
        };
      })
    );

    const data = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return { ...MARKET_WATCH_STOCKS[index], error: 'Failed to fetch' };
      }
    });

    res.json(data);
  } catch (error) {
    console.error("Error fetching market watch", error);
    res.status(500).json({ message: "Failed to fetch market watch", error: error.message });
  }
};

const getStockHistory = async (req, res) => {
  const { symbol } = req.params;
  const { period1, period2, interval } = req.query;
  
  try {
    const queryOptions = {
      period1: period1 || '2024-01-01', // Default
      interval: interval || '1d',
    };
    if (period2) {
      queryOptions.period2 = period2;
    }
    
    // v3 uses chart() instead of the removed historical API
    const result = await yahooFinance.chart(symbol, queryOptions);
    
    // Return quotes to mimic the array structure previously returned by historical()
    res.json(result.quotes);
  } catch (error) {
    console.error("Error fetching stock history for", symbol, error);
    res.status(500).json({ message: "Failed to fetch stock history", error: error.message });
  }
};

module.exports = {
  getLiveQuote,
  getMarketWatch,
  getStockHistory
};
