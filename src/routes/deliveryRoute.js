const express = require('express');
const { addDeliveryOption, getAllDeliveryOptions, deleteDeliveryOption } = require('../controllers/deliveryController');
const checkUser = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add-delivery', addDeliveryOption)
router.get('/all-delivery-options', checkUser, getAllDeliveryOptions)
router.delete('/delete-delivery/:id', deleteDeliveryOption)

module.exports = router;