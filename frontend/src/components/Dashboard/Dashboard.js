import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Dashboard.css';

export function getCategoryIcon(category, type) {
  const getTablerIconClass = (catName, txType) => {
    if (txType === 'income') return 'ti-arrow-down-left';
    const cat = catName.toLowerCase();
    if (cat.includes('food') || cat.includes('restaurant') || cat.includes('drink') || cat.includes('biryani') || cat.includes('zomato') || cat.includes('salad')) return 'ti-salad';
    if (cat.includes('shop') || cat.includes('fashion') || cat.includes('zara') || cat.includes('clothes') || cat.includes('bag')) return 'ti-shopping-bag';
    if (cat.includes('travel') || cat.includes('transport') || cat.includes('cab') || cat.includes('uber') || cat.includes('fuel') || cat.includes('car')) return 'ti-car';
    if (cat.includes('health') || cat.includes('medical') || cat.includes('doctor') || cat.includes('medicine') || cat.includes('fit')) return 'ti-heartbeat';
    if (cat.includes('bill') || cat.includes('utilities') || cat.includes('phone') || cat.includes('recharge') || cat.includes('internet') || cat.includes('mobile')) return 'ti-device-mobile';
    if (cat.includes('investment') || cat.includes('sip') || cat.includes('zerodha') || cat.includes('mutual') || cat.includes('line')) return 'ti-chart-line';
    return 'ti-cash';
  };

  return (
    <i className={`ti ${getTablerIconClass(category, type)}`} aria-hidden="true"></i>
  );
}

