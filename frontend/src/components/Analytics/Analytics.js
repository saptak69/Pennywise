import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Analytics.css';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CATEGORY_COLORS = {
  food: '#c084fc',      // Neon Purple
  travel: '#06b6d4',    // Cyber Cyan
  shopping: '#ec4899',  // Neon Pink
  health: '#ff477e',    // Cyber Red
  bills: '#eab308',     // Electric Gold
  others: '#6366f1'     // Electric Indigo
};

const DEFAULT_COLOR = '#7c4ec2'; // Violet-Muted

function Analytics() {
  const { API_URL } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/analytics`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      showToast('Error loading analytics details', 'error');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="no-data-placeholder" style={{ minHeight: '60vh' }}>
        <div style={{ color: 'var(--accent-purple)', fontSize: '18px', fontWeight: 600 }}>Loading Analytics Charts...</div>
      </div>
    );
  }

  // Parse Doughnut data (Current month expenses by category)
  const categoryDataObj = data?.categoryData || {};
  const expenseCategories = Object.keys(categoryDataObj).filter(cat => categoryDataObj[cat].expense > 0);
  const expenseAmounts = expenseCategories.map(cat => categoryDataObj[cat].expense);
  const totalExpenseAmt = expenseAmounts.reduce((sum, val) => sum + val, 0);

  const doughnutColors = expenseCategories.map(cat => CATEGORY_COLORS[cat.toLowerCase()] || DEFAULT_COLOR);

  const doughnutData = {
    labels: expenseCategories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        data: expenseAmounts,
        backgroundColor: doughnutColors,
        borderColor: 'rgba(30, 41, 59, 0.8)',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = totalExpenseAmt > 0 ? ((val / totalExpenseAmt) * 100).toFixed(1) : 0;
            return ` ₹${val.toLocaleString('en-IN')} (${pct}%)`;
          }
        }
      }
    }
  };

  // Parse Bar data (Income vs Expense 6 Months Trend)
  const trendData = data?.monthlyTrend || [];
  const trendLabels = trendData.map(item => item.month);
  const trendIncome = trendData.map(item => item.income);
  const trendExpense = trendData.map(item => item.expense);

  const barData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Income',
        data: trendIncome,
        backgroundColor: 'rgba(16, 185, 129, 0.78)',
        borderColor: 'var(--accent-success)',
        borderWidth: 1.5,
        borderRadius: 4
      },
      {
        label: 'Expenses',
        data: trendExpense,
        backgroundColor: 'rgba(255, 71, 126, 0.78)',
        borderColor: 'var(--accent-danger)',
        borderWidth: 1.5,
        borderRadius: 4
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 12 }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#94a3b8', 
          font: { family: 'Outfit' },
          callback: (value) => '₹' + value.toLocaleString('en-IN')
        }
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="gradient-title" style={{ fontSize: '28px' }}>Analytics Deck</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Visual charts representing your spending patterns</p>
      </div>

      {expenseCategories.length > 0 || trendData.some(t => t.income > 0 || t.expense > 0) ? (
        <>
          <div className="analytics-layout-grid">
            {/* Category Share (Doughnut) */}
            <div className="chart-container-glass">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
                Category Shares
              </h3>
              {expenseCategories.length > 0 ? (
                <div className="chart-wrapper">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              ) : (
                <div style={{ padding: '60px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No expense records in this month to chart.
                </div>
              )}
            </div>

            {/* Income vs Expenses Trend (Bar) */}
            <div className="chart-container-glass">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                6-Month Cashflow
              </h3>
              <div className="chart-wrapper" style={{ height: '320px', maxHeigh: '320px' }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>

          {/* Details Table */}
          {expenseCategories.length > 0 && (
            <div className="category-shares-panel">
              <h3>Monthly Expense Details</h3>
              <div className="shares-table-wrapper">
                <table className="shares-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Expenses</th>
                      <th>Percentage Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseCategories.map(cat => {
                      const amount = categoryDataObj[cat].expense;
                      const share = totalExpenseAmt > 0 ? ((amount / totalExpenseAmt) * 100).toFixed(1) : 0;
                      const color = CATEGORY_COLORS[cat.toLowerCase()] || DEFAULT_COLOR;
                      
                      return (
                        <tr key={cat}>
                          <td>
                            <div className="category-cell">
                              <span className="category-indicator-dot" style={{ backgroundColor: color }}></span>
                              {cat}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{share}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="chart-container-glass" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Not enough data to render charts. Add income and expense logs to unlock analytics.</span>
        </div>
      )}
    </div>
  );
}

export default Analytics;