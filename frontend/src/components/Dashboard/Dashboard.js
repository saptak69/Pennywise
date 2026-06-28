import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Dashboard.css';

// SVG Category Icons mapping helper
export function getCategoryIcon(category, type) {
  const cleanCat = category.toLowerCase();
  
  if (type === 'income') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <polyline points="19 12 12 19 5 12"></polyline>
      </svg>
    );
  }

  switch (cleanCat) {
    case 'food':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      );
    case 'travel':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12" y2="18.01"></line>
        </svg>
      );
    case 'shopping':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      );
    case 'health':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
        </svg>
      );
    case 'bills':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      );
  }
}

function Dashboard() {
  const { user, updateBudget, API_URL } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  // Budget modification states
  const [budgetVal, setBudgetVal] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics`),
        axios.get(`${API_URL}/api/transactions?limit=5`)
      ]);
      setAnalytics(analyticsRes.data);
      setRecentTransactions(transactionsRes.data.transactions);
      if (user?.monthlyBudget) {
        setBudgetVal(user.monthlyBudget.toString());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    }
    setLoading(false);
  };

  const handleSaveBudget = async () => {
    const parsed = parseFloat(budgetVal);
    if (isNaN(parsed) || parsed < 0) {
      return showToast('Please enter a valid positive number', 'error');
    }
    const success = await updateBudget(parsed);
    if (success) {
      setIsEditingBudget(false);
      fetchDashboardData(); // Reload analytics for budget progress percentages
    }
  };

  const handleClearBudget = async () => {
    const success = await updateBudget(null);
    if (success) {
      setBudgetVal('');
      setIsEditingBudget(false);
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="no-data-placeholder" style={{ minHeight: '60vh' }}>
        <div style={{ color: 'var(--accent-purple)', fontSize: '18px', fontWeight: 600 }}>Loading Dashboard...</div>
      </div>
    );
  }

  const { totalIncome = 0, totalExpenses = 0, savings = 0, savingsRate = 0 } = analytics?.summary || {};

  // Budget calculations
  const budgetLimit = user?.monthlyBudget;
  const budgetPercent = budgetLimit > 0 ? (totalExpenses / budgetLimit) * 100 : 0;
  const isBudgetExceeded = totalExpenses > budgetLimit;
  
  let budgetFillClass = 'safe';
  if (budgetPercent >= 100) {
    budgetFillClass = 'exceeded';
  } else if (budgetPercent >= 80) {
    budgetFillClass = 'warning';
  }

  return (
    <div>
      <div className="dashboard-title-area">
        <div>
          <h1>Overview</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Welcome back to Pennywise, {user?.name}!</p>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Summary Stat Cards */}
      <div className="summary-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper income">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Monthly Income</span>
            <span className="stat-value">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper expense">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Monthly Expenses</span>
            <span className="stat-value">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper savings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Monthly Savings</span>
            <span className="stat-value">₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper rate">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Savings Rate</span>
            <span className="stat-value">{savingsRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Budget Limit Tracker */}
      <div className="budget-card-glass">
        <div className="budget-card-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
              <line x1="12" y1="4" x2="12" y2="20"></line>
            </svg>
            Monthly Budget Goal
          </h2>

          <div className="budget-actions">
            {isEditingBudget ? (
              <>
                <input
                  type="number"
                  placeholder="Enter Limit (₹)"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(e.target.value)}
                  className="budget-input-glass"
                />
                <button onClick={handleSaveBudget} className="btn-sm-primary">Save</button>
                {budgetLimit && <button onClick={handleClearBudget} className="btn-sm-secondary" style={{ color: 'var(--accent-danger)' }}>Clear</button>}
                <button onClick={() => setIsEditingBudget(false)} className="btn-sm-secondary">Cancel</button>
              </>
            ) : (
              <button onClick={() => setIsEditingBudget(true)} className="btn-sm-secondary">
                {budgetLimit ? 'Modify Limit' : 'Set Budget Limit'}
              </button>
            )}
          </div>
        </div>

        {budgetLimit ? (
          <div>
            <div className="budget-info-row">
              <span>Expenses: ₹{totalExpenses.toLocaleString('en-IN')} / ₹{budgetLimit.toLocaleString('en-IN')}</span>
              <span>{budgetPercent.toFixed(0)}% Used</span>
            </div>
            
            <div className="budget-progress-bg">
              <div 
                className={`budget-progress-fill ${budgetFillClass}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              ></div>
            </div>

            <div className="budget-status-row">
              {isBudgetExceeded ? (
                <span className="text-danger">Alert: You have exceeded your budget by ₹{(totalExpenses - budgetLimit).toLocaleString('en-IN')}!</span>
              ) : budgetPercent >= 80 ? (
                <span className="text-warning">Warning: You have used {budgetPercent.toFixed(0)}% of your monthly budget.</span>
              ) : (
                <span className="text-success">Good job! You have ₹{(budgetLimit - totalExpenses).toLocaleString('en-IN')} remaining of your budget limit.</span>
              )}
            </div>
          </div>
        ) : (
          <div className="no-budget-prompt" style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
            No monthly budget goal set. Set a budget limit to track your spending progress actively.
          </div>
        )}
      </div>

      {/* Main Grid: Recent Transactions + Spending Insights */}
      <div className="dashboard-grid">
        <div className="section-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Recent Transactions</h2>
            <Link to="/transactions" style={{ fontSize: '13px', color: 'var(--accent-purple)', fontWeight: 600 }}>View All</Link>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="recent-list">
              {recentTransactions.map((t) => (
                <div key={t._id} className="recent-item">
                  <div className="item-left">
                    <div className={`item-icon-circle ${t.type}`}>
                      {getCategoryIcon(t.category, t.type)}
                    </div>
                    <div className="item-details">
                      <span className="item-desc">{t.description}</span>
                      <span className="item-cat">{t.category}</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <span className={`item-amount ${t.type}`}>
                      {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="item-date">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>No transactions recorded yet. Add your first transaction in the Transactions tab.</span>
            </div>
          )}
        </div>

        <div className="section-glass">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            Spending Insights
          </h2>

          {analytics?.insights && analytics.insights.length > 0 ? (
            <div className="insights-list">
              {analytics.insights.map((insight, idx) => (
                <div key={idx} className="insight-bubble">
                  <span className="insight-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </span>
                  <span className="insight-text">{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Not enough transaction history to generate insights yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;