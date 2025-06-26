const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../../models/userModel');
require('dotenv').config();

const cookieExtractor = req => req.cookies.token;

const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findByPk(jwt_payload.user_id);
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
