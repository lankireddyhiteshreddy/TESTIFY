const express = require('express');
const passport = require('passport');
const router = express.Router();
const {deregister} = require('../controllers/authController');

router.get('/dashboard',passport.authenticate('jwt',{session:false}),async(req,res)=>{
    try{
        res.json({message : "You are authorized ", user : req.user});
    }
    catch(e){
        res.json({message : "You are not authorized"});
    }
});

//de-register
router.delete('/deregister',passport.authenticate('jwt',{session:false}),deregister);

module.exports = router;