import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({
    finance: false,
    activity: false,
    account: false,
  });

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };

  return (
    <div className={`sidebar ${isOpen ? 'active' : ''}`}>

      {/* Logo */}
      <div className="sidebar-logo-area">
        <Link to="/dashboard">
          <img
            src="https://ik.imagekit.io/b6iqka2sz/download.png"
            alt="Investa Logo"
            className="sidebar-logo-img"
          />
          <span className="sidebar-brand">Invest<span>a</span></span>
        </Link>
      </div>

      <nav className="nav flex-column">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <i className="fas fa-th-large"></i> Dashboard
        </Link>

        {/* Finance */}
        <div className="nav-group">
          <div className="nav-group-title" onClick={() => toggleGroup('finance')}>
            Finance
            <i className={`fas fa-chevron-${expandedGroups.finance ? 'up' : 'down'}`}></i>
          </div>
          <div className={`nav-group-content ${expandedGroups.finance ? 'active' : ''}`}>
            <Link to="/wallet" className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}>
              <i className="fas fa-wallet"></i> My Wallet
            </Link>
            <Link to="/add-funds" className={`nav-link ${isActive('/add-funds') ? 'active' : ''}`}>
              <i className="fas fa-plus-circle"></i> Add Funds
            </Link>
            <Link to="/withdraw-funds" className={`nav-link ${isActive('/withdraw-funds') ? 'active' : ''}`}>
              <i className="fas fa-arrow-down"></i> Withdraw Funds
            </Link>
            <Link to="/investment-plans" className={`nav-link ${isActive('/investment-plans') ? 'active' : ''}`}>
              <i className="fas fa-chart-pie"></i> Investment Plans
            </Link>
          </div>
        </div>

        {/* Activity */}
        <div className="nav-group">
          <div className="nav-group-title" onClick={() => toggleGroup('activity')}>
            Activity
            <i className={`fas fa-chevron-${expandedGroups.activity ? 'up' : 'down'}`}></i>
          </div>
          <div className={`nav-group-content ${expandedGroups.activity ? 'active' : ''}`}>
            <Link to="/goals" className={`nav-link ${isActive('/goals') ? 'active' : ''}`}>
              <i className="fas fa-trophy"></i> Ranks
            </Link>
            <Link to="/referrals" className={`nav-link ${isActive('/referrals') ? 'active' : ''}`}>
              <i className="fas fa-users"></i> My Referrals
            </Link>
            <Link to="/transactions" className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}>
              <i className="fas fa-exchange-alt"></i> Transactions
            </Link>
          </div>
        </div>

        {/* Account */}
        <div className="nav-group">
          <div className="nav-group-title" onClick={() => toggleGroup('account')}>
            Account
            <i className={`fas fa-chevron-${expandedGroups.account ? 'up' : 'down'}`}></i>
          </div>
          <div className={`nav-group-content ${expandedGroups.account ? 'active' : ''}`}>
            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
              <i className="fas fa-user-circle"></i> My Profile
            </Link>
            <Link to="/support" className={`nav-link ${isActive('/support') ? 'active' : ''}`}>
              <i className="fas fa-headset"></i> Help & Support
            </Link>
            <Link to="/security" className={`nav-link ${isActive('/security') ? 'active' : ''}`}>
              <i className="fas fa-shield-alt"></i> Security Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="sidebar-logout-wrap">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt me-2"></i>
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
