const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

// @route   POST api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
router.get('/me', auth, async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        monthlyBudget: req.user.monthlyBudget
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT api/auth/budget
// @desc    Update user's monthly budget goal
router.put('/budget', auth, async (req, res, next) => {
  try {
    const { budget } = req.body;

    if (budget === undefined || budget === null) {
      // Clear budget
      const user = await User.findById(req.user.id);
      user.monthlyBudget = undefined;
      await user.save();
      return res.json({ monthlyBudget: undefined });
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      return res.status(400).json({ message: 'Budget must be a valid positive number' });
    }

    const user = await User.findById(req.user.id);
    user.monthlyBudget = budgetNum;
    await user.save();

    res.json({ monthlyBudget: user.monthlyBudget });
  } catch (error) {
    next(error);
  }
});

module.exports = router;