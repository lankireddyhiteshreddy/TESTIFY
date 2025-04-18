const {Strategy : JwtStrategy, ExtractJwt} = require('passport-jwt');
const User = require('../models/userModel');
const passport = require('passport');
const cookieExtractor = req => req.cookies.token;
require('dotenv').config();

const opts = {
    jwtFromRequest: cookieExtractor, // this tell passport to use cookies
    secretOrKey: process.env.JWT_SECRET
};

module.exports = (passport)=>{
    passport.use(
        new JwtStrategy(opts,async(jwt_payload,done)=>{
            try{
                const user = await User.findByPk(jwt_payload.id);
                if(user) return done(null,user);
                return done(null,false);
            }
            catch(e){
                return done(e,false);
            }
        })
    );
};