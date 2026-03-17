import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import { useAuth } from "../contexts/AuthContext";

const Header = ({ title = "Dashboard", onHamburgerClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <div className="top-header">

        {/* ── DESKTOP (≥992px) ── */}
        <div className="header-desktop">
          <h4 className="page-title">{title}</h4>
          <div className="d-flex align-items-center gap-3">
            <button className="notif-btn" onClick={() => setShowNotifications(!showNotifications)}>
              <i className="fas fa-bell"></i>
            </button>
            <Link to="/profile" className="profile-link">
              <img src="https://ik.imagekit.io/b6iqka2sz/WhatsApp%20Image%202026-03-10%20at%203.42.10%20AM.jpeg" alt="avatar" className="header-avatar" />
              <div className="profile-text">
                <span className="profile-name">{user?.name}</span>
                <span className="profile-email">{user?.email}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* ── TABLET (768px–991px): hamburger + title + notification ── */}
        <div className="header-tablet">
          <div className="d-flex align-items-center gap-2">
            <button className="hamburger-btn" onClick={onHamburgerClick} aria-label="Toggle sidebar">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h4 className="page-title">{title}</h4>
          </div>
          <button className="notif-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <i className="fas fa-bell"></i>
          </button>
        </div>

        {/* ── MOBILE (<768px): profile left + notification right ── */}
        <div className="header-mobile">
          <Link to="/profile" className="profile-link">
            <img src="https://ik.imagekit.io/b6iqka2sz/WhatsApp%20Image%202026-03-10%20at%203.42.10%20AM.jpeg" alt="avatar" className="header-avatar" />
            <div className="profile-text">
              <span className="profile-name">{user?.name}</span>
              <span className="profile-email">{user?.email}</span>
            </div>
          </Link>
          <button className="notif-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <i className="fas fa-bell"></i>
          </button>
        </div>

      </div>

      {/* Notification Modal */}
      <div className={`notification-modal ${showNotifications ? "active" : ""}`}>
        <div className="notification-content">
          <div className="notification-header">
            <h5 className="text-white mb-0">Notifications</h5>
            <button className="notif-close-btn" onClick={() => setShowNotifications(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="notification-body">
            <div className="no-notification">
              <i className="fas fa-bell-slash"></i>
              <p>No Notification found!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
