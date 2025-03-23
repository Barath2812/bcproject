const express = require('express');
const cors = require('cors');
const Web3 = require('web3');
const dotenv = require('dotenv');
const authRouter = require('./routes/auth');
const sequelize = require('./config/database');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);

const startServer = async () => {
    try {
        // Sync database
        await sequelize.sync();
        console.info('Database models synchronized');

        // Initialize Web3
        const web3 = new Web3(process.env.BLOCKCHAIN_PROVIDER_URL);
        
        const port = process.env.PORT || 3001;
        app.listen(port, () => {
            console.info(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();