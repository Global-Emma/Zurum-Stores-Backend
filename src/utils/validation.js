const joi = require('joi')

const validateSignUp = (data)=>{
  const schema = joi.object({
    firstname: joi.string().min(3).max(50).required(),
    lastname: joi.string().min(3).max(50).required(),
    phone: joi.number().min(11).required(),
    username: joi.string().min(3).max(50).required(),
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).required(),
    role: joi.string().min(4)
  })

  return schema.validate(data)
}

const validateSignIn = (data)=>{
  const schema = joi.object({
    username: joi.string().min(3).max(50).required(),
    password: joi.string().min(8).required()
  })

  return schema.validate(data)
}

const validatePasswordChange = (data)=>{
  const schema = joi.object({
    currentPassword: joi.string().min(8).required(),
    newPassword: joi.string().min(8).required()
  })

  return schema.validate(data)
}

const inValidateCache = async (redisClient, key)=>{
  try {
    await redisClient.del(key)
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
}

module.exports = {
  inValidateCache,
  validateSignIn,
  validateSignUp,
  validatePasswordChange
}