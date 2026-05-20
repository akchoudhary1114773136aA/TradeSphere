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
  { symbol: "TATAMOTORS.BO",name: "Tata Motors" },
  { symbol: "MARUTI.NS",   name: "Maruti Suzuki" },
  { symbol: "SUNPHARMA.NS",name: "Sun Pharmaceutical" },
  { symbol: "AXISBANK.NS", name: "Axis Bank" },
  { symbol: "LT.NS",       name: "Larsen & Toubro" }
];

const fetchQuoteWithFallback = async (symbol) => {
  try {
    let quote = await yahooFinance.quote(symbol);
    if (!quote || quote.regularMarketPrice == null) {
      if (symbol.endsWith('.NS')) {
        const fallbackSymbol = symbol.replace('.NS', '.BO');
        const fallbackQuote = await yahooFinance.quote(fallbackSymbol);
        if (fallbackQuote && fallbackQuote.regularMarketPrice != null) {
          return fallbackQuote;
        }
      }
    }
    return quote;
  } catch (error) {
    if (symbol.endsWith('.NS')) {
      try {
        const fallbackSymbol = symbol.replace('.NS', '.BO');
        return await yahooFinance.quote(fallbackSymbol);
      } catch (fallbackError) {
        throw error;
      }
    }
    throw error;
  }
};

const getLiveQuote = async (req, res) => {
  const { symbol } = req.params;
  try {
    const quote = await fetchQuoteWithFallback(symbol);
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
        const quote = await fetchQuoteWithFallback(stock.symbol);
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

const fetchChartWithFallback = async (symbol, queryOptions) => {
  try {
    let result = await yahooFinance.chart(symbol, queryOptions);
    if (!result || !result.quotes || result.quotes.length === 0) {
      if (symbol.endsWith('.NS')) {
        const fallbackSymbol = symbol.replace('.NS', '.BO');
        const fallbackResult = await yahooFinance.chart(fallbackSymbol, queryOptions);
        if (fallbackResult && fallbackResult.quotes && fallbackResult.quotes.length > 0) {
          return fallbackResult;
        }
      }
    }
    return result;
  } catch (error) {
    if (symbol.endsWith('.NS')) {
      try {
        const fallbackSymbol = symbol.replace('.NS', '.BO');
        return await yahooFinance.chart(fallbackSymbol, queryOptions);
      } catch (fallbackError) {
        throw error;
      }
    }
    throw error;
  }
};

const getStockHistory = async (req, res) => {
  const { symbol } = req.params;
  const { period, period1, period2, interval } = req.query;
  
  try {
    const queryOptions = {
      interval: interval || '1d',
    };
    
    if (period) {
      const now = new Date();
      let startDate = new Date();
      if (period === '1W') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === '1M') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === '3M') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (period === '1Y') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      queryOptions.period1 = startDate.toISOString().split('T')[0];
    } else {
      queryOptions.period1 = period1 || '2024-01-01'; // Default
    }
    
    if (period2) {
      queryOptions.period2 = period2;
    }
    
    const result = await fetchChartWithFallback(symbol, queryOptions);
    
    res.json(result.quotes || []);
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
