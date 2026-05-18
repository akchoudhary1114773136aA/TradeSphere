# Stockly Project Strategy & Architecture

## 1. PROJECT SNAPSHOT

### Folder Structure
The project is currently split into three main directories, representing a decoupled frontend, dashboard, and backend architecture:
- `frontend/`: A React (Create React App) application serving the public-facing pages (Home, About, Pricing, Products, Signup, Support). Currently running independently.
- `dashboard/`: A second React (Create React App) application serving the post-login trading interface (Summary, Orders, Holdings, Positions, Funds, Apps, Watchlist). Uses `@mui/material` and `chart.js`.
- `backend/`: A Node.js/Express server providing REST APIs. Connects to MongoDB via Mongoose.

### Current State & Functionality
- **Frontend**: Primarily visual. Contains static pages and routing, but no actual authentication logic or API wiring.
- **Dashboard**: Partially functional but heavily reliant on mock data. 
  - `Holdings.js` fetches data from `http://localhost:3002/allHoldings` but hardcodes summary values (e.g., Total Investment 29,875.55).
  - `WatchList.js` uses hardcoded local data from `data/data.js` and hardcoded colors for its Chart.js implementation.
  - `BuyActionWindow.js` triggers a `POST /newOrder` to the backend.
- **Backend**: Basic setup with Express and Mongoose connecting to MongoDB Atlas. 
  - Defines schemas for `Holdings`, `Positions`, and `Orders`.
  - Has endpoints `/allHoldings`, `/allPositions`, and `/newOrder`.
  - Contains commented-out seed scripts for populating the database.

### Dependencies
- **Backend**: `express`, `mongoose`, `cors`, `body-parser`, `dotenv`. Auth packages (`passport`, `passport-local`, `passport-local-mongoose`) are installed but unused.
- **Frontend**: Standard React dependencies + `react-router-dom`.
- **Dashboard**: `@mui/material`, `@emotion/*`, `chart.js`, `react-chartjs-2`, `axios`, `react-router-dom`.

### Inconsistencies & Missing Assets
- **Disconnected Frontends**: Having two separate React apps (`frontend` and `dashboard`) running on different ports makes state management (like Auth tokens) and smooth navigation difficult.
- **Hardcoded Data**: Dashboard relies on hardcoded data for watchlists, positions, and portfolio summary numbers.
- **Missing Auth**: The backend has auth packages but no routes. The frontend has a signup page but no login page.
- **Global Data**: The backend schemas do not associate records with specific users (no `userId` fields), meaning the current API serves global data to anyone.

---

## 2. ARCHITECTURE DECISION

### Frontend Unification
**Recommendation: Unify `frontend/` and `dashboard/` into a single React application.**
Currently, navigating from the public site to the dashboard requires jumping between ports, which breaks the Single Page Application (SPA) experience and complicates JWT storage. 
- Move the `dashboard/src/components` into `frontend/src/dashboard`.
- Use React Router to handle both public routes (`/`, `/about`, `/signup`) and protected routes (`/dashboard/*`).
- This allows a global Auth Context to manage the user's logged-in state and seamlessly redirect them to the dashboard upon login.

### Final Folder Structure
```text
STOCKLY/
├── backend/          # Node.js + Express API
│   ├── controllers/  # API route logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express router definitions
│   ├── middleware/   # JWT auth middleware
│   ├── index.js      # Server entry point
│   └── .env
└── frontend/         # Unified React App
    ├── public/
    └── src/
        ├── components/    # Reusable UI (Navbar, Footer)
        ├── pages/         # Public pages (Home, Signup, Login)
        ├── dashboard/     # Trading interface components
        ├── context/       # Auth & Data Contexts
        └── App.js         # Main Router
```

### Backend Architecture
Use a standard MVC (Model-View-Controller) structure for the Express API. Use stateless JWT (JSON Web Tokens) for authentication instead of session-based Passport to make scaling and frontend integration easier. 

---

## 3. WHAT NEEDS TO BE BUILT — FEATURE LIST

