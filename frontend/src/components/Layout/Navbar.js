import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user } = useAuth();
  
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'SS';

  return (
    <nav className="pw-nav">
      <div className="pw-logo">PENNY<span>WISE</span></div>
      <ul className="pw-nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
            Spend
          </NavLink>
        </li>
        <li>
          <NavLink to="/goals" className={({ isActive }) => isActive ? 'active' : ''}>
            Goals
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
            Reports
          </NavLink>
        </li>
      </ul>
      <div className="pw-nav-right">
        <div className="pw-tag">
          <span className="pw-status-dot"></span>Live
        </div>
        <div className="pw-avatar">{initials}</div>
      </div>
    </nav>
  );
}

export default Navbar;