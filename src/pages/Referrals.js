import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { referralService } from "../lib/services";
import "../pages/Dashboard.css";
import "./Referrals.css";

const Referrals = () => {
  const { user } = useAuth();
  const [referralEarning, setReferralEarning] = useState(0);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [referralsList, setReferralsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const referralLink = user
    ? `${window.location.origin}/?ref=${user.referralCode}`
    : "";
  const referralCode = user?.referralCode || "";

  useEffect(() => {
    fetchReferralData(); // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setReferralEarning(user?.totalReferralEarning || 0);
      const response = await referralService.getMyStats();
      const referrals = response.data.data.referrals || [];
      setReferralsList(referrals);
      setTotalReferrals(referrals.length);
    } catch (err) {
      console.error("Failed to fetch referral data:", err);
    } finally {
      setLoading(false);
    }
  };

  const commissionLevels = [
    {
      level: 1,
      name: "Direct Referral",
      subname: "Commission Rate",
      rate: "6%",
      icon: "fas fa-user-plus",
      color: "#0FD9CD",
      members: referralsList.filter((r) => r.level === 1).length,
      commission: referralsList
        .filter((r) => r.level === 1)
        .reduce((s, r) => s + (r.commissionEarned || 0), 0),
    },
    {
      level: 2,
      name: "Second Level",
      rate: "3%",
      subname: "Commission Rate",
      icon: "fas fa-users",
      color: "#ce9f2a",
      members: referralsList.filter((r) => r.level === 2).length,
      commission: referralsList
        .filter((r) => r.level === 2)
        .reduce((s, r) => s + (r.commissionEarned || 0), 0),
    },
    {
      level: 3,
      name: "Third Level",
      subname: "Commission Rate",
      rate: "3%",
      icon: "fas fa-network-wired",
      color: "#3b82f6",
      members: referralsList.filter((r) => r.level === 3).length,
      commission: referralsList
        .filter((r) => r.level === 3)
        .reduce((s, r) => s + (r.commissionEarned || 0), 0),
    },
    {
      level: 4,
      name: "Fourth Level",
      rate: "3%",
      subname: "Commission Rate",
      icon: "fas fa-layer-group",
      color: "#f59e0b",
      members: referralsList.filter((r) => r.level === 4).length,
      commission: referralsList
        .filter((r) => r.level === 4)
        .reduce((s, r) => s + (r.commissionEarned || 0), 0),
    },
    {
      level: 5,
      name: "Fifth Level",
      rate: "3%",
      subname: "Commission Rate",
      icon: "fas fa-crown",
      color: "#ef4444",
      members: referralsList.filter((r) => r.level === 5).length,
      commission: referralsList
        .filter((r) => r.level === 5)
        .reduce((s, r) => s + (r.commissionEarned || 0), 0),
    },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Copied: " + text))
      .catch(console.error);
  };

  const handleClaimEarnings = () => {
    if (referralEarning < 1) {
      alert("Minimum $1 required to claim earnings");
      return;
    }
    alert("Earnings claimed successfully!");
  };

  const progressPercentage = Math.min((referralEarning / 1) * 100, 100);
  const remainingAmount = Math.max(1 - referralEarning, 0);

  if (loading)
    return (
      <Layout title="Referrals">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div
            className="spinner-border"
            style={{ color: "#0FD9CD" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout title="Referrals">
      <div className="p-4">
        {/* ── Row 1: Wallet card + Stats/Links ── */}
        <div className="row g-4 mb-4">
          {/* Referral Earning Wallet */}
          <div className="col-lg-6">
            <div className="dashboard-card h-100">
              {/* Title + Claim — single line */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="tx-card-icon">
                    <i className="fas fa-wallet"></i>
                  </div>
                  <div>
                    <h6
                      className="tx-card-title mb-0"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Referral Earning Wallet
                    </h6>
                    <p className="tx-card-sub mb-0">Available balance</p>
                  </div>
                </div>
                <button className="rf-claim-btn" onClick={handleClaimEarnings}>
                  <i className="fas fa-gift me-1"></i>Claim Earnings
                </button>
              </div>

              {/* Balance */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <h2 className="rf-balance mb-0">
                  ${referralEarning.toFixed(2)}
                </h2>
                <span className="rf-min-badge">Min $1</span>
              </div>

              {/* Progress */}
              <div className="rk-progress-bar-wrap mb-2">
                <div
                  className="rk-progress-bar"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="tx-card-sub mb-1">
                ${remainingAmount.toFixed(2)} more needed to claim
              </p>
              <p className="rf-note mb-0">
                Claim when balance reaches $1 or more
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="col-lg-6">
            {/* Total Earning + Total Referrals — same row, same height */}
            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="dashboard-card rf-stat-card h-100">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rf-stat-icon"
                      style={{
                        background: "rgba(15,217,205,0.12)",
                        border: "1px solid rgba(15,217,205,0.25)",
                        color: "#0FD9CD",
                      }}
                    >
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div>
                      <p className="rf-stat-label mb-0">
                        Total Referral Earning
                      </p>
                      <h5 className="rf-stat-val mb-0">
                        ${referralEarning.toFixed(2)}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="dashboard-card rf-stat-card h-100">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rf-stat-icon"
                      style={{
                        background: "rgba(206,159,42,0.12)",
                        border: "1px solid rgba(206,159,42,0.25)",
                        color: "#ce9f2a",
                      }}
                    >
                      <i className="fas fa-user-friends"></i>
                    </div>
                    <div>
                      <p className="rf-stat-label mb-0">Total Referrals</p>
                      <h5 className="rf-stat-val mb-0">{totalReferrals}</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Link + Referral Code — same row, same height as stat cards */}
            <div className="row g-3">
              <div className="col-6">
                <div className="dashboard-card rf-link-card h-100">
                  <p className="rf-link-label mb-2">
                    <i
                      className="fas fa-link me-2"
                      style={{ color: "#0FD9CD" }}
                    ></i>
                    Referral Link
                  </p>
                  <div className="rf-copy-row">
                    <span className="rf-link-text text-truncate">
                      {referralLink}
                    </span>
                    <button
                      className="rf-copy-btn"
                      onClick={() => copyToClipboard(referralLink)}
                    >
                      <i className="far fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="dashboard-card rf-link-card h-100">
                  <p className="rf-link-label mb-2">
                    <i
                      className="fas fa-hashtag me-2"
                      style={{ color: "#ce9f2a" }}
                    ></i>
                    Referral Code
                  </p>
                  <div className="rf-copy-row">
                    <span className="rf-code-text">{referralCode}</span>
                    <button
                      className="rf-copy-btn"
                      onClick={() => copyToClipboard(referralCode)}
                    >
                      <i className="far fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Investment Commission Structure — 5 cards, 1 row ── */}
        <div className="dashboard-card">
          <div className="tx-card-title-wrap mb-4">
            <div
              className="tx-card-icon"
              style={{
                background: "rgba(206,159,42,0.1)",
                border: "1px solid rgba(206,159,42,0.25)",
                color: "#ce9f2a",
              }}
            >
              <i className="fas fa-sitemap"></i>
            </div>
            <div>
              <h5 className="tx-card-title">Investment Commission Structure</h5>
              <p className="tx-card-sub">
                Multi-level referral earnings breakdown
              </p>
            </div>
          </div>

          <div className="row g-3 rf-commission-row">
            {commissionLevels.map((lvl, i) => (
              <div key={lvl.level} className="col rf-commission-col">
                <div
                  className="rf-commission-card"
                  style={{
                    "--rf-color": lvl.color,
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <p className="rf-comm-name ">{lvl.name}</p>
                  <p className="rf-comm-subname">{lvl.subname}</p>
                  <div className="rf-comm-icon-wrap">
                    {/* <div
                      className="rf-comm-icon"
                      style={{
                        background: `${lvl.color}18`,
                        border: `1px solid ${lvl.color}40`,
                        color: lvl.color,
                      }}
                    >
                      <i className={lvl.icon}></i>
                    </div> */}
                    {/* <span
                      className="rf-level-badge"
                      style={{
                        color: lvl.color,
                        // background: `${lvl.color}15`,
                        border: `1px solid ${lvl.color}30`,
                      }}
                    >
                      L{lvl.level}
                    </span> */}
                  </div>
                  <p className="rf-comm-rate" style={{ color: lvl.color }}>
                    {lvl.rate}
                  </p>
                  <div className="rf-comm-divider"></div>
                  <div className="rf-comm-stat">
                    <p className="rf-comm-earnname">Earning</p>
                    <span className="rf-comm-earnname">Level {lvl.level}</span>
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
