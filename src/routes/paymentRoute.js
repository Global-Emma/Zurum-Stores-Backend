const express = require('express');
const checkUser = require('../middleware/authMiddleware');
const { initializePayment, verifyPayment, paymentWebhook, callBack } = require('../controllers/paymentController');

const router = express.Router();

router.post('/initialize-payment', checkUser, initializePayment);
router.get('/verify-payment/:reference', checkUser, verifyPayment);
router.post('/payment-webhook', paymentWebhook);
router.get('/callback', callBack);


module.exports = router;