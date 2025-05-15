const {createTest} = require('../contollers/testController.js');
const passport = require('../config/passport');
const express = require('express');
const app = express();

const router = express.Router();

//create test
router.post('/createTest',passport.authenticate('jwt',{session:false}),createTest);

module.exports = router;

