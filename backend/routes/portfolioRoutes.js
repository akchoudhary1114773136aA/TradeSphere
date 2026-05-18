const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getHoldings, getTransactionHistory } = require('../controllers/portfolioController');

router.use(authMiddleware);

// GET /api/portfolio/holdings
router.get('/holdings', getHoldings);

// GET /api/portfolio/history
router.get('/history', getTransactionHistory);

module.exports = router;
