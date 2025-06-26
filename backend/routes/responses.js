const passport = require('passport');
const {submitTest} = require('../controllers/responsesController');
const express = require('express');

const router = express.Router();

router.post('/submit',passport.authenticate('jwt',{session:false}),submitTest);

module.exports = router;

