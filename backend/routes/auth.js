const {register,login,logout,googleAuth,googleCallback,verifyEmail,authCheck} = require('../controllers/authController');
const express = require('express');
const app = express();

const router = express.Router();

//register
router.post('/register',register);

//login
router.post('/login',login);

//logout
router.post('/logout',logout);

//Google OAuth
router.get('/google',googleAuth);
router.get('/google/callback',googleCallback);

//verify email
router.get('/verify-email', verifyEmail);

//auth check (to check if user is authorized)
router.get('/me',authCheck);


module.exports = router;