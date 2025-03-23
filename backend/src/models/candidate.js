const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Candidate;