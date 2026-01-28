const DeliveryOptions = require('../models/DeliveryOptions')

const deliveryOptions = [
  {
    id: '1',
    deliveryDuration: 7,
    priceCents: 0
  },
  {
    id: '2',
    deliveryDuration: 3,
    priceCents: 499
  },
  {
    id: '3',
    deliveryDuration: 1,
    priceCents: 999
  },
  {
    id: '4',
    deliveryDuration: 0,
    priceCents: 1500
  }
]

const addDeliveryOption = async (req, res) => {
  try {
    const addOptions = DeliveryOptions.insertMany(deliveryOptions);
    
    res.status(201).json({
      success: true,
      message: 'Delivery Options Added Successfully',
      data: addOptions
    });
  } catch (error) {
    console.error('Error Adding Delivery Items:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
};

const getAllDeliveryOptions = async (req, res) => {
  try {
    const userId = req.userInfo.userId
    const cacheKey = `cartDeliveryOptions:${userId}`;

    const cachedDelivery = await req.redisClient.get(cacheKey)

    if(cachedDelivery){
      return res.status(200).json({
      success: true,
      data: JSON.parse(cachedDelivery)
      })
    }

    const options = await DeliveryOptions.find(); 
    if(!options){
      return res.status(404).json({
        success: false,
        message: 'No delivery options found'
      });
    }

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(options))
    
    res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error fetching delivery options:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

const deleteDeliveryOption = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOption = await DeliveryOptions.findByIdAndDelete(id);
    if (!deletedOption) {
      return res.status(404).json({
        success: false,
        message: 'Delivery option not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Delivery option deleted successfully',
      data: deletedOption
    });
  } catch (error) {
    console.error('Error deleting delivery option:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
};

module.exports = {
  addDeliveryOption,
  getAllDeliveryOptions,
  deleteDeliveryOption
}