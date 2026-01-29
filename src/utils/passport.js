const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Users = require('../models/Users')

// Google Auth Login
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth not configured: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.');
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },

      async (accessToken, refreshToken, profile, done) => {
        try {

          // FIND USER IN MONGO
          let existingUser = await Users.findOne({ email: profile.emails[0].value });

          if (existingUser && !existingUser.googleId) {
            return done(null, false, { message: 'Email already registered. Please sign in normally' });
          }

          if (!existingUser) {
            const names = profile.displayName.split(' ')
            existingUser = await Users.create({
              googleId: profile.id,
              username: names[0],
              firstname: names[0],
              lastname: names[1],
              email: profile.emails[0].value,
              cartIds: [],
              orderIds: [],
              password: 'google_auth'
            });
          }

          return done(null, existingUser)
        } catch (error) {
          return done(error, null)
        }

      })
  )
}

module.exports = passport