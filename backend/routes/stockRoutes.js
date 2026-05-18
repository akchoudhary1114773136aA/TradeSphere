const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getLiveQuote, getMarketWatch, getStockHistory } = require('../controllers/stockController');

// Apply authMiddleware to all routes in this router
router.use(authMiddleware);

// GET /api/stocks/quote/:symbol
router.get('/quote/:symbol', getLiveQuote);

// GET /api/stocks/market-watch
router.get('/market-watch', getMarketWatch);

// GET /api/stocks/history/:symbol
router.get('/history/:symbol', getStockHistory);

module.exports = router;
