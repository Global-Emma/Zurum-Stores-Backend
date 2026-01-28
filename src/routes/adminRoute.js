const express = require('express');
const checkUser = require('../middleware/authMiddleware');
const adminCheck = require('../middleware/adminMiddleware');
const { getOrders, addAdminOrder } = require('../controllers/adminController');

const router = express.Router();

router.post('/admin-order', checkUser, adminCheck, addAdminOrder)
router.get('/get-admin-orders', checkUser, adminCheck, getOrders)


module.exports = router;