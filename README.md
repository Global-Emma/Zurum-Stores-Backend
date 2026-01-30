# ⚙️ Zurum Stores – Backend API

**This repository contains the backend API for Zurum Stores, a fully live, production-grade e-commerce platform.**

**The backend handles authentication, authorization (RBAC), payments, orders, caching, rate limiting, and database operations. It powers the live frontend application deployed separately.**

---

# 🔗 Live & Related Links

* **Frontend App (Vercel):** https://zurum-stores-frontend.vercel.app
* **Frontend Repository:** https://github.com/Global-Emma/zurum-stores-frontend

---

# ✨ Features
* Authentication & Security
* Email & password authentication
* Google OAuth login
* JWT authentication via HTTP-only cookies
* Secure logout & password change
* Role-Based Access Control (RBAC)
* User and Admin roles
* Admin-only protected routes
* Role enforcement middleware
* Admin Features
* Product management (create, update, delete)
* Order management & lifecycle updates
* User management
* Orders & Payments
* Order creation & tracking
* Paystack payment verification
* Orders finalized only after successful payment
* Performance & Security
* Redis caching for frequently accessed data
* Rate limiting with Redis
* Environment-variable-based secrets
* Secure CORS configuration

---

# 🧱 Tech Stack

Node.js
Express.js
MongoDB + Mongoose
Redis (Redis Cloud)
JWT
ioredis
express-rate-limit

---

# 📁 Project Structure

```
backend/
src/
├── controllers/
├── routes/
├── models/
├── middlewares/
├── utils/
├── server.js
└── package.json
```

# 🚀 Deployment

* Hosted on Render
* Auto-deploys on GitHub push
* Scales independently from frontend

---

# 🧪 Testing

* API tested using Postman
* OAuth login verified in production
* Redis connectivity verified  
* Payment flow tested via Paystack

---

👨‍💻 Author

**Glory Emmanuel**
*FullStack Developer*
