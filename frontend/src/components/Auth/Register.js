import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return showToast('Passwords do not match.', 'error');
    }

    if (formData.password.length < 6) {
      return showToast('Password must be at least 6 characters.', 'error');
    }

    setIsSubmitting(true);
    const success = await register(formData.name, formData.email, formData.password);
    setIsSubmitting(false);
    
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="pw-root auth-bg">
      <div className="pw-grid-bg"></div>
      <div className="pw-watermark">₹</div>
      <div className="auth-card-glass">
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <h1>Pennywise</h1>
        </div>
        <h2>Create your Account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="auth-form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="auth-form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Min. 6 characters"
              required
            />
          </div>
          <div className="auth-form-group">
            <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
            <input
              id="register-confirm"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Re-enter password"
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;