const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Candidate = sequelize.define('Candidate', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    blockchainIndex: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  return Candidate;
};