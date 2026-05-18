# Stockly Project Strategy & Architecture

## 1. PROJECT SNAPSHOT

### ACTUAL CURRENT FILE TREE (as of Phase 1 completion)

```text
+--- backend
|   +--- controllers
|   |   \--- authController.js
|   +--- middleware
|   |   \--- authMiddleware.js
|   +--- models
|   |   +--- HoldingsModel.js
|   |   +--- OrdersModel.js
|   |   +--- PositionsModel.js
|   |   \--- User.js
|   +--- routes
|   |   \--- authRoutes.js
|   +--- schemas
|   |   +--- HoldingsSchema.js
|   |   +--- OrdersSchema.js
|   |   \--- PositionsSchema.js
|   +--- .env
|   +--- index.js
|   +--- package-lock.json
|   \--- package.json
+--- dashboard
|   +--- public
|   |   +--- index.html
|   |   +--- logo.png
|   |   \--- robots.txt
|   +--- src
|   |   +--- components
|   |   |   +--- Apps.js
|   |   |   +--- BuyActionWindow.css
|   |   |   +--- BuyActionWindow.js
|   |   |   +--- Dashboard.js
|   |   |   +--- DoughnoutChart.js
|   |   |   +--- Funds.js
|   |   |   +--- GeneralContext.js
|   |   |   +--- Holdings.js
|   |   |   +--- Home.js
|   |   |   +--- Menu.js
|   |   |   +--- Orders.js
|   |   |   +--- Positions.js
|   |   |   +--- Summary.js
|   |   |   +--- TopBar.js
|   |   |   +--- VerticalGraph.js
|   |   |   \--- WatchList.js
|   |   +--- data
|   |   |   \--- data.js
|   |   +--- index.css
|   |   \--- index.js
|   +--- package-lock.json
|   \--- package.json
+--- frontend
|   +--- public
|   |   +--- index.html
|   |   +--- manifest.json
|   |   \--- robots.txt
|   +--- src
|   |   +--- landing_page
|   |   |   +--- about
|   |   |   |   +--- AboutPage.js
|   |   |   |   +--- Hero.js
|   |   |   |   \--- Team.js
|   |   |   +--- home
|   |   |   |   +--- Awards.js
|   |   |   |   +--- Education.js
|   |   |   |   +--- Hero.js
|   |   |   |   +--- HomePage.js
|   |   |   |   +--- Pricing.js
|   |   |   |   \--- Stats.js
|   |   |   +--- pricing
|   |   |   |   +--- Brokerage.js
|   |   |   |   +--- Hero.js
|   |   |   |   \--- PricingPage.js
|   |   |   +--- products
|   |   |   |   +--- Hero.js
|   |   |   |   +--- LeftSection.js
|   |   |   |   +--- ProductsPage.js
|   |   |   |   +--- RightSection.js
|   |   |   |   \--- Universe.js
|   |   |   +--- signup
|   |   |   |   \--- Signup.js
|   |   |   +--- support
|   |   |   |   +--- CreateTicket.js
|   |   |   |   +--- Hero.js
|   |   |   |   \--- SupportPage.js
|   |   |   +--- Footer.js
|   |   |   +--- Navbar.js
|   |   |   +--- NotFound.js
|   |   |   \--- OpenAccount.js
|   |   +--- index.css
|   |   \--- index.js
|   +--- package-lock.json
|   +--- package.json
|   \--- README.md
+--- markdowns
|   +--- Backend_Template_Complete (1).md
|   +--- Database_Template_Complete (1).md
|   +--- Frontend_Template_Complete.md
|   +--- MongoDB_Setup_Scripts.md
|   \--- plan.md
+--- README.md
+--- response.md
+--- strategy.md
\--- strategy_updated.md
```

### Current State & Functionality

* **Frontend**: Primarily visual. Contains static pages and routing. No authentication wiring yet.
* **Dashboard**: Partially functional but heavily reliant on mock data.
* `Holdings.js` fetches data from `http://localhost:3002/allHoldings` but hardcodes summary values.
* `WatchList.js` uses hardcoded local data from `data/data.js`.
* `BuyActionWindow.js` triggers a `POST /newOrder` to the backend.


