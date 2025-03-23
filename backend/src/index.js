const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes');
const logger = require('./utils/logger');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET is not defined in environment variables.');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes
app.use('/api/auth', authRoutes);

// Public election routes
app.get('/api/elections/active', electionRoutes);

// Protected election routes
app.use('/api/elections', authenticateToken, electionRoutes);
app.use('/api/votes', authenticateToken, voteRoutes);

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync database models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('Database models synchronized');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();