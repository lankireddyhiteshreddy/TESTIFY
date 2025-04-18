const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');
const Question = require('./questionsModel');

const Option = sequelize.define('Option',{
    option_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    question_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Question,
            key:'question_id'
        }
    },
    option_text:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    is_correct:{
        type:DataTypes.TINYINT,
        defaultValue:0
    }
},
{
    tableName:'options',
    timestamps:false
});

module.exports = Option;