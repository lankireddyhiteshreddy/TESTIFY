const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const register = async(req,res)=>{
    const {user_name,password,email} = req.body;
    try{
        const isUserExisting = await User.findOne({where : {user_name}});
        if(isUserExisting) return res.json({message : "The user already exists"});

        const hashed = await bcrypt.hash(password,12); //used to hash password ,, the number specifies the intensity of hashing the higher the number the more time it takes for hashing
        const user = await User.create({user_name,email,password:hashed});

        res.json({message : 'User created', user_id : user.user_id});
    }
    catch(e){
        res.json({error : e.message});
    }
};

const login = async(req,res)=>{
    const {user_name,password} = req.body;
    try{
        const user = await User.findOne({where : {user_name}});
        if(!user) return res.json({message : "Invalid username or password"}); 
        const isValid = await bcrypt.compare(password,user.password);
        if(!isValid) return res.json({message : "Invalid username or password"});

        const token = jwt.sign({id : user.user_id, name : user.user_name},process.env.JWT_SECRET,{expiresIn:'1h'});
        res.json({token});
    }
    catch(e){
        res.json({error : e.message});
    }
}

module.exports = {register,login};