* **Backend**:
* **Phase 1 Complete**: Auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) are implemented. **Testing done**.
* Defines schemas for `Users`, `Holdings`, `Positions`, and `Orders`.
* Legacy endpoints `/allHoldings`, `/allPositions`, and `/newOrder` exist but need adaptation to use JWT `userId`.

### Dependencies

* **Backend**: `express`, `mongoose`, `cors`, `body-parser`, `dotenv`, `bcryptjs`, `jsonwebtoken`.
* **Frontend/Dashboard**: Standard React dependencies, `@mui/material`, `chart.js`, `axios`, `react-router-dom`.

---

## 2. ARCHITECTURE & INTEGRATION DECISION

### Frontend Separation (Deferred for Demo Velocity)

> ⚠️ **CRITICAL STRATEGY SHIFT:** Merging two separate Create React App instances introduces high risks of CSS collisions, conflicting `package.json` dependencies, and React version mismatches.

Keep `frontend` (Port 3000) and `dashboard` (Port 3001) separate.

* **Auth Handoff Strategy:** When a user logs in on the `frontend` app, store the received JWT token inside the browser's `localStorage`. Redirect the user directly to the dashboard app using a standard window assignment: `window.location.href = 'http://localhost:3001/summary?token=' + token`.
* The dashboard entry point will grab the token from the URL parameters, save it to its own `localStorage`, and wipe the URL clean.

### TOKEN HANDOFF IMPLEMENTATION SPEC

Location: `dashboard/src/App.js` — in a top-level useEffect on mount

Logic:
1. Check URL params for `?token=`
2. If found → save to localStorage as key `stockly_token`, 
   then strip it from URL using window.history.replaceState
3. If not found → check if localStorage already has `stockly_token`
4. If neither → redirect to `http://localhost:3000/login`

All axios calls in dashboard use this helper:
  const token = localStorage.getItem('stockly_token')
  headers: { Authorization: `Bearer ${token}` }

### Backend Architecture (CORS Enforced)

Because the frontend, dashboard, and backend live on ports 3000, 3001, and 3002 respectively, the backend **must** explicitly allow Cross-Origin Resource Sharing (CORS). Without this, browser security will silently drop all API calls.

---

## 3. WHAT NEEDS TO BE BUILT — FEATURE LIST

### A. User Authentication & Management

* **Status**: Built, needs verification.
* **To Do**: Run integration sanity tests via Postman to ensure JWT tokens are generated properly and lock down routes.

### B. Stock Data & Curated Market Watch (Phase 4 Backend Core)

* **Optimization**: Custom user watchlists are scrapped to save time. The system will use a global, hardcoded array of 20-30 high-volume Indian stocks (e.g., `RELIANCE.NS`, `TCS.NS`, `INFY.NS`, `HDFCBANK.NS`).
* **Security Dependency**: This layer must be built *before* trading logic can execute. The backend cannot trust stock values sent by the client. It must look up the true price on the server side using this interface.
* **To Build**: A backend proxy route `/api/stocks/quote/:symbol` using `yahoo-finance2` to pull live data for verification and UI display.

### C. Portfolio & Trading Logic (Phase 5)

* **Status**: Existing code relies on global data.
* **To Build**: Tie `Holdings` and `Transactions` to the authenticated `userId`. The `/api/trade/order` endpoint must pull real-time prices directly from the Phase 4 engine to calculate whether a user has enough virtual wallet cash (`price * quantity`) before executing a trade.

### D. Demo Seeding Strategy (Phase 6)

To prevent your evaluation from showing a blank, uninspiring UI, the backend must include an automatic data-seeding trigger on startup if the database is empty.

* **Seed Data**: 1 default demo user, 3 pre-existing mock stock purchases (Holdings), and a 10-row history of recent transactions to make the dashboard charts look active immediately.

---

## 4. MONGODB SCHEMAS

```javascript
// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 100000.00 }, // Virtual demo cash
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

```

```javascript
// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stockSymbol: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Number, required: true },
  priceAtTransaction: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);

```

```javascript
// models/Holding.js
const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stockSymbol: { type: String, required: true },
  quantity: { type: Number, required: true },
  averagePrice: { type: Number, required: true },
});

module.exports = mongoose.model('Holding', HoldingSchema);

```

---

## 5. API ROUTES PLAN

