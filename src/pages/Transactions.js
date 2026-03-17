import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { depositService, withdrawalService, investmentService } from "../lib/services";
import "../pages/Dashboard.css";
import "./Transactions.css";

const Transactions = () => {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEarning: 0, referralEarning: 0, totalDeposit: 0, totalWithdrawn: 0 });

  useEffect(() => { fetchTransactions(); }, [filterPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const [depositsRes, withdrawalsRes, investmentsRes] = await Promise.all([
        depositService.getMyDeposits(),
        withdrawalService.getMyWithdrawals(),
        investmentService.getMyInvestments(),
      ]);

      const deposits = (depositsRes.data.data.deposits || []).map((d) => ({
        ...d, type: "Deposit", displayType: `${d.paymentMethod || "Unknown"}`, date: d.createdAt, amount: d.amountUSD,
      }));
      const withdrawals = (withdrawalsRes.data.data.withdrawals || []).map((w) => ({
        ...w, type: "Withdrawal", displayType: `${w.paymentMethod || "Unknown"}`, date: w.createdAt, amount: w.amountUSD,
      }));
      const investments = (investmentsRes.data.data.investments || []).map((inv) => ({
        ...inv, type: "Investment", displayType: `${inv.plan?.name || "Plan"}`, date: inv.createdAt, amount: inv.amount,
      }));

      let allTransactions = [...deposits, ...withdrawals, ...investments];

      const totalDeposit = deposits.filter((d) => d.status === "APPROVED").reduce((s, d) => s + Number(d.amountUSD || 0), 0);
      const totalWithdrawn = withdrawals.filter((w) => w.status === "PAID").reduce((s, w) => s + Number(w.amountUSD || 0), 0);

      setStats({ totalEarning: user?.totalEarnings || 0, referralEarning: user?.totalReferralEarning || 0, totalDeposit, totalWithdrawn });

      if (filterPeriod !== "all") {
        const cutoff = new Date(Date.now() - parseInt(filterPeriod) * 86400000);
        allTransactions = allTransactions.filter((t) => new Date(t.date) >= cutoff);
      }

      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return t.type.toLowerCase().includes(s) || t.displayType.toLowerCase().includes(s) || t.status.toLowerCase().includes(s) || t.amount.toString().includes(s);
  });

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatCurrency = (a) => `$${Number(a).toFixed(2)}`;

  const typeConfig = {
    Deposit:    { icon: "fas fa-arrow-down", color: "#0FD9CD", bg: "rgba(15,217,205,0.12)", border: "rgba(15,217,205,0.25)" },
    Withdrawal: { icon: "fas fa-arrow-up",   color: "#ce9f2a", bg: "rgba(206,159,42,0.12)", border: "rgba(206,159,42,0.25)" },
    Investment: { icon: "fas fa-chart-line", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  };

  const statusConfig = {
    pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.25)",  label: "Pending"   },
    approved:  { color: "#0FD9CD", bg: "rgba(15,217,205,0.12)",  border: "rgba(15,217,205,0.25)",  label: "Approved"  },
    APPROVED:  { color: "#0FD9CD", bg: "rgba(15,217,205,0.12)",  border: "rgba(15,217,205,0.25)",  label: "Approved"  },
    rejected:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   label: "Rejected"  },
    REJECTED:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   label: "Rejected"  },
    completed: { color: "#0FD9CD", bg: "rgba(15,217,205,0.12)",  border: "rgba(15,217,205,0.25)",  label: "Completed" },
    active:    { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",   label: "Active"    },
    ACTIVE:    { color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)",   label: "Active"    },
    paid:      { color: "#0FD9CD", bg: "rgba(15,217,205,0.12)",  border: "rgba(15,217,205,0.25)",  label: "Paid"      },
    PAID:      { color: "#0FD9CD", bg: "rgba(15,217,205,0.12)",  border: "rgba(15,217,205,0.25)",  label: "Paid"      },
    cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)",   label: "Cancelled" },
  };

  const statCards = [
    { label: "Total Earning",    value: formatCurrency(stats.totalEarning),    icon: "fas fa-coins",        color: "#0FD9CD", bg: "rgba(15,217,205,0.12)",  border: "rgba(15,217,205,0.25)"  },
    { label: "Referral Earning", value: formatCurrency(stats.referralEarning), icon: "fas fa-user-friends", color: "#ce9f2a", bg: "rgba(206,159,42,0.12)",  border: "rgba(206,159,42,0.25)"  },
    { label: "Total Deposit",    value: formatCurrency(stats.totalDeposit),    icon: "fas fa-arrow-down",   color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.25)"   },
    { label: "Total Withdrawn",  value: formatCurrency(stats.totalWithdrawn),  icon: "fas fa-arrow-up",     color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)"   },
  ];

  return (
    <Layout title="Transactions">
      <div className="p-4">

        {/* ── Stat Cards ── */}
        <div className="row g-3 mb-4">
          {statCards.map((s, i) => (
            <div key={i} className="col-6 col-lg-3">
              <div className="dashboard-card tn-stat-card">
                <div className="d-flex align-items-center gap-3">
                  <div className="tn-stat-icon" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                    <i className={s.icon}></i>
                  </div>
                  <div>
                    <p className="tn-stat-label mb-0">{s.label}</p>
                    <h5 className="tn-stat-val mb-0" style={{ color: s.color }}>{s.value}</h5>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Transaction History ── */}
        <div className="dashboard-card">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <div className="tx-card-title-wrap">
              <div className="tx-card-icon">
                <i className="fas fa-list-alt"></i>
              </div>
              <div>
                <h5 className="tx-card-title">Transaction History</h5>
                <p className="tx-card-sub">{filteredTransactions.length} records found</p>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <div className="tn-search-wrap">
                <i className="fas fa-search tn-search-icon"></i>
                <input
                  type="text"
                  className="tn-search"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="tn-filter" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
                <option value="3">3 Days</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <div className="spinner-border" style={{ color: "#0FD9CD" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="tx-empty">
              <i className="fas fa-inbox"></i>
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="tn-table-wrap">
              {/* Desktop table */}
              <table className="tn-table d-none d-md-table">
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
                  {filteredTransactions.map((t, i) => {
                    const tc = typeConfig[t.type] || typeConfig.Investment;
                    const sc = statusConfig[t.status] || { color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", label: t.status };
                    return (
                      <tr key={i} className="tn-table-row">
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="tn-type-icon" style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                              <i className={tc.icon}></i>
                            </div>
                            <span className="tn-type-label" style={{ color: tc.color }}>{t.type}</span>
                          </div>
                        </td>
                        <td className="tn-detail">{t.displayType}</td>
                        <td className="tn-amount">{formatCurrency(t.amount)}</td>
                        <td>
                          <span className="tn-status-badge" style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="tn-date">{formatDate(t.date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="d-md-none">
                {filteredTransactions.map((t, i) => {
                  const tc = typeConfig[t.type] || typeConfig.Investment;
                  const sc = statusConfig[t.status] || { color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", label: t.status };
                  return (
                    <div key={i} className="tn-mobile-row">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="tn-type-icon" style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color }}>
                            <i className={tc.icon}></i>
                          </div>
                          <div>
                            <span className="tn-type-label" style={{ color: tc.color }}>{t.type}</span>
                            <p className="tn-detail mb-0">{t.displayType}</p>
                          </div>
                        </div>
                        <div className="text-end">
                          <p className="tn-amount mb-1">{formatCurrency(t.amount)}</p>
                          <span className="tn-status-badge" style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                            {sc.label}
                          </span>
                        </div>
                      </div>
                      <p className="tn-date mb-0">{formatDate(t.date)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default Transactions;
