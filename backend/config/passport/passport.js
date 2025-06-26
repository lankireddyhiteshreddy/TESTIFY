const jwtStrategy = require('./jwtStrategy');
const googleStrategy = require('./googleStrategy');

module.exports = (passport) => {
  jwtStrategy(passport);
  googleStrategy(passport);
};
