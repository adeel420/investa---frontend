import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import {
  walletService,
  depositService,
  withdrawalService,
} from "../lib/services";
import "./Dashboard.css";
import "./Wallet.css";

const Wallet = () => {
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [referralEarning, setReferralEarning] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const walletRes = await walletService.getBalance();
      setBalance(walletRes.data.data.walletBalance || 0);
      setReferralEarning(walletRes.data.data.totalReferralEarning || 0);

      const [depositsRes, withdrawalsRes] = await Promise.all([
        depositService.getMyDeposits(),
        withdrawalService.getMyWithdrawals(),
      ]);

      const deposits = (depositsRes.data.data.deposits || []).map((d) => ({
        ...d,
        amount: d.amountUSD,
        type: "deposit",
        displayType: "Deposit",
      }));

      const withdrawals = (withdrawalsRes.data.data.withdrawals || []).map(
        (w) => ({
          ...w,
          amount: w.amountUSD || w.amount,
          type: "withdrawal",
          displayType: "Withdrawal",
        }),
      );

      const allTransactions = [...deposits, ...withdrawals].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to fetch wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: "badge bg-warning text-dark",
      APPROVED: "badge bg-success",
      REJECTED: "badge bg-danger",
      COMPLETED: "badge bg-success",
      pending: "badge bg-warning text-dark",
      approved: "badge bg-success",
      rejected: "badge bg-danger",
      completed: "badge bg-success",
    };
    return (
      <span className={statusClasses[status] || "badge bg-secondary"}>
        {status}
      </span>
    );
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.displayType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);

    if (filterPeriod === "all") return matchesSearch;

    const txDate = new Date(tx.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));
    return matchesSearch && daysDiff <= parseInt(filterPeriod);
  });

  return (
    <Layout title="Wallet">
      <div className="p-4">

        {/* Balance Card */}
        <div className="bc-card mb-4" style={{ position: "relative" }}>
          {/* Balance info */}
          <div>
            <p className="bc-label mb-1 text-white">Total Balance</p>
            <div className="d-flex align-items-center gap-2 mb-3">
              <h2 className="bc-amount mb-0">
                {balanceVisible ? formatCurrency(balance) : "••••••"}
              </h2>
              <i className="fas fa-arrow-up text-success" style={{ fontSize: "14px" }}></i>
              <i
                className={`fas ${balanceVisible ? "fa-eye-slash" : "fa-eye"} bc-eye`}
                onClick={() => setBalanceVisible(!balanceVisible)}
              ></i>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="fas fa-user-friends" style={{ color: "#64748b", fontSize: "13px" }}></i>
              <span className="bc-label">Referral Earning:</span>
              <span className="text-white fw-bold" style={{ fontSize: "14px" }}>
                {formatCurrency(referralEarning)}
              </span>
              <i className="fas fa-arrow-up text-success" style={{ fontSize: "12px" }}></i>
            </div>
          </div>

          {/* Top-right buttons */}
          <div className="wallet-action-btns">
            <button className="bc-btn-deposit" onClick={() => navigate("/add-funds")}>
              <i className="fas fa-arrow-up me-2"></i>Deposit
            </button>
            <button className="bc-btn-withdraw" onClick={() => navigate("/withdraw-funds")}>
              <i className="fas fa-arrow-down me-2"></i>Withdraw
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          {/* Header */}
          <div className="tx-card-header">
            <div className="tx-card-title-wrap">
              <div className="tx-card-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <div>
                <h5 className="tx-card-title">Recent Activity</h5>
                <p className="tx-card-sub">{filteredTransactions.length} transactions</p>
              </div>
            </div>
            {/* Filters */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="wallet-search-wrap">
                <i className="fas fa-search wallet-search-icon"></i>
                <input
                  type="text"
                  className="wallet-search-box"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="wallet-filter-select"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
              >
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Table */}
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
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      <div className="tx-empty">
                        <i className="fas fa-inbox"></i>
                        <p>No transaction history found!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <tr key={index} className="tx-table-row">
                      <td>
                        <div className="tx-type-cell">
                          <div className={`tx-type-icon ${tx.type}`}>
                            <i className={`fas ${tx.type === "deposit" ? "fa-arrow-down" : "fa-arrow-up"}`}></i>
                          </div>
                          <span className="tx-type-label">{tx.displayType}</span>
                        </div>
                      </td>
                      <td className={`tx-amount-cell ${tx.type}`}>
                        {tx.type === "deposit" ? "+" : "-"}{formatCurrency(tx.amount)}
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

      </div>
    </Layout>
  );
};

export default Wallet;
