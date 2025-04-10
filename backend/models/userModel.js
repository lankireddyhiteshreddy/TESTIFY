const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User',{
    user_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    user_name:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
        validate:{
            isEmail:true //checks if the email is in correct format , built in validator funciton in validator.js
        }
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    }
},
{
    tableName:'users',
    timestamps:false
});

module.exports = User;
