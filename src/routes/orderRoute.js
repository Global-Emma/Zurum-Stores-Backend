const express = require('express');
const { createOrder, getOrders, deleteOrder, updateOrder } = require('../controllers/ordersControllers');
const checkUser = require('../middleware/authMiddleware');
const adminCheck = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/create-order', checkUser, createOrder)
router.get('/get-orders', checkUser, adminCheck, getOrders)
router.delete('/delete-order/:id', checkUser, adminCheck, deleteOrder)
router.put('/update-order', checkUser, adminCheck, updateOrder)


module.exports = router;