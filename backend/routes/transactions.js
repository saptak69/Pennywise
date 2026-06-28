const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/transactions
// @desc    Get user transactions with pagination, filters, search, and sorting
router.get('/', auth, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      category, 
      search, 
      sortBy = 'newest' 
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    // Filter criteria
    const filter = { user: req.user.id };
    
    if (type) {
      filter.type = type;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    // Sorting criteria
    let sortOptions = { date: -1 }; // Default newest first
    if (sortBy === 'oldest') {
      sortOptions = { date: 1 };
    } else if (sortBy === 'highest') {
      sortOptions = { amount: -1 };
    } else if (sortBy === 'lowest') {
      sortOptions = { amount: 1 };
    }

    const transactions = await Transaction.find(filter)
      .sort(sortOptions)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST api/transactions
// @desc    Create a transaction
router.post('/', auth, async (req, res, next) => {
  try {
    const { amount, type, category, description, date, isRecurring, recurringInterval } = req.body;

    if (!amount || !type || !category || !description) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const transaction = new Transaction({
      user: req.user.id,
      amount: amountNum,
      type,
      category,
      description,
      date: date || Date.now(),
      isRecurring: isRecurring || false,
      recurringInterval: recurringInterval || 'none'
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

// @route   PUT api/transactions/:id
// @desc    Update a transaction
router.put('/:id', auth, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    const updates = { ...req.body };
    // Prevent modifying read-only fields
    delete updates.user;
    delete updates._id;

    if (updates.amount !== undefined) {
      const amountNum = parseFloat(updates.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      updates.amount = amountNum;
    }

    Object.assign(transaction, updates);
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;