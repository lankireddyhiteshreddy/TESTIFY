const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const Response = sequelize.define('Response', {
  response_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  attempt_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  selected_options_ids: {
    type: DataTypes.JSON,
    allowNull: false,
    field: 'selected_options_ids'
  },
  is_correct: {
    type: DataTypes.TINYINT,
    allowNull: true
  }
}, {
  tableName: 'responses',
  timestamps: false
});

module.exports = Response;
