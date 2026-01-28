const express = require('express');
const passport = require('passport')
const { 
  userSignUp, 
  userSignIn, 
  refreshTokenController, 
  getAllUsers, 
  userLogOut, 
  getDetailsFromUser, 
  updateUser, 
  googleAuthCallBack, 
  changePassword
} = require('../controllers/userController');
const checkUser = require('../middleware/authMiddleware');
const adminCheck = require('../middleware/adminMiddleware');
const { createAddress } = require('../controllers/addressController');

const router = express.Router();

router.post('/sign-up', userSignUp)
router.post('/sign-in', userSignIn)
router.post('/refresh', refreshTokenController)
router.post('/logout', checkUser, userLogOut)
router.get('/all-users', checkUser, adminCheck, getAllUsers)
router.get('/get-user-details', checkUser,  getDetailsFromUser)
router.post('/address', checkUser,  createAddress)
router.put('/update-user', checkUser,  updateUser)
router.post('/change-password', checkUser, changePassword)

// Google Authentication
router.get('/google-login', passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/google-callback", passport.authenticate("google", { session: false }), googleAuthCallBack)

module.exports = router;