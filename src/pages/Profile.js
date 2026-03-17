import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false); // eslint-disable-line no-unused-vars
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Scroll to top when component mounts or route changes
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    // Initialize form data from user
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveAccount = async () => {
    // For now just show alert - you can add API call here later
    alert('Account information saved successfully!');
    setIsEditing(false);
  };

  const handleSavePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    // For now just show alert - you can add API call here later
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleBackToMenu = () => {
    setShowProfileSettings(false);
    setActiveTab('account');
    setIsEditing(false);
  };

  const menuItems = [
    {
      icon: 'fas fa-user',
      label: 'Profile',
      path: '/profile',
      isSettings: true
    },
    {
      icon: 'fas fa-chart-line',
      label: 'Investment Plans',
      path: '/investment-plans'
    },
    {
      icon: 'fas fa-wallet',
      label: 'Wallet',
      path: '/wallet'
    },
    {
      icon: 'fas fa-mobile-alt',
      label: 'Deposit',
      path: '/add-funds'
    },
    {
      icon: 'fas fa-money-bill-wave',
      label: 'Withdraw',
      path: '/withdraw-funds'
    },
    {
      icon: 'fas fa-trophy',
      label: 'Ranks',
      path: '/goals'
    },
    {
      icon: 'fas fa-users',
      label: 'Referral',
      path: '/referrals'
    },
    {
      icon: 'fas fa-exchange-alt',
      label: 'Transaction History',
      path: '/transactions'
    }
  ];

  if (!user) {
    return (
      <Layout title="Profile">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile">
      <div className="profile-page-container">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-header-content">
            <div className="profile-picture-wrapper">
              <div className="profile-picture">
                <img
                  src="https://ik.imagekit.io/b6iqka2sz/WhatsApp%20Image%202026-03-10%20at%203.42.10%20AM.jpeg"
                  alt="Investa Logo"
                  className="login-logo"
                />
              </div>
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{user.name}</h2>
              <p className="profile-email">{user.email}</p>
              <p className="profile-userid">UID: {user.referralCode || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Profile Settings View */}
        {showProfileSettings ? (
          <div className="profile-settings-container">
            <div className="profile-settings-header">
              <button className="back-button" onClick={handleBackToMenu}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <h4 className="text-white mb-0">Profile Settings</h4>
            </div>

            <div className="dashboard-card">
              {/* Tabs */}
              <div className="profile-tabs">
                <button
                  className={`profile-tab ${activeTab === 'account' ? 'active' : ''}`}
                  onClick={() => setActiveTab('account')}
                >
                  Account
                </button>
                <button
                  className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  Change Password
                </button>
              </div>

              {/* Account Section */}
              {activeTab === 'account' && (
                <div id="account-tab" className="tab-content active">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="text-white fw-bold mb-0">Account</h5>
                    {!isEditing && (
                      <button className="btn-edit" onClick={() => setIsEditing(true)}>
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Form */}
                  <form id="account-form">
                    <div className="row">
                      {/* First Name */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">First Name</label>
                          <div className="position-relative">
                            <i className="far fa-user input-icon"></i>
                            <input
                              type="text"
                              className="form-input form-input-with-icon"
                              id="first-name"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              readOnly={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Last Name */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Last Name</label>
                          <div className="position-relative">
                            <i className="far fa-user input-icon"></i>
                            <input
                              type="text"
                              className="form-input form-input-with-icon"
                              id="last-name"
                              name="lastName"
                              placeholder="Enter your Last Name"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              readOnly={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Email */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <div className="position-relative">
                            <i className="far fa-envelope input-icon"></i>
                            <input
                              type="email"
                              className="form-input form-input-with-icon"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              readOnly={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Phone */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Phone</label>
                          <div className="position-relative">
                            <i className="fas fa-phone input-icon"></i>
                            <input
                              type="tel"
                              className="form-input form-input-with-icon"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              readOnly={!isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    {isEditing && (
                      <div className="mt-4" id="account-form-actions">
                        <button type="button" className="btn-save" onClick={handleSaveAccount}>
                          Save Changes
                        </button>
                        <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Change Password Section */}
              {activeTab === 'password' && (
                <div id="password-tab" className="tab-content active">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="text-white fw-bold mb-0">Change Password</h5>
                  </div>

                  {/* Password Form */}
                  <form id="password-form">
                    <div className="row">
                      {/* Current Password */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Current Password</label>
                          <div className="position-relative">
                            <i className="fas fa-lock input-icon"></i>
                            <input
                              type="password"
                              className="form-input form-input-with-icon"
                              id="current-password"
                              name="currentPassword"
                              placeholder="Enter current password"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>
                      </div>
                      {/* New Password */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">New Password</label>
                          <div className="position-relative">
                            <i className="fas fa-lock input-icon"></i>
                            <input
                              type="password"
                              className="form-input form-input-with-icon"
                              id="new-password"
                              name="newPassword"
                              placeholder="Enter new password"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Confirm Password */}
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Confirm Password</label>
                          <div className="position-relative">
                            <i className="fas fa-lock input-icon"></i>
                            <input
                              type="password"
                              className="form-input form-input-with-icon"
                              id="confirm-password"
                              name="confirmPassword"
                              placeholder="Confirm new password"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="mt-4">
                      <button type="button" className="btn-save" onClick={handleSavePassword}>
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Menu Items */}
            <div className="profile-menu-list">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className={`profile-menu-item ${item.isSettings && showProfileSettings ? 'active' : ''}`}
                  onClick={() => {
                    if (item.isSettings) {
                      setShowProfileSettings(true);
                    } else if (location.pathname !== item.path) {
                      navigate(item.path);
                    } else {
                      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <i className={`${item.icon} menu-item-icon`}></i>
                  <span className="menu-item-label">{item.label}</span>
                  <i className="fas fa-chevron-right menu-item-arrow"></i>
                </div>
              ))}
            </div>

            {/* Logout Button */}
            <div className="profile-logout-wrapper">
              <button className="profile-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
