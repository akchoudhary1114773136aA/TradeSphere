const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    walletBalance: req.user.walletBalance
  });
});

module.exports = router;
