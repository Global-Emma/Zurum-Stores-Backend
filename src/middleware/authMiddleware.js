const jwt = require('jsonwebtoken')

const checkUser = async(req, res, next)=>{
  try {
    const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token){
    return res.status(400).json({
      status: false,
      message: 'No Token Provided'
    })
  }

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

  if(!decodedToken){
    return res.status(400).json({
      status: false,
      message: 'Incorrect Token'
    })
  }


  req.userInfo = decodedToken

  next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'JWT Expired'
    })
  }
}

module.exports = checkUser