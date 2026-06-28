import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar-glass">
      <div className="sidebar-brand">
        <span className="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </span>
        <span className="brand-name" style={{ color: '#000', WebkitTextFillColor: 'initial', fontWeight: 900 }}>Pennywise</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item-glass ${isActive ? 'active' : ''}`} end>
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
          </span>
          <span className="nav-label" style={{ fontWeight: 800 }}>Dashboard</span>
        </NavLink>

        <NavLink to="/transactions" className={({ isActive }) => `nav-item-glass ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
          <span className="nav-label" style={{ fontWeight: 800 }}>Transactions</span>
        </NavLink>

        <NavLink to="/analytics" className={({ isActive }) => `nav-item-glass ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
          </span>
          <span className="nav-label" style={{ fontWeight: 800 }}>Analytics</span>
        </NavLink>

        <NavLink to="/goals" className={({ isActive }) => `nav-item-glass ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </span>
          <span className="nav-label" style={{ fontWeight: 800 }}>Savings Goals</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="avatar-glass">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout-glass">
          <span className="logout-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span className="logout-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Navbar;