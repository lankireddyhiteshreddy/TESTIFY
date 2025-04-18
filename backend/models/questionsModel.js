const {DataTypes} = require('sequelize');
const sequelize = require('../config/db');
const Test = require('./testsModel');

const Question = sequelize.define('Question',{
    question_id : {
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    test_id : {
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Test,
            key:'test_id'
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
    },
    question_text:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    image_url:{
        type:DataTypes.STRING
    },
    marks:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    negative_marks:{
        type:DataTypes.INTEGER
    }
},
{
    tableName:'questions',
    timestamps:false
});

module.exports = Question;