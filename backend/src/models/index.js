const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import model definitions
const User = require('./user');
const Election = require('./election');
const Candidate = require('./candidate');
const Vote = require('./vote');

// Define relationships
Election.hasMany(Candidate, { foreignKey: 'electionId', onDelete: 'CASCADE' });
Candidate.belongsTo(Election, { foreignKey: 'electionId' });

Election.hasMany(Vote, { foreignKey: 'electionId', onDelete: 'CASCADE' });
Vote.belongsTo(Election, { foreignKey: 'electionId' });

Candidate.hasMany(Vote, { foreignKey: 'candidateId', onDelete: 'CASCADE' });
Vote.belongsTo(Candidate, { foreignKey: 'candidateId' });

User.hasMany(Vote, { foreignKey: 'userId', onDelete: 'CASCADE' });
Vote.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Election,
  Candidate,
  Vote
};