### A. User Authentication & Management
- **Exists**: UI for Signup (Frontend), Passport dependencies (Backend).
- **Missing**: Login UI page, JWT generation/verification, Auth middleware, Wallet logic.
- **To Build**:
  - `POST /api/auth/register`: Hash password (bcrypt), create user, initialize virtual wallet with ₹1,00,000.
  - `POST /api/auth/login`: Verify password, return JWT.
  - `GET /api/auth/me`: Fetch logged-in user profile & wallet balance.
  - Auth Middleware to protect dashboard routes.

### B. Portfolio & Investment Tracking
- **Exists**: Basic schemas for Holdings/Orders. UI for portfolio viewing.
- **Missing**: Associating holdings with a User. Real P&L math. Transaction history.
- **To Build**:
  - Real Buy/Sell transaction logic that updates the user's wallet balance and holding quantities.
  - `GET /api/portfolio`: Calculate current value and P&L by comparing live prices with average purchase prices.

### C. Stock Data & Pricing
- **Exists**: Nothing (all hardcoded).
- **Missing**: Live API integration.
- **To Build**:
  - Proxy route in backend to fetch live prices and historical OHLC data from a third-party API.
  - UI polling mechanism to refresh Watchlist prices every 10 seconds.

### D. Dashboard & UI Wiring
- **Exists**: Visual components for Watchlist, Holdings, Funds.
- **Missing**: Context providers to share state, API wiring.
- **To Build**:
  - Connect `BuyActionWindow` to the real transaction API (ensure wallet checks exist).
  - Connect `Funds` page to user's virtual wallet balance.
  - Connect `Summary` page to dynamic P&L calculations.

---

## 4. MONGODB SCHEMAS

```javascript
// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Digital wallet for POC. Replace with Razorpay integration references later.
  walletBalance: { type: Number, default: 100000.00 }, 
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
  stockName: { type: String },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Number, required: true },
  priceAtTransaction: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
```

```javascript
// models/Holding.js
const mongoose = require('mongoose');

// Derived from transactions, but cached here for fast portfolio querying
const HoldingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stockSymbol: { type: String, required: true },
  stockName: { type: String },
  quantity: { type: Number, required: true, min: 0 },
  averagePrice: { type: Number, required: true },
});

module.exports = mongoose.model('Holding', HoldingSchema);
```

```javascript
// models/Watchlist.js
const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbols: [{ type: String }] // Array of stock tickers
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);
```

---

## 5. API ROUTES PLAN

| Method | Route | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Create new user, initialize wallet | No |
| POST | `/api/auth/login` | Authenticate user, return JWT | No |
| GET | `/api/auth/me` | Get user profile and wallet balance | Yes |
| GET | `/api/portfolio/holdings` | Get user's current holdings and calculate P&L | Yes |
| GET | `/api/portfolio/transactions` | Get history of user's buys/sells | Yes |
| POST | `/api/trade/order` | Execute a buy/sell (deducts wallet, updates holding) | Yes |
| GET | `/api/watchlist` | Get user's saved watchlist tickers | Yes |
| POST | `/api/watchlist` | Add/remove a ticker from watchlist | Yes |
| GET | `/api/stocks/quote/:symbol` | Proxy to external API for live price | Yes |
| GET | `/api/stocks/history/:symbol` | Proxy to external API for OHLC chart data | Yes |

---

## 6. DEVELOPMENT EXECUTION ORDER

**Phase 1 — Unified Project Setup**
- Goal: Merge `dashboard` components into `frontend`, establish a single React Router, and ensure the app runs on one port.
- Files to modify: `frontend/package.json`, `frontend/src/App.js` (to be created), move `dashboard/src/*` to `frontend/src/dashboard`.
- Depends on: None.

**Phase 2 — Auth Backend & JWT**
- Goal: Setup User schema, register/login logic, and JWT middleware.
- Files to create: `backend/models/User.js`, `backend/routes/auth.js`, `backend/middleware/authMiddleware.js`.
- Depends on: Phase 1.

