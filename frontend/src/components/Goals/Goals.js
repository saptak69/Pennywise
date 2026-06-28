import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Goals.css';

function Goals() {
  const { API_URL } = useAuth();
  const { showToast } = useToast();
  
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Goal Form state
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Individual goal contribution input state mapping (goalId -> amountToAddString)
  const [contributions, setContributions] = useState({});

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/goals`);
      setGoals(response.data);
    } catch (error) {
      console.error('Failed to load goals:', error);
      showToast('Error loading savings goals', 'error');
    }
    setLoading(false);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/goals`, formData);
      showToast('Savings goal created successfully!', 'success');
      setFormData({
        title: '',
        targetAmount: '',
        currentAmount: '',
        deadline: ''
      });
      fetchGoals();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error creating savings goal';
      showToast(msg, 'error');
    }
    setIsSubmitting(false);
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await axios.delete(`${API_URL}/api/goals/${id}`);
      showToast('Savings goal deleted successfully', 'success');
      fetchGoals();
    } catch (error) {
      showToast('Failed to delete savings goal', 'error');
    }
  };

  const handleContributionChange = (goalId, val) => {
    setContributions(prev => ({
      ...prev,
      [goalId]: val
    }));
  };

  const handleAddSavings = async (goal) => {
    const amtString = contributions[goal._id];
    const amount = parseFloat(amtString);

    if (isNaN(amount) || amount <= 0) {
      return showToast('Please enter a valid savings amount to contribute', 'error');
    }

    try {
      const newAmount = goal.currentAmount + amount;
      await axios.put(`${API_URL}/api/goals/${goal._id}`, {
        currentAmount: newAmount
      });

      showToast(`Contributed ₹${amount.toLocaleString('en-IN')} to "${goal.title}"!`, 'success');
      
      // Clear specific contribution input field
      setContributions(prev => ({ ...prev, [goal._id]: '' }));
      fetchGoals();
    } catch (error) {
      showToast('Failed to add savings contribution', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 className="gradient-title" style={{ fontSize: '28px' }}>Savings Targets</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Track your progress towards long-term savings targets</p>
      </div>

      <div className="goals-layout-grid">
        {/* Left Side: Create form */}
        <div className="transaction-form-panel">
          <h3 style={{ textTransform: 'uppercase', fontWeight: 900 }}>START STACKING 💰</h3>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="goal-title">Piggy Bank Name</label>
              <input
                id="goal-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                className="form-input"
                placeholder="e.g. New Gaming Setup 🎮"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="goal-target">Target Bread (₹)</label>
              <input
                id="goal-target"
                type="number"
                name="targetAmount"
                step="0.01"
                value={formData.targetAmount}
                onChange={handleFormChange}
                className="form-input"
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="goal-current">Starting Bread (₹)</label>
              <input
                id="goal-current"
                type="number"
                name="currentAmount"
                step="0.01"
                value={formData.currentAmount}
                onChange={handleFormChange}
                className="form-input"
                placeholder="Bread you already have"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="goal-deadline">Deadline Date</label>
              <input
                id="goal-deadline"
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleFormChange}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Setting target...' : 'Secure target 🎯'}
            </button>
          </form>
        </div>

        {/* Right Side: Goals List */}
        <div className="transaction-list-panel">
          <h2 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase' }}>PIGGY BANKS 🐷</h2>

          {loading ? (
            <div className="no-data-placeholder">
              <div style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Loading goals...</div>
            </div>
          ) : goals.length > 0 ? (
            <div className="goals-list-grid">
              {goals.map(goal => {
                const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

                return (
                  <div key={goal._id} className="goal-card-glass">
                    <div>
                      <div className="goal-card-top">
                        <span className="goal-title-h3">{goal.title}</span>
                        <button onClick={() => handleDeleteGoal(goal._id)} className="btn-card-icon" title="Delete target">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>

                      <div className="goal-amounts-row">
                        <span>₹{goal.currentAmount.toLocaleString('en-IN')} Saved</span>
                        <span style={{ fontWeight: 600 }}>₹{goal.targetAmount.toLocaleString('en-IN')} Target</span>
                      </div>

                      <div className="goal-progress-bar-bg">
                        <div className="goal-progress-bar-fill" style={{ width: `${percent}%` }}></div>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        {remaining > 0 ? (
                          <span>₹{remaining.toLocaleString('en-IN')} left to secure the bag</span>
                        ) : (
                          <span className="text-success" style={{ color: '#22c55e', fontWeight: 900 }}>BAG SECURED! 🥳💸</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {goal.deadline && (
                        <div className="goal-deadline-badge" style={{ alignSelf: 'flex-start' }}>
                          Target Date: {new Date(goal.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                      
                      {remaining > 0 && (
                        <div className="goal-savings-actions">
                          <input
                            type="number"
                            placeholder="Add ₹"
                            value={contributions[goal._id] || ''}
                            onChange={(e) => handleContributionChange(goal._id, e.target.value)}
                            className="goal-add-input"
                            style={{ border: '2px solid #000', color: '#000' }}
                          />
                          <button onClick={() => handleAddSavings(goal)} className="btn-sm-primary" style={{ border: '2px solid #000', color: '#000' }}>Stack bread 💸</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-data-placeholder" style={{ padding: '60px 0' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8l-4 4h8l-4-4zM12 16l4-4H8l4 4z"></path>
              </svg>
              <span style={{ marginTop: '12px' }}>No active savings goals. Define your target above!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Goals;
