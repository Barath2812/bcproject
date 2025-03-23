const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Election = sequelize.define('Election', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed'),
    defaultValue: 'pending',
    allowNull: false
  },
  contractAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contractABI: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Election; 