const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { executeTrade } = require('../controllers/tradeController');

router.use(authMiddleware);

// POST /api/trade/order
router.post('/order', executeTrade);

module.exports = router;
