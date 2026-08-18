const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth, authorizeRoles('admin'));
router.get('/dashboard', adminController.getDashboard);

module.exports = router;
