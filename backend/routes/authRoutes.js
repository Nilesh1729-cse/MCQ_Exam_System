const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { registerRules, loginRules } = require('../middleware/validators');

const router = express.Router();

router.post('/register', registerRules, authController.register);
router.post('/login', loginRules, authController.login);
router.get('/me', requireAuth, authController.me);

module.exports = router;
