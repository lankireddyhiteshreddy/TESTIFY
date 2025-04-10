const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/dashboard',passport.authenticate('jwt',{session:false}),(req,res)=>{
    res.json({message : "You are authorized ", user : req.user});
});

module.exports = router;