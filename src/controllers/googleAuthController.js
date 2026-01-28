const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Google Auth Login
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },

      async (profile, done) => {
        try {
          // 🔥 FIND USER IN MONGO

          let existingUser = await Users.findOne({ email: profile.emails[0].value });

          if (existingUser && !existingUser.googleId) {
            return res.status(400).json({
              success: false,
              message: 'Email already registered. Please sign in normally'
            });
          }

          if (!existingUser) {
            existingUser = await Users.create({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              cartIds: [],
              orderIds: [],
              password: 'google_auth'
            });
          }

          done(null, existingUser)
        } catch (error) {
          done(error, null)
        }

      }))