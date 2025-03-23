const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Election, Candidate, Vote, User } = require('../models');
const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Middleware to check if user has voted
const hasNotVoted = async (req, res, next) => {
  try {
    const vote = await Vote.findOne({
      where: {
        electionId: req.params.electionId,
        userId: req.user.id
      }
    });

    if (vote) {
      return res.status(400).json({ error: 'You have already voted in this election' });
    }

    next();
  } catch (error) {
    logger.error('Error checking vote status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Cast vote
router.post('/elections/:electionId/candidates/:candidateId',
  hasNotVoted,
  [
    body('transactionHash').notEmpty().withMessage('Transaction hash is required')
  ],
  async (req, res) => {
    try {
      const { electionId, candidateId } = req.params;
      const { transactionHash } = req.body;

      // Verify election exists and is active
      const election = await Election.findByPk(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.status !== 'active') {
        return res.status(400).json({ error: 'Election is not active' });
      }

      // Verify candidate exists
      const candidate = await Candidate.findOne({
        where: {
          id: candidateId,
          electionId
        }
      });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Verify transaction on blockchain
      const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_NETWORK);
      const tx = await provider.getTransaction(transactionHash);
      
      if (!tx) {
        return res.status(400).json({ error: 'Invalid transaction hash' });
      }

      // Create vote record
      const vote = await Vote.create({
        electionId,
        candidateId,
        userId: req.user.id,
        transactionHash
      });

      logger.info(`Vote cast: ${vote.id} for election ${electionId}`);
      res.status(201).json(vote);
    } catch (error) {
      logger.error('Error casting vote:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get user's voting history
router.get('/history', async (req, res) => {
  try {
    const votes = await Vote.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Election,
          attributes: ['title', 'startDate', 'endDate', 'status']
        },
        {
          model: Candidate,
          attributes: ['name']
        }
      ]
    });

    res.json(votes);
  } catch (error) {
    logger.error('Error fetching voting history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vote statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Vote.findAll({
      attributes: [
        'electionId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalVotes']
      ],
      group: ['electionId'],
      include: [
        {
          model: Election,
          attributes: ['title']
        }
      ]
    });

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching vote statistics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 