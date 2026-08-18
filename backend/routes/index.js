/**
 * Central route aggregator. To add a new feature (e.g. "posts"):
 *   1. Create controllers/postsController.js
 *   2. Create routes/postsRoutes.js
 *   3. router.use('/posts', require('./postsRoutes'));
 * server.js never needs to change.
 */
const express = require('express');
const { testConnection } = require('../config/db');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/questions', require('./questionRoutes'));
router.use('/admin', require('./adminRoutes'));

// Lightweight health check the frontend uses to show live status,
// and a natural place to verify DB connectivity in one shot.
router.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'unreachable' });
  }
});

module.exports = router;
