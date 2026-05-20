const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

// Simple in-memory caches to reduce repeated calls to Yahoo Finance
const quoteCache = new Map(); // key: symbol, value: { ts, data }
const historyCache = new Map(); // key: symbol|options, value: { ts, data }
const QUOTE_TTL = 15 * 1000; // 15s
const HISTORY_TTL = 60 * 1000; // 60s

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
  // try cache
  try {
    const cached = quoteCache.get(symbol);
    if (cached && Date.now() - cached.ts < QUOTE_TTL) {
      return cached.data;
    }
  } catch (e) {}

  try {
    let quote = await yahooFinance.quote(symbol);
    if (!quote || quote.regularMarketPrice == null) {
      if (symbol.endsWith('.NS')) {
        const fallbackSymbol = symbol.replace('.NS', '.BO');
        const fallbackQuote = await yahooFinance.quote(fallbackSymbol);
        if (fallbackQuote && fallbackQuote.regularMarketPrice != null) {
          try { quoteCache.set(symbol, { ts: Date.now(), data: fallbackQuote }); } catch (e) {}
          return fallbackQuote;
        }
      }
    }
    try { quoteCache.set(symbol, { ts: Date.now(), data: quote }); } catch (e) {}
    return quote;
  } catch (error) {
    if (symbol.endsWith('.NS')) {
      try {
        const fallbackSymbol = symbol.replace('.NS', '.BO');
        const fb = await yahooFinance.quote(fallbackSymbol);
        try { quoteCache.set(symbol, { ts: Date.now(), data: fb }); } catch (e) {}
        return fb;
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

// Normalize various Yahoo chart responses into [{ date: ISOString, close: Number }, ...]
const parseChartResultToQuotes = (chartResult) => {
  if (!chartResult) return [];

  // If the wrapper already provided a 'quotes' array, use it.
  if (Array.isArray(chartResult.quotes) && chartResult.quotes.length > 0) {
    return chartResult.quotes
      .map((q) => {
        let date = q.date;
        if (typeof date === 'number') date = new Date(date).toISOString();
        else if (typeof date === 'string') date = new Date(date).toISOString();
        else if (q.timestamp) date = new Date(q.timestamp * 1000).toISOString();
        return { date, close: q.close ?? q.adjClose ?? q.close };
      })
      .filter((q) => q.close != null);
  }

  // The raw yahoo-finance2 structure: chart.result[0].timestamp + indicators.quote[0].close
  if (chartResult.chart && Array.isArray(chartResult.chart.result) && chartResult.chart.result.length > 0) {
    const r = chartResult.chart.result[0];
    const ts = r.timestamp || [];
    const quote = r.indicators && r.indicators.quote && r.indicators.quote[0];
    const adj = r.indicators && r.indicators.adjclose && r.indicators.adjclose[0];
    if (Array.isArray(ts) && ts.length > 0) {
      const out = ts
        .map((t, i) => {
          let close = null;
          if (quote && Array.isArray(quote.close)) close = quote.close[i];
          if ((close == null || isNaN(close)) && adj && Array.isArray(adj.adjclose)) close = adj.adjclose[i];
          return { date: new Date(t * 1000).toISOString(), close };
        })
        .filter((x) => x.close != null);
      return out;
    }
  }

  // Some responses expose timestamp + indicators at top level
  if (Array.isArray(chartResult.timestamp) && chartResult.indicators) {
    const ts = chartResult.timestamp;
    const quote = chartResult.indicators.quote && chartResult.indicators.quote[0];
    const adj = chartResult.indicators.adjclose && chartResult.indicators.adjclose[0];
    if (Array.isArray(ts) && ts.length > 0) {
      return ts
        .map((t, i) => {
          let close = quote && Array.isArray(quote.close) ? quote.close[i] : (adj && Array.isArray(adj.adjclose) ? adj.adjclose[i] : null);
          return { date: new Date(t * 1000).toISOString(), close };
        })
        .filter((x) => x.close != null);
    }
  }

  return [];
};

const fetchChartWithFallback = async (symbol, queryOptions) => {
  const cacheKey = `${symbol}|${JSON.stringify(queryOptions || {})}`;
  try {
    const cached = historyCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < HISTORY_TTL) {
      return cached.data;
    }
  } catch (e) {}

  const tried = [];

  // Build a list of sensible candidate symbols to try.
  const buildCandidates = (sym) => {
    if (!sym) return [];
    const s = String(sym).trim();
    const out = [];

    // always try the raw symbol first
    out.push(s);

    // if it's an index symbol (starts with ^), don't append .NS/.BO
    if (s.startsWith('^')) {
      return [...new Set(out)];
    }

    // remove known suffixes
    const base = s.replace(/\.(NS|BO)$/i, '');
    if (base && !out.includes(base)) out.push(base);
    if (!base.toUpperCase().endsWith('.NS')) out.push(`${base}.NS`);
    if (!base.toUpperCase().endsWith('.BO')) out.push(`${base}.BO`);

    // Try to match known market watch stocks by name or base symbol
    try {
      const lookup = MARKET_WATCH_STOCKS.find((stock) => {
        const stockBase = (stock.symbol || '').replace(/\.(NS|BO)$/i, '');
        if (stockBase.toUpperCase() === base.toUpperCase()) return true;
        if ((stock.name || '').replace(/\s+/g, '').toUpperCase() === base.replace(/\s+/g, '').toUpperCase()) return true;
        return false;
      });
      if (lookup && lookup.symbol && !out.includes(lookup.symbol)) out.push(lookup.symbol);
    } catch (e) {}

    return [...new Set(out)];
  };

  const uniq = buildCandidates(symbol);

  let lastError = null;
  for (const cand of uniq) {
    tried.push(cand);
    try {
      const result = await yahooFinance.chart(cand, queryOptions);
      const quotes = parseChartResultToQuotes(result);
      if (quotes && quotes.length > 0) {
        try { historyCache.set(cacheKey, { ts: Date.now(), data: result }); } catch (e) {}
        return result;
      }
      // no usable quotes, continue
    } catch (err) {
      // Sometimes yahoo-finance2 throws a FailedYahooValidationError but includes a partial `result` object
      if (err && err.result) {
        try {
          const parsed = parseChartResultToQuotes(err.result);
          if (parsed && parsed.length > 0) {
            try { historyCache.set(cacheKey, { ts: Date.now(), data: err.result }); } catch (e) {}
            return err.result;
          }
        } catch (e) {
          // fallthrough to record error
        }
      }
      lastError = err;
      // try next candidate
    }
  }

  if (lastError) throw lastError;
  throw new Error(`No data found for symbol: ${symbol} (tried: ${tried.join(',')})`);
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
      // Support a wider set of period values for landing timelines
      // and pick an appropriate interval for the Yahoo chart API.
      switch ((period || '').toUpperCase()) {
        case '1D':
          startDate.setDate(now.getDate() - 1);
          queryOptions.interval = '5m';
          break;
        case '2D':
          startDate.setDate(now.getDate() - 2);
          queryOptions.interval = '15m';
          break;
        case '1W':
          startDate.setDate(now.getDate() - 7);
          queryOptions.interval = '30m';
          break;
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          queryOptions.interval = '1d';
          break;
        case '3M':
          startDate.setMonth(now.getMonth() - 3);
          queryOptions.interval = '1d';
          break;
        case '6M':
          startDate.setMonth(now.getMonth() - 6);
          queryOptions.interval = '1d';
          break;
        case '1Y':
          startDate.setFullYear(now.getFullYear() - 1);
          queryOptions.interval = '1d';
          break;
        case '5Y':
          startDate.setFullYear(now.getFullYear() - 5);
          queryOptions.interval = '1wk';
          break;
        default:
          // fallback to 1 month
          startDate.setMonth(now.getMonth() - 1);
          queryOptions.interval = '1d';
      }

      queryOptions.period1 = Math.floor(startDate.getTime() / 1000);
      queryOptions.period2 = Math.floor(now.getTime() / 1000);
    } else {
      // Accept explicit period1/period2 if provided, otherwise default to Jan 1 2024
      queryOptions.period1 = period1 ? Math.floor(new Date(period1).getTime() / 1000) : Math.floor(new Date('2024-01-01').getTime() / 1000);
      if (period2) queryOptions.period2 = Math.floor(new Date(period2).getTime() / 1000);
    }
    
    
    const result = await fetchChartWithFallback(symbol, queryOptions);
    const quotes = parseChartResultToQuotes(result);
    res.json(quotes);
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
