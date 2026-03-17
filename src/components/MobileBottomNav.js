import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/dashboard',
      icon: 'fas fa-home',
      label: 'Home'
    },
    {
      path: '/add-funds',
      icon: 'fas fa-mobile-alt',
      label: 'Recharge'
    },
    {
      path: '/investment-plans',
      icon: 'fas fa-chart-line',
      label: 'Investment'
    },
    {
      path: '/withdraw-funds',
      icon: 'fas fa-wallet',
      label: 'Withdraw'
    },
    {
      path: '/profile',
      icon: 'fas fa-user',
      label: 'Profile'
    }
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
        >
          <i className={item.icon}></i>
          <span className="mobile-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
