const express = require('express');
const { createProducts, getAllProducts } = require('../controllers/productController.js');

const router = express.Router();

router.post('/add-product', createProducts);
router.get('/all-products', getAllProducts);

module.exports = router;