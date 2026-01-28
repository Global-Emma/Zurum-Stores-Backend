const express = require('express');
const { getAllCartItems, addItemToCart, updateCart, deleteCartItem, deleteAllCartItems } = require('../controllers/cartController');
const checkUser = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/all-cart', checkUser, getAllCartItems)
router.post('/add-to-cart', checkUser, addItemToCart)
router.put('/update-cart', checkUser, updateCart)
router.delete('/delete-cart-item/:id', checkUser, deleteCartItem)
router.delete('/delete-all', checkUser, deleteAllCartItems)

module.exports = router;