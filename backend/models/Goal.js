const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0.01, 'Target amount must be greater than zero']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current savings amount cannot be negative']
  },
  deadline: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
