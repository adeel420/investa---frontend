import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { rankService } from '../lib/services';
import '../pages/Dashboard.css';
import './Goals.css';

const Goals = () => {
  const { user } = useAuth();
  const [ranks, setRanks] = useState([]);
  const [myProgress, setMyProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRanks(); }, []);

  const fetchRanks = async () => {
    try {
      setLoading(true);
      const ranksRes = await rankService.getActive();
      const ranksData = ranksRes.data?.data?.ranks || [];
      const progressRes = await rankService.getMyProgress();
      const progress = progressRes.data?.data;
      setMyProgress(progress);
      setRanks(ranksData.map(rank => {
        const cur = progress?.currentInvestment || 0;
        const req = rank.requiredInvestment || 1;
        return { ...rank, progress: Math.min((cur / req) * 100, 100), isCurrent: progress?.currentRank?.level === rank.level };
      }));
    } catch (err) {
      console.error('Failed to fetch ranks:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `$${Number(amount).toLocaleString()}`;

  const getRankIcon = (level) => {
    const icons = { 1: 'fas fa-shield-alt', 2: 'fas fa-crown', 3: 'fas fa-star', 4: 'fas fa-medal', 5: 'fas fa-gem', 6: 'fas fa-trophy' };
    return icons[level] || 'fas fa-award';
  };

  const levelColors = {
    1: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    2: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
    3: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
    4: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
    5: { color: '#0FD9CD', bg: 'rgba(15,217,205,0.12)', border: 'rgba(15,217,205,0.25)' },
    6: { color: '#ce9f2a', bg: 'rgba(206,159,42,0.12)', border: 'rgba(206,159,42,0.25)' },
  };

  const currentRank = myProgress?.currentRank;
  const nextRank = myProgress?.nextRank;
  const currentInvestment = myProgress?.currentInvestment || 0;
  const nextProgress = nextRank ? Math.min((currentInvestment / nextRank.requiredInvestment) * 100, 100) : 100;
  const lc = levelColors[currentRank?.level] || levelColors[1];

  if (loading) return (
    <Layout title="Ranks">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" style={{ color: '#0FD9CD' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout title="Ranks">
      <div className="p-4">

        {/* ── Current Status Card ── */}
        <div className="dashboard-card mb-4">
          <div className="tx-card-title-wrap mb-4">
            <div className="tx-card-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div>
              <h5 className="tx-card-title">Current Rank Status</h5>
              <p className="tx-card-sub">Track your progress to the next level</p>
            </div>
          </div>

          <div className="row g-4 align-items-center">
            {/* Current rank badge */}
            <div className="col-12 col-md-3 text-center">
              <div className="rk-badge-wrap">
                <div className="rk-badge" style={{ background: lc.bg, border: `2px solid ${lc.border}`, color: lc.color }}>
                  <i className={currentRank ? getRankIcon(currentRank.level) : 'fas fa-user'}></i>
                </div>
                <p className="rk-badge-name">{currentRank?.name || 'No Rank'}</p>
                {currentRank && (
                  <span className="rk-salary-pill">
                    <i className="fas fa-coins me-1"></i>{formatCurrency(currentRank.monthlySalary)}/mo
                  </span>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="col-12 col-md-5">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="rk-progress-label">Progress to {nextRank?.name || 'Max Rank'}</span>
                <span className="rk-progress-pct">{nextProgress.toFixed(0)}%</span>
              </div>
              <div className="rk-progress-bar-wrap">
                <div className="rk-progress-bar" style={{ width: `${nextProgress}%` }}></div>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span className="rk-progress-sub">{formatCurrency(currentInvestment)} invested</span>
                <span className="rk-progress-sub">{nextRank ? formatCurrency(nextRank.requiredInvestment) : 'Max'}</span>
              </div>
            </div>

            {/* Next rank info */}
            <div className="col-12 col-md-4">
              <div className="rk-next-card">
                <p className="rk-next-title">{nextRank ? `Next: ${nextRank.name}` : '🎉 Max Rank Achieved!'}</p>
                {nextRank ? (
                  <>
                    <div className="rk-next-row">
                      <span className="rk-next-label"><i className="fas fa-bullseye me-2" style={{ color: '#0FD9CD' }}></i>Need</span>
                      <span className="rk-next-val">{formatCurrency(Math.max(nextRank.requiredInvestment - currentInvestment, 0))} more</span>
                    </div>
                    <div className="rk-next-row">
                      <span className="rk-next-label"><i className="fas fa-coins me-2" style={{ color: '#ce9f2a' }}></i>Salary</span>
                      <span className="rk-next-val" style={{ color: '#ce9f2a' }}>{formatCurrency(nextRank.monthlySalary)}/mo</span>
                    </div>
                  </>
                ) : (
                  <p className="rk-next-label">You have reached the highest rank!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reward Requirements ── */}
        <div className="tx-card-title-wrap mb-4">
          <div className="tx-card-icon" style={{ background: 'rgba(206,159,42,0.1)', border: '1px solid rgba(206,159,42,0.25)', color: '#ce9f2a' }}>
            <i className="fas fa-gift"></i>
          </div>
          <div>
            <h5 className="tx-card-title">Reward Requirements</h5>
            <p className="tx-card-sub">Refer and earn exciting rewards + commission</p>
          </div>
        </div>

        <div className="row g-4">
          {ranks.length === 0 ? (
            <div className="col-12">
              <div className="tx-empty"><i className="fas fa-inbox"></i><p>No ranks available.</p></div>
            </div>
          ) : (
            ranks.map((rank, index) => {
              const lc = levelColors[rank.level] || levelColors[1];
              return (
                <div key={rank._id || index} className="col-12 col-md-4">
                  <div className="rk-goal-card" style={{ '--rk-color': lc.color, '--rk-bg': lc.bg, '--rk-border': lc.border, animationDelay: `${index * 0.07}s` }}>

                    {rank.isCurrent && <span className="rk-current-badge">Current</span>}

                    {/* Top */}
                    <div className="rk-goal-top">
                      <div className="rk-goal-icon" style={{ background: lc.bg, border: `1px solid ${lc.border}`, color: lc.color }}>
                        <i className={getRankIcon(rank.level)}></i>
                      </div>
                      <div>
                        <h6 className="rk-goal-name">{rank.name}</h6>
                        <span className="rk-goal-level">Level {rank.level}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="rk-goal-stats">
                      <div className="rk-goal-stat">
                        <p className="rk-goal-stat-label">Required Investment</p>
                        <p className="rk-goal-stat-val">{formatCurrency(rank.requiredInvestment)}</p>
                      </div>
                      <div className="rk-goal-stat-divider"></div>
                      <div className="rk-goal-stat">
                        <p className="rk-goal-stat-label">Monthly Salary</p>
                        <p className="rk-goal-stat-val" style={{ color: '#ce9f2a' }}>{formatCurrency(rank.monthlySalary)}</p>
                      </div>
                    </div>

                    {rank.bonus > 0 && (
                      <div className="rk-bonus-row">
                        <i className="fas fa-gift me-2" style={{ color: '#10b981' }}></i>
                        <span className="rk-bonus-label">One-time Bonus</span>
                        <span className="rk-bonus-val">{formatCurrency(rank.bonus)}</span>
                      </div>
                    )}

                    {/* Progress */}
                    <div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="rk-progress-sub">Progress</span>
                        <span className="rk-progress-sub">{rank.progress.toFixed(0)}%</span>
                      </div>
                      <div className="rk-progress-bar-wrap">
                        <div className="rk-progress-bar" style={{ width: `${rank.progress}%`, background: `linear-gradient(90deg, ${lc.color}, ${lc.color}aa)` }}></div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </Layout>
  );
};

export default Goals;
