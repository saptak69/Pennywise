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

  // Calculate Financial Vitality Index (FVI)
  const calculateFVI = () => {
    let score = 0;
    // 1. Savings rate contribution (max 40 pts)
    score += Math.min(Math.max(savingsRate, 0) * 1.0, 40);
    // 2. Budget adherence (max 40 pts)
    if (budgetLimit > 0) {
      const unusedPercent = Math.max(0, 100 - budgetPercent);
      score += (unusedPercent / 100) * 40;
    } else {
      score += 20; // Default if no budget limit is set
    }
    // 3. Savings buffer (max 20 pts)
    if (savings > 0) {
      score += 20;
    } else if (totalIncome > 0) {
      score += 5;
    }
    return Math.round(score);
  };
  
  const fvi = calculateFVI();
  let fviStatus = 'Stable';
  let fviColor = 'var(--accent-blue)';
  if (fvi >= 75) { fviStatus = 'Thriving'; fviColor = 'var(--accent-success)'; }
  else if (fvi >= 50) { fviStatus = 'Healthy'; fviColor = 'var(--accent-purple)'; }
  else if (fvi >= 25) { fviStatus = 'Caution'; fviColor = 'var(--accent-warning)'; }
  else { fviStatus = 'Vulnerable'; fviColor = 'var(--accent-danger)'; }

  const runwayMonths = totalExpenses > 0 ? Math.max(savings / totalExpenses, 0) : (savings > 0 ? 12 : 0);
  const runwayDays = Math.round(runwayMonths * 30.4);

  // Reservoir visual calculations relative to peak flow
  const maxFlow = Math.max(totalIncome, totalExpenses, 1);
  const inflowPercent = (totalIncome / maxFlow) * 100;
  const outflowPercent = (totalExpenses / maxFlow) * 100;

  return (
    <div>
      <div className="dashboard-title-area">
        <div>
          <h1 className="gradient-title">Financial Core Deck</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Welcome back, {user?.name}. Your financial core dashboard is active.</p>
        </div>
        <span className="deck-timestamp">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Immersive Bento Grid Section */}
      <div className="bento-grid-dashboard">
        {/* Vitality Score Bento Widget */}
        <div className="bento-card fvi-widget">
          <div className="widget-header">
            <h3>Financial Vitality</h3>
            <span className="badge-fvi" style={{ backgroundColor: `${fviColor}18`, color: fviColor }}>{fviStatus}</span>
          </div>
          <div className="fvi-dial-container">
            <svg className="fvi-svg" viewBox="0 0 100 100">
              <circle className="fvi-track" cx="50" cy="50" r="40" />
              <circle 
                className="fvi-fill" 
                cx="50" 
                cy="50" 
                r="40" 
                stroke={fviColor}
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * fvi) / 100}
              />
              <text x="50" y="56" className="fvi-text">{fvi}%</text>
            </svg>
          </div>
          <div className="fvi-footer">
            <p>Reflects budget discipline and savings velocity.</p>
          </div>
        </div>

        {/* Runway Clock Bento Widget */}
        <div className="bento-card runway-widget">
          <div className="widget-header">
            <h3>Cashflow Runway</h3>
            <span className="runway-icon-label">Time Buffer</span>
          </div>
          <div className="runway-timer">
            <div className="timer-number">{runwayDays}</div>
            <div className="timer-unit">DAYS</div>
          </div>
          <div className="runway-footer">
            <p>
              {runwayMonths > 0 
                ? `Estimated survival of ~${runwayMonths.toFixed(1)} months if all income streams stop today.`
                : "Add savings or reduce expenses to initialize runway calculation."}
            </p>
          </div>
        </div>

        {/* Wealth flow reservoir widget */}
        <div className="bento-card flow-reservoir-widget">
          <div className="widget-header">
            <h3>Reservoir Cashflow</h3>
            <span className="flow-balance-ratio">
              {savingsRate >= 0 ? '+' : ''}{savingsRate.toFixed(0)}% Saved
            </span>
          </div>
          <div className="reservoir-visual">
            <div className="reservoir-bar income-bar">
              <span className="bar-label">INFLOW</span>
              <span className="bar-val">₹{Math.round(totalIncome).toLocaleString('en-IN')}</span>
              <div className="bar-fill-glow" style={{ height: `${inflowPercent}%` }}></div>
            </div>
            
            <div className="reservoir-center">
              <div className="reservoir-core" style={{ animationPlayState: savings > 0 ? 'running' : 'paused' }}>
                <div className="core-waves"></div>
              </div>
              <span className="core-label">SAVINGS</span>
              <span className="core-val">₹{Math.round(savings).toLocaleString('en-IN')}</span>
            </div>
            
            <div className="reservoir-bar expense-bar">
              <span className="bar-label">OUTFLOW</span>
              <span className="bar-val">₹{Math.round(totalExpenses).toLocaleString('en-IN')}</span>
              <div className="bar-fill-glow" style={{ height: `${outflowPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Core / Space Budget fuel gauge */}
      <div className="budget-card-glass budget-reactor-widget">
        <div className="budget-card-header reactor-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--accent-warning)' }}>
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            Monthly Budget Limit
          </h2>
          <div className="budget-actions">
            {isEditingBudget ? (
              <>
                <input
                  type="number"
                  placeholder="Limit (₹)"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(e.target.value)}
                  className="budget-input-glass"
                />
                <button onClick={handleSaveBudget} className="btn-sm-primary">Engage</button>
                {budgetLimit && <button onClick={handleClearBudget} className="btn-sm-secondary" style={{ color: 'var(--accent-danger)' }}>Clear</button>}
                <button onClick={() => setIsEditingBudget(false)} className="btn-sm-secondary">Cancel</button>
              </>
            ) : (
              <button onClick={() => setIsEditingBudget(true)} className="btn-sm-secondary">
                {budgetLimit ? 'Adjust Budget Limit' : 'Initialize Budget Limit'}
              </button>
            )}
          </div>
        </div>

        {budgetLimit ? (
          <div className="reactor-body">
            <div className="reactor-display">
              <div className="reactor-metrics">
                <div className="metric">
                  <span className="label">CONSUMED BUDGET</span>
                  <span className="val">₹{totalExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div className="metric align-right">
                  <span className="label">ALLOCATED CAPACITY</span>
                  <span className="val">₹{budgetLimit.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="reactor-meter-container">
                <div className="reactor-meter-track">
                  <div 
                    className={`reactor-meter-fill ${budgetFillClass}`}
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                  >
                    <div className="reactor-pulse-glow"></div>
                  </div>
                </div>
                <span className="reactor-percent">{budgetPercent.toFixed(0)}%</span>
              </div>
            </div>

            <div className="reactor-status-msg">
              {isBudgetExceeded ? (
                <span className="status-critical">⚠️ Critical Alert: Budget overloaded by ₹{(totalExpenses - budgetLimit).toLocaleString('en-IN')}!</span>
              ) : budgetPercent >= 80 ? (
                <span className="status-warning">⚡ Pacing Alert: Spending capacity has reached {budgetPercent.toFixed(0)}%.</span>
              ) : (
                <span className="status-stable">🟢 Status Stable: Operating within containment limit. Remaining capacity: ₹{(budgetLimit - totalExpenses).toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="reactor-empty">
            <p>Budget Core Offline. Set a monthly budget goal to power up core indicators.</p>
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
              <span>No transactions recorded yet. Add your first record in the Transactions tab.</span>
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