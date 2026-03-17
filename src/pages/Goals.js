import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { rankService } from '../lib/services';
import './Goals.css';

const Goals = () => {
  const { user: _user } = useAuth();
  const [ranks, setRanks] = useState([]);
  const [myProgress, setMyProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanks();
  }, []);

  useEffect(() => {
    // Add floating animation to cards
    const cards = document.querySelectorAll('.dashboard-card, .goal-card');
    cards.forEach((card, index) => {
      card.style.animation = `fadeInUp 0.8s ease-out ${index * 0.1}s both`;
    });
  }, [ranks]);

  const fetchRanks = async () => {
    try {
      setLoading(true);
      
      // Fetch active ranks
      const ranksRes = await rankService.getActive();
      const ranksData = ranksRes.data?.data?.ranks || [];
      
      // Fetch user's rank progress
      const progressRes = await rankService.getMyProgress();
      const progress = progressRes.data?.data;
      
      setMyProgress(progress);
      
      // Calculate progress for each rank
      const rankedWithProgress = ranksData.map(rank => {
        const currentInvestment = progress?.currentInvestment || 0;
        const requiredInvestment = rank.requiredInvestment || 1;
        const progressPercent = Math.min((currentInvestment / requiredInvestment) * 100, 100);
        
        return {
          ...rank,
          progress: progressPercent,
          isCurrent: progress?.currentRank?.level === rank.level
        };
      });
      
      setRanks(rankedWithProgress);
    } catch (err) {
      console.error('Failed to fetch ranks:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toLocaleString()}`;
  };

  const getRankIcon = (level) => {
    const icons = {
      1: 'fas fa-shield-alt',
      2: 'fas fa-crown',
      3: 'fas fa-star',
      4: 'fas fa-medal',
      5: 'fas fa-gem',
      6: 'fas fa-trophy'
    };
    return icons[level] || 'fas fa-award';
  };

  const getRankBgClass = (level) => {
    return `bg-level-${level}`;
  };

  const currentRank = myProgress?.currentRank;
  const nextRank = myProgress?.nextRank;
  const currentInvestment = myProgress?.currentInvestment || 0;

  if (loading) {
    return (
      <Layout title="Ranks">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ranks">
      {/* Current Goal Status */}
      <div className="mb-2">
        <h4 className="text-white fw-bold mb-1">Current Goal Status</h4>
        <p className="text-gray small">Track your progress and see what's needed for the next level.</p>
      </div>

      {/* Progress Card */}
      <div className="dashboard-card mb-5">
        <div className="row align-items-center">
          <div className="col-md-2 text-center">
            <div className="rank-badge mx-auto mb-2">
              <i className={`${currentRank ? getRankIcon(currentRank.level) : 'fas fa-user'} text-white`}></i>
            </div>
            <p className="text-white fw-bold mb-0">{currentRank?.name || 'No Rank'}</p>
          </div>
          <div className="col-md-6">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <p className="text-gray mb-1">Progress to next goal</p>
                <h6 className="text-white mb-0">{nextRank?.name || 'Max Rank'}</h6>
              </div>
              <div className="text-end">
                <h4 className="text-white mb-0">
                  {nextRank ? Math.min((currentInvestment / nextRank.requiredInvestment) * 100, 100).toFixed(0) : 100}%
                </h4>
                <span className="text-success-custom small">
                  {nextRank ? 'Almost there!' : 'Max Rank Achieved!'}
                </span>
              </div>
            </div>
            <div className="progress">
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: `${nextRank ? Math.min((currentInvestment / nextRank.requiredInvestment) * 100, 100) : 100}%` }}
              ></div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="next-goal-card">
              <h6 className="text-white mb-3">
                {nextRank ? `Next Goal: ${nextRank.name}` : 'Current Rank'}
              </h6>
              {nextRank && (
                <>
                  <div className="d-flex align-items-center mb-2">
                    <i className="fas fa-bullseye text-primary-custom me-2"></i>
                    <span className="text-gray small">Team Investment</span>
                    <span className="text-success-custom ms-auto fw-bold">{formatCurrency(currentInvestment)}</span>
                  </div>
                  <div className="progress mb-2" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${Math.min((currentInvestment / nextRank.requiredInvestment) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-success-custom small">
                      {formatCurrency(Math.max(nextRank.requiredInvestment - currentInvestment, 0))} more needed
                    </span>
                    <span className="text-white small">{formatCurrency(nextRank.requiredInvestment)}</span>
                  </div>
                </>
              )}
              {currentRank && (
                <div className="mt-2 pt-2 border-top border-secondary">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-coins text-warning me-2"></i>
                    <span className="text-gray small">Monthly Salary</span>
                    <span className="text-warning ms-auto fw-bold">{formatCurrency(currentRank.monthlySalary)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reward Requirements */}
      <div className="mb-4">
        <h4 className="text-white fw-bold mb-1">Reward Requirements</h4>
        <p className="text-gray small">Make Refers and Earn BIG exciting rewards + refer commission.</p>
      </div>

      {/* Ranks Grid */}
      <div className="row g-4">
        {ranks.length === 0 ? (
          <div className="col-12 text-center py-5">
            <p className="text-gray">No ranks available at the moment.</p>
          </div>
        ) : (
          ranks.map((rank, index) => (
            <div key={rank._id || index} className="col-12 mb-4">
              <div className={`goal-card ${rank.isCurrent ? 'current' : ''}`}>
                {rank.isCurrent && <span className="current-badge">Current</span>}
                <div className="d-flex align-items-center mb-3">
                  <div className={`goal-icon ${getRankBgClass(rank.level)}`}>
                    <i className={`${getRankIcon(rank.level)} text-white`}></i>
                  </div>
                  <div>
                    <h6 className="text-white fw-bold mb-0">{rank.name}</h6>
                    <p className="text-gray small mb-0">Level {rank.level}</p>
                  </div>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-gray small">Required Investment</span>
                  <span className="text-gray small">Monthly Salary</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-white fw-bold">{formatCurrency(rank.requiredInvestment)}</span>
                  <span className="win-amount">{formatCurrency(rank.monthlySalary)}</span>
                </div>
                {rank.bonus > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-gray small">One-time Bonus</span>
                    <span className="text-success fw-bold">{formatCurrency(rank.bonus)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-gray small">Progress</span>
                  <span className="text-white small">{rank.progress.toFixed(0)}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${rank.progress}%` }}></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default Goals;
