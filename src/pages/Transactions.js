import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import {
  depositService,
  withdrawalService,
  investmentService,
} from "../lib/services";
import "./Transactions.css";

const Transactions = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarning: 0,
    referralEarning: 0,
    totalDeposit: 0,
    totalWithdrawn: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [filterPeriod]);

  useEffect(() => {
    // Add floating animation to cards
    const cards = document.querySelectorAll(".dashboard-card, .stat-card");
    cards.forEach((card, index) => {
      card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
    });
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Fetch all transaction types
      const [depositsRes, withdrawalsRes, investmentsRes] = await Promise.all([
        depositService.getMyDeposits(),
        withdrawalService.getMyWithdrawals(),
        investmentService.getMyInvestments(),
      ]);

      const deposits = (depositsRes.data.data.deposits || []).map((d) => ({
        ...d,
        type: "Deposit",
        displayType: `Deposit (${d.paymentMethod || "Unknown"})`,
        date: d.createdAt,
        amount: d.amountUSD,
      }));

      const withdrawals = (withdrawalsRes.data.data.withdrawals || []).map(
        (w) => ({
          ...w,
          type: "Withdrawal",
          displayType: `Withdrawal (${w.paymentMethod || "Unknown"})`,
          date: w.createdAt,
          amount: w.amountUSD,
        }),
      );

      const investments = (investmentsRes.data.data.investments || []).map(
        (inv) => ({
          ...inv,
          type: "Investment",
          displayType: `Investment (${inv.plan?.name || "Plan"})`,
          status: inv.status,
          date: inv.createdAt,
          amount: inv.amount,
        }),
      );

      // Combine all transactions
      let allTransactions = [...deposits, ...withdrawals, ...investments];

      // Calculate stats
      const totalDeposit = deposits
        .filter((d) => d.status === "APPROVED")
        .reduce((sum, d) => sum + Number(d.amountUSD || 0), 0);

      const totalWithdrawn = withdrawals
        .filter((w) => w.status === "PAID")
        .reduce((sum, w) => sum + Number(w.amountUSD || 0), 0);


      const referralEarning = user?.totalReferralEarning || 0;

      const totalEarning = user?.totalEarnings || 0;

      setStats({
        totalEarning,
        referralEarning,
        totalDeposit,
        totalWithdrawn,
      });

      // Filter by period
      if (filterPeriod !== "all") {
        const days = parseInt(filterPeriod);
        const cutoffDate = new Date(
          new Date().getTime() - days * 24 * 60 * 60 * 1000,
        );
        allTransactions = allTransactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate >= cutoffDate;
        });
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search term
  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.type.toLowerCase().includes(search) ||
      (t.displayType && t.displayType.toLowerCase().includes(search)) ||
      t.status.toLowerCase().includes(search) ||
      t.amount.toString().includes(search)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "text-warning",
      approved: "text-success",
      rejected: "text-danger",
      completed: "text-success",
      active: "text-success",
      cancelled: "text-danger",
    };
    return (
      <span className={statusClasses[status] || "text-gray"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeClasses = {
      Deposit: "badge bg-success",
      Withdrawal: "badge bg-warning text-dark",
      Investment: "badge bg-info text-dark",
    };
    return (
      <span className={typeClasses[type] || "badge bg-secondary"}>{type}</span>
    );
  };

  return (
    <Layout title="Transactions">
      {/* Stats Row */}
      <div className="row g-4 mb-4">
        {/* Total Earning */}
        <div className="col-lg-3 col-md-6">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="stat-icon bg-orange">
                <i className="fas fa-dollar-sign text-white"></i>
              </div>
              <div>
                <p className="text-gray small mb-1">Total Earning</p>
                <h4 className="text-white fw-bold mb-0">
                  {formatCurrency(stats.totalEarning)}
                </h4>
              </div>
            </div>
          </div>
        </div>
        {/* Referral Earning */}
        <div className="col-lg-3 col-md-6">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="stat-icon bg-purple">
                <i className="fas fa-user-friends text-white"></i>
              </div>
              <div>
                <p className="text-gray small mb-1">Referral Earning</p>
                <h4 className="text-white fw-bold mb-0">
                  {formatCurrency(stats.referralEarning)}
                </h4>
              </div>
            </div>
          </div>
        </div>
        {/* Total Deposit */}
        <div className="col-lg-3 col-md-6">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="stat-icon bg-yellow">
                <i className="fas fa-arrow-up text-white"></i>
              </div>
              <div>
                <p className="text-gray small mb-1">Total Deposit</p>
                <h4 className="text-white fw-bold mb-0">
                  {formatCurrency(stats.totalDeposit)}
                </h4>
              </div>
            </div>
          </div>
        </div>
        {/* Total Withdrawn */}
        <div className="col-lg-3 col-md-6">
          <div className="stat-card">
            <div className="d-flex align-items-center">
              <div className="stat-icon bg-red">
                <i className="fas fa-arrow-down text-white"></i>
              </div>
              <div>
                <p className="text-gray small mb-1">Total Withdrawn</p>
                <h4 className="text-white fw-bold mb-0">
                  {formatCurrency(stats.totalWithdrawn)}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="dashboard-card">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h5 className="text-white fw-bold mb-0">Transaction History</h5>
          <div className="d-flex gap-3">
            <div className="position-relative">
              <i
                className="fas fa-search position-absolute text-gray"
                style={{
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              ></i>
              <input
                type="text"
                className="search-box ps-5"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-link text-white p-2 professional-btn"
              style={{
                background:
                  "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
                border: "1px solid rgba(68, 210, 246, 0.3)",
                borderRadius: "12px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <i className="fas fa-sliders-h"></i>
            </button>
            <select
              className="filter-dropdown"
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
                <th>Details</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <div className="py-5">
                      <p
                        className="text-gray mb-0"
                        style={{ fontSize: "16px" }}
                      >
                        No transaction history found!
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{getTypeBadge(transaction.type)}</td>
                    <td className="text-gray">{transaction.displayType}</td>
                    <td className="text-white fw-bold">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td>{getStatusBadge(transaction.status)}</td>
                    <td className="text-gray">
                      {formatDate(transaction.date)}
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

export default Transactions;
