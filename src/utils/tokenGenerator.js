const jwt = require('jsonwebtoken')
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto')

const accessTokenGenerator = (user) => {
  const accessToken = jwt.sign({
    username: user.username,
    userId: user._id,
    email: user.email,
    role: user.role
  }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  })

  return {accessToken}
}

const refreshTokenGenerator = async(user, res)=>{
  const refreshToken = crypto.randomBytes(40).toString('hex')
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7)


  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return {refreshToken}

}

module.exports = {
  accessTokenGenerator,
  refreshTokenGenerator
}
