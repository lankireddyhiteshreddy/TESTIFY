  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const User = require('../../models/userModel');
  const passport = require('passport'); 
  require('dotenv').config();

  module.exports = (passport) => {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"  // <-- Make sure this matches your route exactly
    },
    async function(accessToken, refreshToken, profile, done) {
    try {
      const email = profile.emails[0].value;

      // Check if user already exists
      const user = await User.findOne({ where: { email } });

      if (!user) {
        // User not found → reject login with message
        return done(null, false, { message: 'Email not registered. Please register first.' });
      }

      // User exists → proceed
      return done(null, user);

    } catch (err) {
      return done(err, false);
    }
  }));
  };
