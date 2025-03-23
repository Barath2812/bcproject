const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432, // Ensure correct DB port
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Import Models
const User = require('./user')(sequelize);
const Election = require('./election')(sequelize);
const Candidate = require('./candidate')(sequelize);
const Vote = require('./vote')(sequelize);

// Define Relationships
Election.hasMany(Candidate, { foreignKey: 'electionId', onDelete: 'CASCADE' });
Candidate.belongsTo(Election, { foreignKey: 'electionId' });

Election.hasMany(Vote, { foreignKey: 'electionId', onDelete: 'CASCADE' });
Vote.belongsTo(Election, { foreignKey: 'electionId' });

User.hasMany(Vote, { foreignKey: 'userId', onDelete: 'CASCADE' });
Vote.belongsTo(User, { foreignKey: 'userId' });

Candidate.hasMany(Vote, { foreignKey: 'candidateId', onDelete: 'CASCADE' });
Vote.belongsTo(Candidate, { foreignKey: 'candidateId' });

// Export Models & Sequelize Connection
module.exports = {
  sequelize,
  User,
  Election,
  Candidate,
  Vote
};
