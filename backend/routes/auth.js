const {register,login,logout} = require('../controllers/authController');
const express = require('express');
const app = express();

const router = express.Router();

//register
router.post('/register',register);

//login
router.post('/login',login);

//logout
router.post('/logout',logout);


module.exports = router;