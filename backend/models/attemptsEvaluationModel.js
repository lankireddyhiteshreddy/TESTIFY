const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const AttemptEvaluation = sequelize.define('AttemptEvaluation', {
    evaluation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    detailed_analysis: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    tableName: 'attempt_evaluations',
    timestamps: false
});

module.exports = AttemptEvaluation;