| Method | Route | Description | Auth Required |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create new user, initialize wallet | No |
| POST | `/api/auth/login` | Authenticate user, return JWT | No |
| GET | `/api/auth/me` | Get profile & wallet balance | **Yes** |
| GET | `/api/stocks/quote/:symbol` | Backend internal pricing lookup proxy | **Yes** |
| GET | `/api/stocks/market-watch` | Get live quotes for the 20-30 hardcoded stocks | **Yes** |
| POST | `/api/trade/order` | Execute a buy/sell trade (verifies via proxy) | **Yes** |
| GET | `/api/portfolio/holdings` | Get user's current holdings & calculate live P&L | **Yes** |
| GET | `/api/portfolio/history` | Get history of user's buys/sells | **Yes** |

### P&L CALCULATION SPEC

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

## 6. DEVELOPMENT EXECUTION ORDER

```
[Phase 1: Auth Verification] ➡️ [Phase 2: Stock API Backend] ➡️ [Phase 3: Trade Logic] ➡️ [Phase 4: Seeding & P&L] ➡️ [Phase 5: UI Integration]

```

### Phase 1 — Auth Backend Verification (done)

- Goal: Verify register/login/me endpoints work via Postman. 
  Confirm CORS is configured for ports 3000 and 3001.
- No new files. Test only.

### Phase 2 — Stock API Backend Proxy (done)

- Goal: Install yahoo-finance2. Build:
  1. GET /api/stocks/quote/:symbol
  2. GET /api/stocks/market-watch (uses Section 10 master list only)
- Files to create: backend/routes/stockRoutes.js, 
  backend/controllers/stockController.js
- Give me instructions so that I can test both routes via Postman before proceeding.

### Phase 3 — Trading Logic & Wallet Safeguards (done)

- Goal: Build POST /api/trade/order
- BUY: fetch live price from Phase 2 proxy (never trust client price),
  check wallet >= price * quantity, deduct wallet, update Holding
- SELL: check Holding quantity >= requested quantity, 
  update wallet, reduce Holding
- Files to create: backend/routes/tradeRoutes.js,
  backend/controllers/tradeController.js
- Files to modify: backend/models/Holding.js (add userId if missing)

### Phase 4 — Database Seeding & Portfolio P&L Calculation 

- Goal: Seed script + GET /api/portfolio/holdings with P&L calc
- Seed symbols must come from Section 10 master list only
- P&L formula: see Section 5
- Files to create: backend/routes/portfolioRoutes.js,
  backend/controllers/portfolioController.js, backend/seed.js.

### Phase 5 — Frontend/Dashboard UI Wiring 

- Goal: Wire both apps to backend using axios + token handoff
- Token handoff spec: see Section 2
- Replace legacy routes per deprecation table below
- Tell me what needs to be tested after completion

**LEGACY ROUTE DEPRECATION PLAN**

These routes exist in index.js and must NOT be deleted until 
the UI components that call them are rewired:

| Legacy Route    | Called By              | Replace With              | Phase |
|-----------------|------------------------|---------------------------|-------|
| GET /allHoldings | dashboard/Holdings.js  | GET /api/portfolio/holdings| UI Wiring |
| POST /newOrder   | dashboard/BuyActionWindow.js | POST /api/trade/order | UI Wiring |
| GET /allPositions| Unused — safe to deprecate immediately. | GET /api/portfolio/holdings| UI Wiring |

---

## 7. EXTERNAL API RECOMMENDATION

**Provider: Yahoo Finance (via `yahoo-finance2` npm package)**

* **Why**: Free, no keys required, supports Indian tickers (`.NS` / `.BO`).
* **Implementation Safety Checklist**:
* To avoid hitting rate limits or freezing your runtime during evaluation, the frontend dashboards should fetch quotes *only* when pages change or via a manual refresh button, rather than aggressive 1-second loops.



---

## 8. ENVIRONMENT VARIABLES NEEDED

**Backend (`backend/.env`)**

```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/stockly
PORT=3002
JWT_SECRET=vibe_coding_secret_key_123

```

**Dashboard/Frontend (`.env`)**

```env
REACT_APP_API_URL=http://localhost:3002/api

```


## 9. MASTER STOCK LIST — SINGLE SOURCE OF TRUTH

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