**Phase 3 — Frontend Auth Integration**
- Goal: Create Login UI, connect Signup UI to API, store JWT in localStorage, and protect dashboard routes.
- Files to modify: `frontend/src/landing_page/signup/Signup.js`, `frontend/src/App.js`.
- Depends on: Phase 2.

**Phase 4 — Stock API Proxy & Watchlist**
- Goal: Integrate `yahoo-finance2` in the backend to fetch live prices and wire the Watchlist UI to display real data.
- Files to create: `backend/routes/stocks.js`.
- Files to modify: `frontend/src/dashboard/components/WatchList.js`.
- Depends on: Phase 3.

**Phase 5 — Trading Logic (Buy/Sell & Wallet)**
- Goal: Implement the `/api/trade/order` endpoint handling wallet deductions and transaction logging. Wire the `BuyActionWindow`.
- Files to create: `backend/models/Transaction.js`, `backend/routes/trade.js`.
- Files to modify: `frontend/src/dashboard/components/BuyActionWindow.js`.
- Depends on: Phase 4.

**Phase 6 — Portfolio & P&L**
- Goal: Calculate live P&L for Holdings by comparing average purchase price against live API price. Update the Summary and Holdings UI.
- Files to create: `backend/models/Holding.js`, `backend/routes/portfolio.js`.
- Files to modify: `frontend/src/dashboard/components/Holdings.js`, `frontend/src/dashboard/components/Summary.js`.
- Depends on: Phase 5.

**Phase 7 — Final Polish & Testing**
- Goal: Clean up missing images, verify end-to-end flows, and ensure UI consistency.
- Files to modify: Assorted frontend CSS and layout files.
- Depends on: Phase 6.

---

## 7. EXTERNAL API RECOMMENDATION

**Recommended Provider: Yahoo Finance (via `yahoo-finance2` npm package)**
- **Why**: It is completely free, does not require an API key, has no hard rate limits (within reason), and fully supports Indian stock tickers (NSE/BSE) using the `.NS` or `.BO` suffix (e.g., `RELIANCE.NS`, `TCS.NS`).
- **NPM Package**: `npm install yahoo-finance2` (install in backend).
- **Example Usage (Backend Proxy)**:
  ```javascript
  const yahooFinance = require('yahoo-finance2').default;
  // Get live quote
  const quote = await yahooFinance.quote('RELIANCE.NS'); 
  // Get historical data for charts
  const history = await yahooFinance.historical('RELIANCE.NS', { period1: '2023-01-01' });
  ```
- **Fallback**: Alpha Vantage (Free tier limits to 25 requests/day, which is too restrictive for a trading dashboard). Yahoo Finance is strongly preferred.

---

## 8. ENVIRONMENT VARIABLES NEEDED

**Backend (`backend/.env`)**
```env
# MongoDB Connection String
MONGO_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/stockly
# Express Server Port
PORT=3002
# Secret key for signing JSON Web Tokens
JWT_SECRET=super_secret_jwt_key_change_in_production
```

**Frontend (`frontend/.env`)**
```env
# URL for the backend API
REACT_APP_API_URL=http://localhost:3002/api
```

---

## 9. NOTES FOR FUTURE EXTENSIBILITY

- **Real Payments (Razorpay/Stripe)**: The current `User.walletBalance` is a simple number for the POC. To go live, integrate Razorpay to allow users to top-up their balance. Create a new `Deposit` schema to track real money top-ups.
- **WebSockets for Live Prices**: Polling the API every 10 seconds works for a POC. For production, the backend should connect to a live market data feed via WebSockets and broadcast price updates to connected React clients.
- **F&O / Options Trading**: The schemas are generic enough to handle this. You would just add a new `assetClass` enum to the `Transaction` schema (`EQUITY`, `OPTION`, `FUTURE`) and handle expiration dates.
- **Data Caching**: Wrapping the Yahoo Finance calls in a Redis cache on the backend will severely reduce latency and prevent IP bans from the provider.
