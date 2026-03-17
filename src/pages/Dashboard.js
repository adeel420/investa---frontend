import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import {
  walletService,
  depositService,
  withdrawalService,
  investmentService,
} from "../lib/services";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalReferralEarning: 0,
    totalDeposit: 0,
    totalWithdrawn: 0,
    walletBalance: 0,
    totalEarning: 0,
    liveEarning: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  const calculateLiveEarning = (investmentsList) => {
    const now = new Date();

    const total = investmentsList.reduce((sum, inv) => {
      if (inv.status !== "ACTIVE") return sum;

      const startAt = new Date(inv.startAt);
      const endAt = new Date(inv.endAt);

      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
        return sum;
      }

      if (now <= startAt) return sum;

      const effectiveNow = now > endAt ? endAt : now;
      const elapsedMs = effectiveNow - startAt;
      const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

      const totalAccrued = elapsedDays * Number(inv.dailyProfit || 0);
      const pendingLive = totalAccrued - Number(inv.totalProfitCredited || 0);

      return sum + Math.max(0, pendingLive);
    }, 0);

    return Number(total.toFixed(2));
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [walletRes, depositsRes, withdrawalsRes, investmentsRes] =
        await Promise.all([
          walletService.getBalance(),
          depositService.getMyDeposits(),
          withdrawalService.getMyWithdrawals(),
          investmentService.getMyInvestments(),
        ]);

      // Wallet balance
      const walletBalance = Number(walletRes?.data?.data?.walletBalance || 0);

      // Deposits
      const deposits = depositsRes?.data?.data?.deposits || [];
      const totalDeposit = deposits
        .filter((d) => d.status === "APPROVED")
        .reduce((sum, d) => sum + Number(d.amountUSD || 0), 0);

      // Withdrawals
      const withdrawals = withdrawalsRes?.data?.data?.withdrawals || [];
      const totalWithdrawn = withdrawals
        .filter((w) => w.status === "PAID")
        .reduce((sum, w) => sum + Number(w.amountUSD || 0), 0);

      // Investments
      const investmentsData = investmentsRes?.data?.data?.investments || [];
      setInvestments(investmentsData);

      const totalInvested = investmentsData.reduce(
        (sum, inv) => sum + Number(inv.amount || 0),
        0,
      );

      // User earnings
      const totalEarning = Number(user?.totalEarnings || 0);
      const totalReferralEarning = Number(user?.totalReferralEarning || 0);

      // Live earning from active investments
      const liveEarning = calculateLiveEarning(investmentsData);

      setStats({
        totalInvested,
        totalReferralEarning,
        totalDeposit,
        totalWithdrawn,
        walletBalance,
        totalEarning,
        liveEarning,
      });

      // Transactions
      const allTransactions = [
        ...deposits.map((d) => ({ ...d, type: "deposit" })),
        ...withdrawals.map((w) => ({ ...w, type: "withdrawal" })),
      ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);

      setTransactions(allTransactions);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(); // eslint-disable-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!investments.length) {
      setStats((prev) => ({
        ...prev,
        liveEarning: 0,
      }));
      return;
    }

    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        liveEarning: calculateLiveEarning(investments),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [investments]);

  const formatCurrency = (amount) => {
    return `$${Number(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    const statusClasses = {
      pending: "badge bg-warning",
      approved: "badge bg-success",
      rejected: "badge bg-danger",
      completed: "badge bg-success",
      paid: "badge bg-success",
      denied: "badge bg-danger",
    };

    return (
      <span className={statusClasses[normalizedStatus] || "badge bg-secondary"}>
        {status}
      </span>
    );
  };

  const statCards = [
    {
      icon: "fas fa-hand-holding-usd",
      label: "Total Invested",
      value: formatCurrency(stats.totalInvested),
      color: "bg-orange",
      accent: "accent-teal",
    },
    {
      icon: "fas fa-user-friends",
      label: "Referral Earning",
      value: formatCurrency(stats.totalReferralEarning),
      color: "bg-purple",
      accent: "accent-gold",
    },
    {
      icon: "fas fa-arrow-circle-up",
      label: "Total Deposit",
      value: formatCurrency(stats.totalDeposit),
      color: "bg-yellow",
      accent: "accent-teal2",
    },
    {
      icon: "fas fa-arrow-circle-down",
      label: "Total Withdrawn",
      value: formatCurrency(stats.totalWithdrawn),
      color: "bg-red",
      accent: "accent-gold2",
    },
  ];

  return (
    <Layout title="Dashboard">
      {error && !loading && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-2">
          {/* Left Column */}
          <div className="col-12 col-lg-6">
            {/* Live Earning */}
            <div className="dashboard-card">
              {/* TOP ROW: Text (50%) + Logo (50%) */}
              <div className="d-flex align-items-stretch mb-3">
                {/* Left 50%: Live Earning + Balance + Total Earning */}
                <div style={{ width: "50%" }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i
                      className="fas fa-chart-line text-success"
                      style={{ fontSize: "14px" }}
                    ></i>
                    <span
                      className="text-white fw-semibold"
                      style={{ fontSize: "15px" }}
                    >
                      Live Earning
                    </span>
                  </div>

                  <p className="text-success mb-2" style={{ fontSize: "11px" }}>
                    Real time updates
                  </p>

                  <h2
                    className="text-white fw-bold mb-1"
                    style={{ fontSize: "40px", letterSpacing: "1px" }}
                  >
                    {formatCurrency(stats.liveEarning)}
                  </h2>

                  {/* <div className="total-earning-row">
                    <span className="text-gray" style={{ fontSize: "11px" }}>
                      Total Earning:&nbsp;
                    </span>
                    <span
                      className="fw-bold text-white"
                      style={{ fontSize: "13px" }}
                    >
                      {formatCurrency(stats.totalEarning)}
                    </span>
                  </div> */}
                </div>

                {/* Right 50%: Animated Logo */}
                <div
                  style={{
                    width: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    marginRight: "30px",
                  }}
                >
                  <div className="logo-anim-wrapper">
                    <img
                      src="https://ik.imagekit.io/b6iqka2sz/download.png"
                      alt="logo"
                      className="live-earning-logo"
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Buttons */}
              <div className="d-flex gap-3" style={{ marginTop: "40px" }}>
                <button
                  className="btn-primary-dash flex-fill"
                  onClick={() => navigate("/investment-plans")}
                >
                  <i className="fas fa-bolt me-2"></i>Activate Now
                </button>
                <button
                  className="btn-secondary-dash flex-fill"
                  onClick={() => navigate("/add-funds")}
                >
                  <i className="fas fa-plus me-2"></i>Add Funds
                </button>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bc-card mt-2">
              {/* Top Row: Balance info + Deposit button */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <p className="bc-label mb-1 text-white">Total Balance</p>
                  <div className="d-flex align-items-center gap-2">
                    <h2 className="bc-amount  mb-0">
                      {balanceVisible
                        ? formatCurrency(stats.walletBalance)
                        : "••••••"}
                    </h2>
                    <i
                      className="fas fa-arrow-up text-success"
                      style={{ fontSize: "14px" }}
                    ></i>
                    <i
                      className={`fas ${balanceVisible ? "fa-eye-slash" : "fa-eye"} bc-eye`}
                      onClick={() => setBalanceVisible(!balanceVisible)}
                    ></i>
                  </div>
                </div>
                <button
                  className="bc-btn-deposit"
                  onClick={() => navigate("/add-funds")}
                >
                  Deposit
                </button>
              </div>

              {/* Bottom Row: Available + Withdraw button */}
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="bc-label mb-0">Deposit Wallet:</p>
                  <div className="d-flex align-items-center gap-1">
                    <span className="bc-available-value">
                      {balanceVisible
                        ? formatCurrency(stats.walletBalance)
                        : "••••"}
                    </span>
                    <i
                      className="fas fa-arrow-down text-success"
                      style={{ fontSize: "12px" }}
                    ></i>
                  </div>
                </div>
                <button
                  className="bc-btn-withdraw"
                  onClick={() => navigate("/withdraw-funds")}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-12 col-lg-6">
            {/* Stats Grid */}
            <div className="row g-5 mt-lg-0">
              {statCards.map((stat, index) => (
                <div key={index} className="col-6">
                  <div className={`stat-card d-flex h-100 ${stat.accent}`}>
                    <div className="d-flex align-items-center mb-3">
                      <div className={`stat-icon ${stat.color}`}>
                        <i className={stat.icon}></i>
                      </div>
                    </div>
                    <div className="d-flex flex-column">
                      <p className="stat-label mb-1">{stat.label}</p>
                      <div className="stat-value">{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-6">
                <div className={`stat-card d-flex h-100 bg-gold`}>
                  <div className="d-flex align-items-center mb-3">
                    <div className={`stat-icon bg-purple`}>
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                  </div>
                  <div className="d-flex flex-column">
                    <p className="stat-label mb-1">Total Earning:&nbsp;</p>
                    <div className="stat-value">
                      {formatCurrency(stats.totalEarning)}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="total-earning-row">
                <span className="text-gray" style={{ fontSize: "11px" }}>
                  Total Earning:&nbsp;
                </span>
                <span
                  className="fw-bold text-white"
                  style={{ fontSize: "13px" }}
                >
                  {formatCurrency(stats.totalEarning)}
                </span>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="dashboard-card mt-4">
        {/* Header */}
        <div className="tx-card-header">
          <div className="tx-card-title-wrap">
            <div className="tx-card-icon">
              <i className="fas fa-exchange-alt"></i>
            </div>
            <div>
              <h5 className="tx-card-title">Recent Transactions</h5>
              <p className="tx-card-sub">
                Last {transactions.length} activities
              </p>
            </div>
          </div>
          <button
            className="btn-view-all"
            onClick={() => navigate("/transactions")}
          >
            View All <i className="fas fa-arrow-right ms-1"></i>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="tx-empty">
                      <i className="fas fa-inbox"></i>
                      <p>No transaction history found!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx, index) => (
                  <tr key={index} className="tx-table-row">
                    <td>
                      <div className="tx-type-cell">
                        <div
                          className={`tx-type-icon ${tx.type === "deposit" ? "deposit" : "withdrawal"}`}
                        >
                          <i
                            className={`fas ${tx.type === "deposit" ? "fa-arrow-down" : "fa-arrow-up"}`}
                          ></i>
                        </div>
                        <span className="tx-type-label">
                          {tx.type === "deposit" ? "Deposit" : "Withdrawal"}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`tx-amount-cell ${tx.type === "deposit" ? "deposit" : "withdrawal"}`}
                    >
                      {tx.type === "deposit" ? "+" : "-"}
                      {formatCurrency(tx.amountUSD)}
                    </td>
                    <td>{getStatusBadge(tx.status)}</td>
                    <td className="tx-date-cell">
                      <i className="fas fa-calendar-alt me-2"></i>
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
