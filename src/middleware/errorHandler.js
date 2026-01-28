const errorHandler = (err, req, res, next) => {
  console.error('Global Error Occured:', err.stack);
  return res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Global Internal Server Error....please Check your Internet Connection And Try Again'
  });
}

module.exports = errorHandler;