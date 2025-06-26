const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/db');

const Attempt = sequelize.define('Attempt', {
  attempt_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  test_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'attempts',
  timestamps: false
});

module.exports = Attempt;
