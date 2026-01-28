const adminCheck = (req, res, next)=>{
  const role = req.userInfo.role;
  if(role !== 'admin'){
    res.status(403).json({
      success: false,
      message: 'Only Admins Are Allowed'
    })
  }

  next()
}

module.exports = adminCheck