const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractABI: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'completed'),
      defaultValue: 'pending'
    }
  });

  return Election;
}; 