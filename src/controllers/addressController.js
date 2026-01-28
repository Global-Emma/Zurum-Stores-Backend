const Address = require("../models/Address");
const Users = require("../models/Users");

const createAddress = async(req, res) => {
  try {
    const { street, city, state, country, postalCode } = req.body;
    const userId = req.userInfo.userId; // from auth middleware

    const address = await Address.create({
      userId, // from auth middleware
      street,
      city,
      state,
      country,
      postalCode,
    });  

    await Users.findByIdAndUpdate(userId,
      {address: address._id},
      {new: true}
    )

    res.status(201).json({
      success: true,
      message: 'Address Created Successfully',
      data: address
    })
  } catch (error) {
    console.log('Error Occurred While Creating Address:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

module.exports = {
  createAddress
}