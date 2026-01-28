const Order = require('../models/Orders');
const Cart = require('../models/Cart');
const Product = require('../models/Products');
const Users = require('../models/Users');
const { inValidateCache } = require('../utils/validation');

const createOrder = async (req, res) => {
  try {
    const userId = req.userInfo.userId
    const cartitems = await Cart.find({ userId }).lean()
    const orderItems = cartitems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      deliveryOptionsId: item.deliveryOptionsId
    }));

    const newOrder = new Order({
      userId,
      orderItem: orderItems
    });

    await newOrder.save();

    await Users.findByIdAndUpdate(userId,
      { $push: { orderIds: newOrder._id } },
      { new: true })

    await inValidateCache(req.redisClient, `cartItems:${userId}`);
    await inValidateCache(req.redisClient, `allOrders`);

    res.status(201).json({
      success: true,
      message: 'Order Created Successfully',
      data: newOrder
    });

  } catch (error) {
    console.log('Error Occurred While Creating Order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

const getOrders = async (req, res) => {
  try {

    const cacheKey = `allOrders`;
    const cachedOrders = await req.redisClient.get(cacheKey);

    if (cachedOrders) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedOrders),
      });
    }

    const orders = await Order.find({}).populate('userId').populate('orderItem.productId');

    const totalOrders = await Order.countDocuments();

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(orders, totalOrders));

    return res.status(200).json({
      success: true,
      message: 'Orders Fetched Successfully',
      data: orders,
      totalOrders
    });
  } catch (error) {
    console.log('Error Occurred While getting Order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params
    const deletedOrder = await Order.findByIdAndDelete(id)
    if (!deletedOrder) {
      return res.status(400).json({
        success: false,
        message: 'Error Occured While Deleting Order'
      })
    }

    await inValidateCache(req.redisClient, `allOrders`);

    res.status(201).json({
      success: true,
      message: 'Order Deleted SuccessFully'
    })
  } catch (error) {
    console.log('Error Occurred While deleting Order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

const updateOrder = async (req, res) => {
  try {
    const { id } = req.body;

    await Order.findByIdAndUpdate(id, 
      { $set: { status: 'confirmed', paymentStatus: 'PAID' } }, { new: true });

    await inValidateCache(req.redisClient, `allOrders`);
    
      res.status(200).json({
        success: true,
        message: 'Order Updated Successfully'
      })
  } catch (error) {
    console.log('Error Occurred While updating Order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

module.exports = {
  createOrder,
  getOrders,
  deleteOrder,
  updateOrder 
}
