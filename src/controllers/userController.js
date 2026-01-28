const RefreshToken = require('../models/RefreshToken');
const Users = require('../models/Users');
const Cart = require('../models/Cart')
const Product = require('../models/Products')
const { refreshTokenGenerator, accessTokenGenerator } = require('../utils/tokenGenerator');
const { validateSignUp, validateSignIn, validatePasswordChange } = require('../utils/validation');
const argon2  = require('argon2');

const userSignUp = async (req, res) => {
  try {

    const { error } = validateSignUp(req.body);

    if (error) {
      console.log('Validation Error Occured', error.details[0].message)
      return res.status(401)({
        success: false,
        message: error.details[0].message
      })
    }

    const { firstname, lastname, phone, username, email, password } = req.body;


    if (!username && email) {
      return res.status(401).json({
        success: false,
        message: 'No UserName Provided'
      })
    }

    const existingUser = await Users.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Already Existing User.. please Sign In To Continue"
      })

    }

    const newUser = await Users.create({
      firstname,
      lastname,
      phone,
      username,
      email,
      password,
      cartIds: [],
      orderIds: []
    })

    res.status(200).json({
      success: true,
      message: 'New User Signed Up SuccessFully',
      data: newUser
    })

  } catch (error) {
    console.log('error occured during User Sign Up', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    })
  }
}

const userSignIn = async (req, res) => {
  try {

    const { error } = validateSignIn(req.body);

    if (error) {
      console.log('Validation Error Occured', error.details[0].message)
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { username, password } = req.body;
    if (!username) {
      return res.status(401).json({
        success: false,
        message: 'No Username Or Password Provided'
      })
    }

    const existingUser = await Users.findOne({ username });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not Found...Please SignUp to Continue"
      })
    }

    const checkPassword = await existingUser.comparePassword(password)

    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect Password... Please TryAgain'
      })
    }

    await refreshTokenGenerator(existingUser, res)
    const { accessToken } = accessTokenGenerator(existingUser)

    res.status(200).json({
      success: true,
      message: 'User Signed In SuccessFully',
      accessToken,
      userDetails: existingUser

    })

  } catch (error) {
    console.log('error occured during User Sign In', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    })
  }
}

// Google Auth CallBack

const googleAuthCallBack = async (req, res) => {
  try {
    const user = req.user || req.existingUser;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found from Google"
      });
    }
    await refreshTokenGenerator(user, res);
    const { accessToken } = accessTokenGenerator(user);
    return res.redirect(`http://localhost:5173/google-success?token=${accessToken}`);
  } catch (error) {
    console.log("Error occured during Google login", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error....please Check your Internet Connection And Try Again Occured"
    });
  }
}

const changePassword = async(req,res)=>{
  try {

    const {error} = validatePasswordChange(req.body)

    if (error) {
      console.log('Validation Error Occured', error.details[0].message)
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }

    const {currentPassword, newPassword} = req.body;

    const existingUser = await Users.findById(req.userInfo.userId)

    if(!existingUser){
      return res.status(400).json({
        success: false,
        message: 'User Not Found'
      })
    }

    const verifyPassword = await existingUser.comparePassword(currentPassword)

    if(!verifyPassword){
      return res.status(401).json({
        success: false,
        message: 'Current Password is Incorrect...Please enter The Correct Password'
      })
    }

    const isSamePassword = await existingUser.comparePassword(newPassword)

     if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password"
      });
    }

    existingUser.password = newPassword

    await existingUser.save()

    return res.status(200).json({
      success: true,
      message: 'Password Changed Successfully'
    })
    
  } catch (error) {
    console.log("Error occured during Password Change", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error....please Check your Internet Connection And Try Again Occured"
    });
  }
}

const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh Token Not Found in Cookie'
      })
    }

    const existingRefreshToken = await RefreshToken.findOne({ token: refreshToken })
    if (!existingRefreshToken || existingRefreshToken.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Refresh Token Expired... Please Login To Continue'
      })
    }

    // Find User With Refresh Token
    const existingUser = await Users.findById(existingRefreshToken.user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User with Refresh Token Not Found'
      })
    }

    // Create New Access Token
    const { accessToken: newAccessToken } = accessTokenGenerator(existingUser)

    return res.status(200).json({
      success: true,
      message: 'New Access Token Created Successfully',
      accessToken: newAccessToken,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again Occured'
    })
  }
}

const userLogOut = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Please Login First'
      })
    }

    const deletedToken = await RefreshToken.findOneAndDelete({ token: refreshToken });

    if (!deletedToken) {
      return res.status(404).json({
        success: false,
        message: 'Error Occured During Logout'
      })
    }

    res.status(200).json({
      success: true,
      message: 'User Logged Out Successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again Occured'
    })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await Users.find({}).populate({
      path: 'cartIds',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    }).populate({
      path: 'orderIds',
      populate: {
        path: 'orderItem.productId',
        model: 'Product'
      }
    }).populate('address').exec()
    if (!allUsers) {
      return res.status(401).json({
        success: false,
        message: 'Error Occured While Getting All Users'
      })
    }

    const filter = allUsers.filter(user => user.role === 'user');
    const totalUsers = filter.length;
    res.status(200).json({
      success: true,
      message: 'All users gotten Successfully',
      data: allUsers,
      noOfUsers: totalUsers
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again Occured'
    })
  }
}

const getDetailsFromUser = async (req, res) => {
  try {
    const userId = req.userInfo.userId
    const allUsers = await Users.findById(userId).populate({
      path: 'cartIds',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    }).populate({
      path: 'orderIds',
      populate: {
        path: 'orderItem.productId',
        model: 'Product'
      }
    }).populate('address').exec()
    if (!allUsers) {
      return res.status(401).json({
        success: false,
        message: 'Error Occured While Getting User Cart'
      })
    }

    res.status(200).json({
      success: true,
      message: 'All users cart gotten Successfully',
      data: allUsers
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again Occured'
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const deletedUser = await Users.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'Error Occured While Deleting User'
      })
    }

    res.status(200).json({
      success: true,
      message: 'User Deleted Successfully'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again Occured'
    })
  }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.userInfo.userId;
    const updatedUser = await Users.findByIdAndUpdate(userId, req.body, { new: true });
    res.status(200).json({
      success: true,
      message: 'User Updated Successfully',
      data: updatedUser
    })
  } catch (error) {
    console.log('Error Occured While Updating User:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error....please Check your Internet Connection And Try Again'
    });
  }
}

module.exports = {
  userSignIn,
  userSignUp,
  refreshTokenController,
  getAllUsers,
  userLogOut,
  getDetailsFromUser,
  deleteUser,
  updateUser,
  googleAuthCallBack,
  changePassword
}