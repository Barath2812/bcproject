const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
  transactionHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'electionId']
    }
  ]
});

module.exports = Vote; 