const Cart = require('../models/Cart');
const Admin = require('../models/AdminOrders')
const Product = require('../models/Products');
const Users = require('../models/Users');

const addAdminOrder = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const cartItems = await Cart.find({})
    const cartItem = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      deliveryOptionsId: item.deliveryOptionsId
    }));

    const { total } = req.body;

    if (!userId || !cartItem || !total) {
      return res.status(401).json({
        success: false,
        message: 'Orders Not Found'
      });
    }

    const newOrder = await Admin.create({
      userId,
      productIds: cartItem || [],
      totalPrice: total
    })

    if(!newOrder){
      return res.status(404).json({
        success: false,
        message: 'Error Occurred Creating Files'
      })
    }

    res.status(200).json({
      success: true,
      message: 'New Order Added Successfully',
      data: newOrder
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again Occured'
    })
  }
}

const getOrders = async (req, res)=>{
  try {
    const allOrders = await Admin.find({}).populate('productIds.productId').populate('userId')
    if(!allOrders){
      return res.status(401).json({
        success: false,
        message: 'Error Occured While Getting Admin Orders'
      })
    }

    res.status(200).json({
      success: true,
      message: 'All Orders Successfully',
      data: allOrders
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again Occured'
    })
  }
}

module.exports = {
  addAdminOrder,
  getOrders
}