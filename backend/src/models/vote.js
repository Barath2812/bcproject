const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vote = sequelize.define('Vote', {
    transactionHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return Vote;
}; 