function Dashboard() {
  const { user, updateBudget, API_URL } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  
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
      const [analyticsRes, transactionsRes, goalsRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics`),
        axios.get(`${API_URL}/api/transactions?limit=5`),
        axios.get(`${API_URL}/api/goals`)
      ]);
      setAnalytics(analyticsRes.data);
      setRecentTransactions(transactionsRes.data.transactions);
      setGoals(goalsRes.data);
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

  if (loading) {
    return (
      <div className="no-data-placeholder" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#c8ff00', fontSize: '18px', fontWeight: 600 }}>Loading Dashboard...</div>
      </div>
    );
  }

  const { totalIncome = 0, totalExpenses = 0, savings = 0, savingsRate = 0 } = analytics?.summary || {};
  const budgetLimit = user?.monthlyBudget || 0;

  // Budget calculations
  const categoryDataObj = analytics?.categoryData || {};
  const categoryBudgetLimits = {
    food: 10000,
    shopping: 5000,
    travel: 4000,
    bills: 8000,
    others: 10000
  };
  
  // Scale category budgets based on user's total budget limit
  const totalDefaultBudget = 37000;
  const budgetScale = budgetLimit > 0 ? (budgetLimit / totalDefaultBudget) : 1;
  
  const budgetsList = Object.keys(categoryBudgetLimits).map(cat => {
    const expense = categoryDataObj[cat]?.expense || 0;
    const limit = Math.round(categoryBudgetLimits[cat] * budgetScale);
    const percent = limit > 0 ? Math.min((expense / limit) * 100, 100) : 0;
    
    let fillClass = '';
    if (percent >= 100) fillClass = 'danger';
    else if (percent >= 80) fillClass = 'warn';
    
    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      spent: expense,
      limit: limit,
      percent: percent,
      fillClass: fillClass
    };
  });

  // Calculate cashflow SVG points based on actual trend data
  const trendData = analytics?.monthlyTrend || [];
  const maxFlow = trendData.length > 0 
    ? Math.max(...trendData.map(item => Math.max(item.income, item.expense)), 10000) 
    : 10000;

  const getPoints = (type) => {
    return trendData.map((item, idx) => {
      const val = type === 'income' ? item.income : item.expense;
      const x = Math.round(idx * (560 / Math.max(trendData.length - 1, 1)));
      const y = Math.round(110 - (val / maxFlow) * 85);
      return { x, y };
    });
  };

  const incPoints = getPoints('income');
  const expPoints = getPoints('expense');

  const incLineD = incPoints.length > 0 ? `M${incPoints.map(p => `${p.x},${p.y}`).join(' L')}` : '';
  const incAreaD = incPoints.length > 0 ? `M0,120 L${incPoints.map(p => `${p.x},${p.y}`).join(' L')} L560,120 Z` : '';
  
  const expLineD = expPoints.length > 0 ? `M${expPoints.map(p => `${p.x},${p.y}`).join(' L')}` : '';
  const expAreaD = expPoints.length > 0 ? `M0,120 L${expPoints.map(p => `${p.x},${p.y}`).join(' L')} L560,120 Z` : '';


  return (
    <>
      <main className="pw-main">
        <div className="pw-eyebrow">Net worth — {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
        <div className="pw-hero-amount">₹{savings.toLocaleString('en-IN')}</div>
        <div className="pw-hero-sub">Updated just now &nbsp;·&nbsp; <span>{savings >= 0 ? '+' : ''}₹{savings.toLocaleString('en-IN')} this month</span></div>

        <div className="pw-stats-row">
          <div className="pw-stat">
            <div className="pw-stat-label">Income</div>
            <div className="pw-stat-val green">₹{totalIncome.toLocaleString('en-IN')}</div>
            <div className="pw-stat-delta up">
              {savingsRate >= 0 ? `↑ ${savingsRate.toFixed(1)}% save rate` : 'Tracked inflows'}
            </div>
          </div>
          <div className="pw-stat">
            <div className="pw-stat-label">Expenses</div>
            <div className="pw-stat-val red">₹{totalExpenses.toLocaleString('en-IN')}</div>
            <div className="pw-stat-delta dn">
              {budgetLimit > 0 ? `${(totalExpenses / budgetLimit * 100).toFixed(0)}% budget limit` : 'Tracked outflows'}
            </div>
          </div>
          <div className="pw-stat">
            <div className="pw-stat-label">Saved</div>
            <div className="pw-stat-val">₹{savings.toLocaleString('en-IN')}</div>
            <div className="pw-stat-delta up">
              {savingsRate >= 0 ? `${savingsRate.toFixed(0)}% save rate` : '0% save rate'}
            </div>
          </div>
        </div>

        <div className="pw-section-head">
          <div className="pw-section-title">Cashflow</div>
          <div className="pw-section-action">6 months ↗</div>
        </div>
        <div className="pw-chart-area">
          <div className="pw-chart-label">
            <span className="hi">↑ ₹{(maxFlow/1000).toFixed(0)}K</span>
            <span className="lo">↓ 0K</span>
          </div>
          <svg className="pw-chart-svg" viewBox="0 0 560 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" role="img" aria-label="Six month cashflow chart">
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8FF00" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="#C8FF00" stopOpacity="0"/>
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF2B2B" stopOpacity="0.12"/>
                <stop offset="100%" stopColor="#FF2B2B" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {trendData.length > 0 ? (
              <>
                <path d={incAreaD} fill="url(#incGrad)"/>
                <path d={incLineD} fill="none" stroke="#C8FF00" strokeWidth="1.5"/>
                <path d={expAreaD} fill="url(#expGrad)"/>
                <path d={expLineD} fill="none" stroke="#FF2B2B" strokeWidth="1" strokeDasharray="3,3"/>
              </>
            ) : null}
            <line x1="0" y1="110" x2="560" y2="110" stroke="rgba(240,240,232,0.06)" strokeWidth="1"/>
            <line x1="0" y1="80" x2="560" y2="80" stroke="rgba(240,240,232,0.04)" strokeWidth="1"/>
            <line x1="0" y1="50" x2="560" y2="50" stroke="rgba(240,240,232,0.04)" strokeWidth="1"/>
          </svg>
          <div className="pw-chart-months">
            {trendData.length > 0 ? (
              trendData.map((item, idx) => <span key={idx}>{item.month}</span>)
            ) : (
              <>
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              </>
            )}
          </div>
        </div>

        <div className="pw-section-head">
          <div className="pw-section-title">Recent</div>
          <Link to="/transactions" className="pw-section-action">All transactions ↗</Link>
        </div>
        <div className="pw-txn-list">
          {recentTransactions.map(t => {
            const isOut = t.type === 'expense';
            return (
              <div key={t._id} className="pw-txn">
                <div className="pw-txn-icon">
                  {getCategoryIcon(t.category, t.type)}
                </div>
                <div>
                  <div className="pw-txn-name">{t.description}</div>
                  <div className="pw-txn-cat">{t.category}</div>
                </div>
                <div>
                  <div className={`pw-txn-amt ${isOut ? 'out' : 'inn'}`}>
                    {isOut ? '−' : '+'}₹{t.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="pw-txn-date">
                    {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, {new Date(t.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          {recentTransactions.length === 0 && (
            <div style={{ color: '#444', fontStyle: 'italic', padding: '16px 0', fontSize: '13px' }}>
              No transactions recorded yet.
            </div>
          )}
        </div>
      </main>

      <aside className="pw-right">
        <div className="pw-section-title" style={{ marginBottom: '20px' }}>Budgets</div>

        {budgetsList.map((b, idx) => (
          <div key={idx} className="pw-budget-item">
            <div className="pw-budget-top">
              <div className="pw-budget-name">{b.name}</div>
              <div className="pw-budget-nums">
                <span>₹{b.spent.toLocaleString('en-IN')}</span> / ₹{b.limit.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="pw-bar-bg">
              <div className={`pw-bar-fill ${b.fillClass}`} style={{ width: `${b.percent}%` }}></div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '24px', padding: '16px', background: '#111', border: '1px solid rgba(240,240,232,0.06)' }}>
          <div className="pw-budget-name" style={{ marginBottom: '8px', fontSize: '10px' }}>Total Limit</div>
          {isEditingBudget ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="budget-input-glass"
                style={{ width: '100%', padding: '6px', background: '#0A0A0A', border: '1px solid #2A2A2A', color: '#FFF' }}
              />
              <button onClick={handleSaveBudget} className="btn-sm-primary" style={{ padding: '6px 12px' }}>Save</button>
              <button onClick={() => setIsEditingBudget(false)} className="btn-sm-secondary" style={{ padding: '6px 12px' }}>X</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="pw-budget-nums" style={{ fontSize: '14px', color: '#C8FF00' }}>
                ₹{budgetLimit ? budgetLimit.toLocaleString('en-IN') : 'None'}
              </span>
              <span onClick={() => setIsEditingBudget(true)} style={{ color: '#C8FF00', fontSize: '10px', textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '1px' }}>
                Adjust ↗
              </span>
            </div>
          )}
        </div>

        <div className="pw-sidebar-divider" style={{ margin: '24px 0' }}></div>

        <div className="pw-section-title" style={{ marginBottom: '16px' }}>Goals</div>

        {goals.slice(0, 3).map(goal => {
          const percent = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
          return (
            <div key={goal._id} className="pw-goal-card">
              <div className="pw-goal-title">{goal.title}</div>
              <div className="pw-goal-sub">Target — ₹{goal.targetAmount.toLocaleString('en-IN')}</div>
              <div className="pw-goal-progress">{percent}%</div>
              <div className="pw-bar-bg"><div className="pw-bar-fill" style={{ width: `${percent}%` }}></div></div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="pw-goal-sub" style={{ color: '#444', fontStyle: 'italic', marginBottom: '16px' }}>
            No savings goals.
          </div>
        )}

        <button className="pw-add-btn" onClick={() => navigate('/goals')}>
          <i className="ti ti-plus" aria-hidden="true"></i> New goal ↗
        </button>
      </aside>
    </>
  );
}

export default Dashboard;