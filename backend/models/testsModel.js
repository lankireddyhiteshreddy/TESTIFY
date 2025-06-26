const {DataTypes, DATEONLY} = require('sequelize');
const {sequelize} = require('../config/db');

const Test = sequelize.define('Test',{
    test_id : {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    creator_id : {
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    is_public:{
        type:DataTypes.TINYINT,
        defaultValue:0
    },
    test_duration:{
        type:DataTypes.INTEGER,
        allowNull:false,
        comment:'Duration in minutes'
    },
    answer_key_uploaded:{
        type:DataTypes.TINYINT,
        defaultValue:0
    },
    is_complete:{
        type:DataTypes.TINYINT,
        defaultValue:0
    }
},
{
    tableName:'tests',
    timestamps:false
});

module.exports = Test;