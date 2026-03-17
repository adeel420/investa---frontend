import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { referralService } from '../lib/services';
import './Referrals.css';

const Referrals = () => {
  const { user } = useAuth();
  const [referralEarning, setReferralEarning] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [referralsList, setReferralsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Generate referral link and code from user data
  const referralLink = user ? `${window.location.origin}/?ref=${user.referralCode}` : '';
  const referralCode = user?.referralCode || '';

  useEffect(() => {
    fetchReferralData();
  }, []);


  const fetchReferralData = async () => {
    console.log('Fetching referral data for user:', user?.totalReferralEarning);
    try {
      setLoading(true);
      
      // Set referral earnings from user data
      setReferralEarning(user?.totalReferralEarning || 0);
      console.log('Refferals:',referralsList);
      
      // Fetch referrals
      const response = await referralService.getMyStats();
      const referrals = response.data.data.referrals || [];
      setReferralsList(referrals);
      setTotalReferrals(referrals.length);
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
    } finally {
      setLoading(false);
    }

  };

  const commissionLevels = [
    {
      level: 1,
      name: 'Direct Referral',
      rate: '6%',
      members: referralsList.filter(r => r.level === 1).length,
      commission: referralsList
        .filter(r => r.level === 1)
        .reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
      icon: 'fas fa-user-plus',
      bgClass: 'bg-green',
      badgeClass: 'bg-primary-custom',
      badgeText: 'Level 1'
    },
    {
      level: 2,
      name: 'Second Level',
      rate: '3%',
      members: referralsList.filter(r => r.level === 2).length,
      commission: referralsList
        .filter(r => r.level === 2)
        .reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
      icon: 'fas fa-users',
      bgClass: 'bg-blue',
      badgeClass: 'bg-info-custom',
      badgeText: 'Level 2'
    },
    {
      level: 3,
      name: 'Third Level',
      rate: '3%',
      members: referralsList.filter(r => r.level === 3).length,
      commission: referralsList
        .filter(r => r.level === 3)
        .reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
      icon: 'fas fa-network-wired',
      bgClass: 'bg-purple',
      badgeClass: 'bg-purple-light',
      badgeText: 'Level 3'
    },
    {
      level: 4,
      name: 'Fourth Level',
      rate: '3%',
      members: referralsList.filter(r => r.level === 4).length,
      commission: referralsList
        .filter(r => r.level === 4)
        .reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
      icon: 'fas fa-layer-group',
      bgClass: 'bg-orange',
      badgeClass: 'bg-warning-custom',
      badgeText: 'Level 4'
    },
    {
      level: 5,
      name: 'Fifth Level',
      rate: '3%',
      members: referralsList.filter(r => r.level === 5).length,
      commission: referralsList
        .filter(r => r.level === 5)
        .reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
      icon: 'fas fa-crown',
      bgClass: 'bg-red',
      badgeClass: 'bg-danger-custom',
      badgeText: 'Level 5'
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard: ' + text);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleClaimEarnings = () => {
    if (referralEarning < 1) {
      alert('Minimum $1 required to claim earnings');
      return;
    }
    alert('Earnings claimed successfully!');
    // You can add API call here to claim earnings
  };

  const progressPercentage = Math.min((referralEarning / 1) * 100, 100);
  const remainingAmount = Math.max(1 - referralEarning, 0);

  if (loading) {
    return (
      <Layout title="Referrals">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Referrals">
      <div className="p-4">
        {/* Top Row */}
        <div className="row g-4 mb-4">
          {/* Referral Earning Wallet */}
          <div className="col-lg-6">
            <div className="wallet-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="text-white fw-bold mb-1">Referral Earning Wallet</h5>
                  <p className="text-gray small mb-0">Your current available balance</p>
                </div>
                <button className="claim-btn" onClick={handleClaimEarnings}>
                  <i className="fas fa-gift me-2"></i>Claim Earnings
                </button>
              </div>
              <div className="d-flex align-items-center mb-3">
                <h2 className="text-white fw-bold mb-0">$ {referralEarning.toFixed(2)}</h2>
                <span className="minimum-badge">Minimum $1</span>
              </div>
              <div className="progress mb-2">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{width: `${progressPercentage}%`}}
                ></div>
              </div>
              <p className="text-gray small mb-2">
                ${remainingAmount.toFixed(2)} more needed to claim
              </p>
              <p className="text-orange small mb-0">
                You can claim referral earnings when balance reaches $1 or more
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-6">
            <div className="row g-3 mb-3">
              {/* Total Referral Earning */}
              <div className="col-6">
                <div className="stat-card">
                  <div className="d-flex align-items-center mb-2">
                    <div className="stat-icon bg-purple-light me-3">
                      <i className="fas fa-dollar-sign text-white"></i>
                    </div>
                  </div>
                  <p className="text-gray small mb-1">Total Referral Earning</p>
                  <h4 className="text-white fw-bold mb-0">${referralEarning.toFixed(2)}</h4>
                </div>
              </div>
              {/* Total Referrals */}
              <div className="col-6">
                <div className="stat-card">
                  <div className="d-flex align-items-center mb-2">
                    <div className="stat-icon bg-orange-light me-3">
                      <i className="fas fa-user-friends text-white"></i>
                    </div>
                  </div>
                  <p className="text-gray small mb-1">Total Referrals</p>
                  <h4 className="text-white fw-bold mb-0">{totalReferrals}</h4>
                </div>
              </div>
            </div>

            {/* Referral Link */}
            <div className="dashboard-card mb-3">
              <h6 className="text-white mb-3">Referral Link</h6>
              <div className="referral-box">
                <span className="text-gray text-truncate" style={{fontSize: '14px'}}>{referralLink}</span>
                <button className="copy-btn" onClick={() => copyToClipboard(referralLink)}>
                  <i className="far fa-copy"></i>
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="dashboard-card">
              <h6 className="text-white mb-3">Referral Code</h6>
              <div className="referral-box">
                <span className="text-white fw-bold" style={{fontSize: '16px'}}>{referralCode}</span>
                <button className="copy-btn" onClick={() => copyToClipboard(referralCode)}>
                  <i className="far fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Commission Structure */}
        <div className="dashboard-card">
          <h5 className="text-white fw-bold mb-4">Investment Commission Structure</h5>
          <div className="row g-4">
            {commissionLevels.map((level, index) => (
              <div key={level.level} className="col-12 mb-4">
                <div className="commission-card text-start" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="d-flex align-items-center mb-3">
                    <div className={`stat-icon ${level.bgClass} me-3`}>
                      <i className={`${level.icon} text-white`}></i>
                    </div>
                    <div>
                      <p className="text-white fw-bold mb-0 fs-5">{level.name}</p>
                      <p className="text-gray small mb-0">Commission Rate</p>
                    </div>
                  </div>
                  <p className={`commission-rate rate-${level.level} text-start mb-3`}>{level.rate}</p>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="text-gray small">
                        <i className="fas fa-users me-1"></i> Total Members: <span className="text-white">{level.members}</span>
                      </span>
                    </div>
                    <div>
                      <span className={`badge ${level.badgeClass} px-3 py-2 rounded-pill`}>{level.badgeText}</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-gray small">
                        <i className="fas fa-coins me-1"></i> Total Commission: <span className="text-white">${level.commission.toFixed(2)}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-gray small">Earned</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Referrals;
