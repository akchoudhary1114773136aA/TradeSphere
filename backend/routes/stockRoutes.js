const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getLiveQuote, getMarketWatch, getStockHistory } = require('../controllers/stockController');

// NOTE: make these stock endpoints public so the landing page can fetch
// market data without requiring a logged-in user. If you want to protect
// them later, apply `authMiddleware` per-route instead of for the whole router.

// GET /api/stocks/quote/:symbol
router.get('/quote/:symbol', getLiveQuote);

// GET /api/stocks/market-watch
router.get('/market-watch', getMarketWatch);

// GET /api/stocks/history/:symbol
router.get('/history/:symbol', getStockHistory);

module.exports = router;
