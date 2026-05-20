## API ROUTES (working and have been tested)

POST http://localhost:3002/api/auth/register
POST http://localhost:3002/api/auth/login
GET http://localhost:3002/api/auth/me
GET http://localhost:3002/api/stocks/market-watch
GET http://localhost:3002/api/stocks/quote/RELIANCE.NS
GET http://localhost:3002/api/stocks/history/RELIANCE.NS
POST http://localhost:3002/api/trade/order
GET http://localhost:3002/api/portfolio/holdings
GET http://localhost:3002/api/portfolio/history

### P&L CALCULATION SPEC being used

For each holding returned by GET `/api/portfolio/holdings`:

currentPrice     = fetched live from yahoo-finance2 for that symbol
investedValue    = holding.averagePrice * holding.quantity
currentValue     = currentPrice * holding.quantity
profitLoss       = currentValue - investedValue
profitLossPct    = ((currentValue - investedValue) / investedValue) * 100

Response shape per holding:
{
  stockSymbol: "TCS.NS",
  stockName: "Tata Consultancy Services",
  quantity: 5,
  averagePrice: 3200,
  currentPrice: 3450,     ← from live API
  investedValue: 16000,
  currentValue: 17250,
  profitLoss: 1250,
  profitLossPct: 7.81
}

Portfolio summary (top of holdings page):
{
  totalInvested: sum of all investedValues,
  totalCurrent: sum of all currentValues,
  totalProfitLoss: totalCurrent - totalInvested,
  walletBalance: from User document
}


---

## EXTERNAL API Being used currently 

**Provider: Yahoo Finance (via `yahoo-finance2` npm package)**

* **Why**: Free, no keys required, supports Indian tickers (`.NS` / `.BO`).
* **Implementation Safety Checklist**:
* To avoid hitting rate limits or freezing your runtime during evaluation, the frontend dashboards should fetch quotes *only* when pages change or via a manual refresh button, rather than aggressive 1-second loops.

---

## MASTER STOCK LIST — SINGLE SOURCE OF TRUTH

This exact array is used in: backend stock proxy, seeding script, 
and replaces dashboard/data/data.js

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