const Cart = require('../models/Cart');
const Product = require('../models/Products');
const Users = require('../models/Users');
const { inValidateCache } = require('../utils/validation');

const addItemToCart = async (req, res) => {
  try {
    const userId = req.userInfo.userId
    const { productId, quantity, deliveryOptionsId } = req.body;
    // Try to find an existing cart item for this user+product
    const existingCartItem = await Cart.findOne({ userId, productId });

    if (existingCartItem) {
      // Update quantity on existing cart item
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res.status(200).json({
        success: true,
        message: 'Cart item quantity updated successfully',
        data: existingCartItem
      });
    }

    // No existing item for this product: create a new cart document
    const newCartItem = new Cart({
      userId,
      productId,
      quantity,
      deliveryOptionsId,
    });

    await newCartItem.save();
    await Users.findByIdAndUpdate(userId,
      { $push: { cartIds: newCartItem._id } },
      { new: true });

      await inValidateCache(req.redisClient, `cartItems:${userId}`);

    return res.status(201).json({
      success: true,
      message: 'Cart item added successfully',
      data: newCartItem
    });
    

  } catch (error) {
  console.error('Error adding item to cart:', error);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error....please Check your Internet Connection And Try Again'
  })
}
}

const getAllCartItems = async (req, res) => {
  try {

    const cacheKey = `cartItems:${req.userInfo.userId}`;
    const cachedCartItems = await req.redisClient.get(cacheKey);

    if (cachedCartItems) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedCartItems)
      });
    }

    const cartItems = await Cart.find().populate('productId');

    if (!cartItems) {
      return res.status(404).json({
        success: false,
        message: 'Error Getting Cart Items'
      });
    }

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(cartItems));

    return res.status(200).json({
      success: true,
      data: cartItems
    });

  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

const updateCart = async (req, res) => {
  try {
    const { cartId, optionId } = req.body;
    const updatedCartItem = await Cart.findByIdAndUpdate(cartId, { deliveryOptionsId: optionId }, { new: true });
    if (!updatedCartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart Item Not Found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Cart Item Updated Successfully',
      data: updatedCartItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.userInfo.userId
    const { id } = req.params;
    const existingCartItem = await Cart.findOne({ _id: id, userId });
    if (existingCartItem.quantity > 1) {
      existingCartItem.quantity -= 1;
      await existingCartItem.save();
      return res.status(200).json({
        success: true,
        message: 'Cart item quantity decreased by 1',
        data: existingCartItem
      });
    } else {
      const deletedCartItem = await Cart.findOneAndDelete({_id: id, userId});
      if (!deletedCartItem) {
        return res.status(404).json({
          success: false,
          message: 'Cart Item Not Found'
        });
      }
      res.status(200).json({
        success: true,
        message: 'Cart Item Deleted Successfully',
        data: deletedCartItem
      });
    }
  } catch (error) {
    console.error('Error Deleting cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

const deleteAllCartItems = async (req, res) => {
  try {
    const userId = req.userInfo.userId
    const result = await Cart.deleteMany({ userId });
    await Users.findByIdAndUpdate(userId, 
      { $pull: { cartIds: { $in: result.deletedCount > 0 ? await Cart.find({ userId }).select('_id') : [] } } });
    res.status(200).json({
      success: true,
      message: 'All cart items of User deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting all cart items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

module.exports = {
  addItemToCart,
  getAllCartItems,
  updateCart,
  deleteCartItem,
  deleteAllCartItems
};