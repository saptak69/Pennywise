const express = require('express');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/goals
// @desc    Get all user savings goals
router.get('/', auth, async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    next(error);
  }
});

// @route   POST api/goals
// @desc    Create a new savings goal
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount, deadline } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ message: 'Title and target amount are required' });
    }

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) {
      return res.status(400).json({ message: 'Target amount must be a positive number' });
    }

    const goal = new Goal({
      user: req.user.id,
      title,
      targetAmount: targetNum,
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline || null
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
});

// @route   PUT api/goals/:id
// @desc    Update a savings goal (e.g., add savings)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    const updates = { ...req.body };
    delete updates.user;
    delete updates._id;

    if (updates.targetAmount !== undefined) {
      const targetNum = parseFloat(updates.targetAmount);
      if (isNaN(targetNum) || targetNum <= 0) {
        return res.status(400).json({ message: 'Target amount must be a positive number' });
      }
      updates.targetAmount = targetNum;
    }

    if (updates.currentAmount !== undefined) {
      const currentNum = parseFloat(updates.currentAmount);
      if (isNaN(currentNum) || currentNum < 0) {
        return res.status(400).json({ message: 'Current savings amount cannot be negative' });
      }
      updates.currentAmount = currentNum;
    }

    Object.assign(goal, updates);
    await goal.save();

    res.json(goal);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE api/goals/:id
// @desc    Delete a savings goal
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
