import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="pw-sidebar">
      <div className="pw-sidebar-label">Accounts</div>
      <NavLink to="/" className={({ isActive }) => `pw-sidebar-item ${isActive ? 'active' : ''}`} end>
        <i className="ti ti-layout-dashboard" aria-hidden="true"></i> Overview
      </NavLink>
      <NavLink to="/transactions" className={({ isActive }) => `pw-sidebar-item ${isActive ? 'active' : ''}`}>
        <i className="ti ti-credit-card" aria-hidden="true"></i> Cards
      </NavLink>
      <NavLink to="/transactions" className={({ isActive }) => `pw-sidebar-item ${isActive ? 'active' : ''}`}>
        <i className="ti ti-arrows-exchange" aria-hidden="true"></i> Transfers
      </NavLink>
      
      <div className="pw-sidebar-divider"></div>
      
      <div className="pw-sidebar-label">Analyse</div>
      <NavLink to="/analytics" className={({ isActive }) => `pw-sidebar-item ${isActive ? 'active' : ''}`}>
        <i className="ti ti-chart-bar" aria-hidden="true"></i> Breakdown
      </NavLink>
      <NavLink to="/goals" className={({ isActive }) => `pw-sidebar-item ${isActive ? 'active' : ''}`}>
        <i className="ti ti-target" aria-hidden="true"></i> Goals
      </NavLink>
      <NavLink to="/analytics" className={({ isActive }) => `pw-sidebar-item ${isActive ? 'active' : ''}`}>
        <i className="ti ti-calendar" aria-hidden="true"></i> Calendar
      </NavLink>
      
      <div className="pw-sidebar-divider"></div>
      
      <div className="pw-sidebar-label">Settings</div>
      <div className="pw-sidebar-item">
        <i className="ti ti-settings" aria-hidden="true"></i> Preferences
      </div>
      <div className="pw-sidebar-item" onClick={handleLogout} style={{ color: '#FF2B2B' }}>
        <i className="ti ti-logout" aria-hidden="true"></i> Sign Out
      </div>
    </aside>
  );
}

export default Sidebar;
