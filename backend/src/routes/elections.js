const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { Election, Candidate, Vote } = require('../models');
const { ethers } = require('ethers');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// Create new election
router.post('/',
  isAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('candidates').isArray().withMessage('Candidates must be an array')
  ],
  async (req, res) => {
    try {
      const { title, description, startDate, endDate, candidates } = req.body;

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      // Create election in database
      const election = await Election.create({
        title,
        description,
        startDate: start,
        endDate: end,
        status: 'pending'
      });

      // Add candidates
      for (const candidate of candidates) {
        await Candidate.create({
          name: candidate.name,
          description: candidate.description,
          electionId: election.id,
          blockchainIndex: candidate.blockchainIndex
        });
      }

      logger.info(`Election created: ${election.id}`);
      res.status(201).json(election);
    } catch (error) {
      logger.error('Error creating election:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.findAll({
      include: [{
        model: Candidate,
        attributes: ['id', 'name', 'description', 'blockchainIndex']
      }]
    });
    res.json(elections);
  } catch (error) {
    logger.error('Error fetching elections:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get election by ID
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id, {
      include: [{
        model: Candidate,
        attributes: ['id', 'name', 'description', 'blockchainIndex']
      }]
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    res.json(election);
  } catch (error) {
    logger.error('Error fetching election:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update election
router.put('/:id',
  isAdmin,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('status').optional().isIn(['pending', 'active', 'completed']).withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const election = await Election.findByPk(req.params.id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const updates = req.body;
      if (updates.startDate) updates.startDate = new Date(updates.startDate);
      if (updates.endDate) updates.endDate = new Date(updates.endDate);

      await election.update(updates);
      logger.info(`Election updated: ${election.id}`);
      res.json(election);
    } catch (error) {
      logger.error('Error updating election:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete election
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    await election.destroy();
    logger.info(`Election deleted: ${req.params.id}`);
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    logger.error('Error deleting election:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add candidate to election
router.post('/:id/candidates',
  isAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional(),
    body('blockchainIndex').isInt().withMessage('Blockchain index must be an integer')
  ],
  async (req, res) => {
    try {
      const election = await Election.findByPk(req.params.id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const candidate = await Candidate.create({
        ...req.body,
        electionId: election.id
      });

      logger.info(`Candidate added to election ${election.id}: ${candidate.id}`);
      res.status(201).json(candidate);
    } catch (error) {
      logger.error('Error adding candidate:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get election results
router.get('/:id/results', async (req, res) => {
  try {
    const election = await Election.findByPk(req.params.id, {
      include: [{
        model: Candidate,
        include: [{
          model: Vote,
          attributes: ['id']
        }]
      }]
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const results = election.Candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      description: candidate.description,
      voteCount: candidate.Votes.length
    }));

    res.json(results);
  } catch (error) {
    logger.error('Error fetching election results:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active elections
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const elections = await Election.findAll({
      where: {
        status: 'active',
        startDate: {
          [Op.lte]: now
        },
        endDate: {
          [Op.gt]: now
        }
      },
      include: [{
        model: Candidate,
        attributes: ['id', 'name', 'description', 'blockchainIndex']
      }]
    });
    res.json(elections);
  } catch (error) {
    logger.error('Error fetching active elections:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 