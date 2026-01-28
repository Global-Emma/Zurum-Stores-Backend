require('dotenv').config();
const cookieParser = require('cookie-parser')
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const Redis = require('ioredis')
const productRoutes = require('./routes/productRoute');
const cartRoutes = require('./routes/cartRoute');
const deliveryRoutes = require('./routes/deliveryRoute');
const orderRoutes = require('./routes/orderRoute');
const userRoutes = require('./routes/userRoute');
const paymentRoutes = require('./routes/paymentRoute');
const adminRoutes = require('./routes/adminRoute');
const errorHandler = require('./middleware/errorHandler');
const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const passport = require('passport');
require('./utils/passport')

// Apply rate limiting to all requests

const app = express();

mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log('MongoDB connected Successfully'))
.catch((err) => console.log('MongoDB connection failed:', err));

// connect to redis
const redisClient = new Redis(process.env.REDIS_URL)

redisClient.on('connect', ()=>{
  console.log('Connection To Redis Successfull')
})

redisClient.on('error', (err)=>{
  console.error('Error Connecting To Redis', err)
})


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());
app.use(cookieParser())
app.use(passport.initialize())
app.use(helmet());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res)=>{
    console.error('Too many requests from this IP, please try again later.' + req.ip)
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    })
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  })
});

app.use('/api/users/sign-in', limiter);

app.use('/api/products', (req, res, next)=>{
  req.redisClient = redisClient;
  next()
}, productRoutes);
app.use('/api/cart', (req, res, next)=>{
  req.redisClient = redisClient;
  next()
}, cartRoutes);
app.use('/api/delivery', (req, res, next)=>{
  req.redisClient = redisClient;
  next()
}, deliveryRoutes);
app.use('/api/orders', (req, res, next)=>{
  req.redisClient = redisClient;
  next()
}, orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 3000;

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});