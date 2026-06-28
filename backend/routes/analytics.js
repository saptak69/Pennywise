const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/analytics
// @desc    Get user financial analytics and comparative insights
router.get('/', auth, async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    // Date references
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth(); // 0-indexed

    // Calculate previous month details safely
    const prevMonthDate = new Date();
    prevMonthDate.setDate(1); // avoid setMonth overflow
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonthNum = prevMonthDate.getMonth();

    // Group transactions by month
    const currentMonthTransactions = [];
    const prevMonthTransactions = [];

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth();

      if (tYear === currentYear && tMonth === currentMonthNum) {
        currentMonthTransactions.push(t);
      } else if (tYear === prevYear && tMonth === prevMonthNum) {
        prevMonthTransactions.push(t);
      }
    });

    // --- CURRENT MONTH CALCULATIONS ---
    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // --- PREVIOUS MONTH CALCULATIONS ---
    const prevIncome = prevMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const prevExpenses = prevMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const prevSavings = prevIncome - prevExpenses;
    const prevSavingsRate = prevIncome > 0 ? (prevSavings / prevIncome) * 100 : 0;

    // --- CATEGORY WISE BREAKDOWNS ---
    const categoryData = currentMonthTransactions.reduce((acc, t) => {
      const { category, type, amount } = t;
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0 };
      }
      acc[category][type] += amount;
      return acc;
    }, {});

    const prevCategoryData = prevMonthTransactions.reduce((acc, t) => {
      const { category, type, amount } = t;
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0 };
      }
      acc[category][type] += amount;
      return acc;
    }, {});

    // --- INSIGHTS GENERATION ---
    const insights = [];

    // Savings rate insight
    if (totalIncome > 0 && prevIncome > 0) {
      const diff = savingsRate - prevSavingsRate;
      if (diff > 2) {
        insights.push(`Savings rate improved by ${diff.toFixed(0)}% compared to last month.`);
      } else if (diff < -2) {
        insights.push(`Savings rate decreased by ${Math.abs(diff).toFixed(0)}% compared to last month.`);
      }
    }

    // Category comparative insights
    const allCategories = new Set([
      ...Object.keys(categoryData),
      ...Object.keys(prevCategoryData)
    ]);

    allCategories.forEach(category => {
      const currentSpent = categoryData[category]?.expense || 0;
      const prevSpent = prevCategoryData[category]?.expense || 0;

      if (currentSpent > 0 && prevSpent > 0) {
        const percentChange = ((currentSpent - prevSpent) / prevSpent) * 100;
        if (percentChange > 10) {
          insights.push(`You spent ${percentChange.toFixed(0)}% more on ${category.charAt(0).toUpperCase() + category.slice(1)} this month.`);
        } else if (percentChange < -10) {
          insights.push(`You saved ${Math.abs(percentChange).toFixed(0)}% on ${category.charAt(0).toUpperCase() + category.slice(1)} compared to last month.`);
        }
      } else if (currentSpent > 0 && prevSpent === 0) {
        insights.push(`New expense category this month: you spent ₹${currentSpent.toFixed(2)} on ${category.charAt(0).toUpperCase() + category.slice(1)}.`);
      }
    });

    if (insights.length === 0) {
      insights.push('Add transactions for consecutive months to generate comparative spending insights.');
    }

    // --- MONTHLY TREND DATA (LAST 6 MONTHS) ---
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1); // Set to day 1 to avoid overflow
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === date.getMonth() && 
               transDate.getFullYear() === date.getFullYear();
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTrend.push({
        month: monthLabel,
        income: monthIncome,
        expense: monthExpense
      });
    }

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        savings,
        savingsRate
      },
      categoryData,
      monthlyTrend,
      insights
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;