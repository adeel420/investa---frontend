import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import {
  withdrawalService,
  withdrawalMethodService,
  walletService,
} from "../lib/services";
import "../pages/Dashboard.css";
import "./WithdrawFunds.css";

const WithdrawFunds = () => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [successMsg, setSuccessMsg] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
    fetchWalletBalance();
    fetchWithdrawHistory();
  }, [filterPeriod]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await withdrawalMethodService.getActive();
      const methods = (response.data.data.methods || []).map((pm) => ({
        id: pm._id,
        name: pm.name,
        type: pm.type,
        minAmount: pm.minAmount || 0,
        maxAmount: pm.maxAmount || 0,
        instructions: pm.instructions || "",
        icon:
          pm.type === "crypto"
            ? "fab fa-bitcoin"
            : pm.type === "bank"
              ? "fas fa-university"
              : "fas fa-wallet",
        bgColor:
          pm.type === "crypto"
            ? "bg-crypto"
            : pm.type === "bank"
              ? "bg-bank"
              : "bg-wallet",
      }));
      setPaymentMethods(methods);
    } catch (err) {
      console.error("Failed to fetch withdrawal methods:", err);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletService.getBalance();
      setWalletBalance(response.data.data.walletBalance || 0);
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    }
  };

  const fetchWithdrawHistory = async () => {
    try {
      setLoading(true);
      const response = await withdrawalService.getMyWithdrawals();
      let withdrawals = response.data.data.withdrawals || [];
      if (filterPeriod !== "all") {
        const cutoff = new Date(
          new Date().getTime() - parseInt(filterPeriod) * 86400000,
        );
        withdrawals = withdrawals.filter(
          (w) => new Date(w.createdAt) >= cutoff,
        );
      }
      withdrawals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setWithdrawHistory(withdrawals);
    } catch (err) {
      console.error("Failed to fetch withdraw history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountInput = (e) => {
    let value = e.target.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) value = parts[0] + "." + parts[1];
    if (parts[1]?.length > 2) value = parts[0] + "." + parts[1].substring(0, 2);
    setWithdrawAmount(value);
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method");
      return;
    }
    const amt = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(amt) || amt <= 0) {
      alert("Please enter a valid withdrawal amount");
      return;
    }
    if (amt < 10) {
      alert("Minimum withdrawal amount is $10");
      return;
    }
    if (amt > walletBalance) {
      alert("Insufficient wallet balance");
      return;
    }
    if (!withdrawAddress.trim()) {
      alert("Please enter your wallet address");
      return;
    }

    try {
      setSubmitting(true);
      await withdrawalService.create({
        amountUSD: amt,
        withdrawalMethodId: selectedMethod,
        withdrawAddress: withdrawAddress.trim(),
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      setWithdrawAmount("");
      setWithdrawAddress("");
      setSelectedMethod("");
      fetchWithdrawHistory();
      fetchWalletBalance();
    } catch (err) {
      alert(err || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const statusColor = {
    PENDING: "#f59e0b",
    pending: "#f59e0b",
    APPROVED: "#10b981",
    approved: "#10b981",
    REJECTED: "#ef4444",
    rejected: "#ef4444",
  };

  return (
    <Layout title="Withdraw Funds">
      <div className="p-4">
        <div className="row g-4">
          {/* LEFT col */}
          <div className="col-lg-6">
            {/* Balance card */}
            <div className="bc-card mb-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="bc-label mb-1">Available Balance</p>
                  <h2 className="bc-amount mb-0">
                    ${walletBalance.toFixed(2)}
                  </h2>
                </div>
                <button
                  className="wf-refresh-btn"
                  onClick={() => {
                    fetchWalletBalance();
                    fetchWithdrawHistory();
                  }}
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>

            {/* Withdraw form */}
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
                  <i className="fas fa-arrow-circle-down"></i>
                </div>
                <div>
                  <h5 className="tx-card-title">Withdraw Funds</h5>
                  <p className="tx-card-sub">Min withdrawal: $10.00</p>
                </div>
              </div>

              {/* Payment methods */}
              <div className="mb-4">
                <label className="af-label">Select Payment Method</label>
                {paymentMethods.length === 0 ? (
                  <div className="af-empty-methods">
                    <i className="fas fa-credit-card"></i>
                    <span>No payment methods available</span>
                  </div>
                ) : (
                  <div className="wf-methods-list">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`wf-method-item ${selectedMethod === method.id ? "selected" : ""}`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className={`af-method-icon ${method.bgColor}`}>
                          <i className={method.icon}></i>
                        </div>
                        <span className="af-method-name">{method.name}</span>
                        {selectedMethod === method.id && (
                          <i className="fas fa-check-circle wf-check"></i>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="mb-3">
                <label className="af-label">Amount (USD)</label>
                <div className="af-input-wrap">
                  <span className="af-input-prefix">$</span>
                  <input
                    type="text"
                    className="af-input"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={handleAmountInput}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="af-label">Wallet / Account Address</label>
                <input
                  type="text"
                  className="af-input"
                  style={{ paddingLeft: "18px" }}
                  placeholder="Enter your wallet address"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                />
              </div>

              {/* Submit */}
              <button
                className="wf-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-arrow-right me-2"></i>Submit Withdrawal
                  </>
                )}
              </button>

              {successMsg && (
                <div className="wf-success-msg">
                  <i className="fas fa-check-circle me-2"></i>Withdrawal request
                  submitted successfully!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT col */}
          <div className="col-lg-6">
            {/* Instructions */}
            <div className="dashboard-card mb-4">
              <div className="tx-card-title-wrap mb-4">
                <div
                  className="tx-card-icon"
                  style={{
                    background: "rgba(206,159,42,0.1)",
                    border: "1px solid rgba(206,159,42,0.25)",
                    color: "#ce9f2a",
                  }}
                >
                  <i className="fas fa-info-circle"></i>
                </div>
                <div>
                  <h5 className="tx-card-title">Withdrawal Instructions</h5>
                  <p className="tx-card-sub">Please read carefully</p>
                </div>
              </div>
              <ul className="af-instruction-list">
                <li>
                  <i className="fas fa-shield-alt"></i>Double-check your wallet
                  or account details before submitting. Incorrect details may
                  result in permanent loss of funds.
                </li>
                <li className=" ">
                  <i className="fas fa-clock"></i>{" "}
                  <span>
                    Withdrawals are typically processed within{" "}
                    <b style={{ color: "#0FD9CD" }} className="text-nowrap ">
                      24 hours
                    </b>{" "}
                    on business days.
                  </span>
                </li>
                <li>
                  <i className="fas fa-dollar-sign"></i>Minimum withdrawal
                  amount is:<b style={{ color: "#0FD9CD" }}>$10.00</b>
                </li>
              </ul>
            </div>

            {/* Withdraw History */}
            <div className="dashboard-card">
              <div className="tx-card-header">
                <div className="tx-card-title-wrap">
                  <div className="tx-card-icon">
                    <i className="fas fa-history"></i>
                  </div>
                  <div>
                    <h5 className="tx-card-title">Withdrawal History</h5>
                    <p className="tx-card-sub">
                      {withdrawHistory.length} records
                    </p>
                  </div>
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

              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border"
                    style={{ color: "#0FD9CD" }}
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : withdrawHistory.length === 0 ? (
                <div className="tx-empty">
                  <i className="fas fa-inbox"></i>
                  <p>No withdrawal history found!</p>
                </div>
              ) : (
                <div className="af-history-list">
                  {withdrawHistory.map((w, i) => (
                    <div key={i} className="af-history-row">
                      <div className="af-history-left">
                        <div className="tx-type-icon withdrawal">
                          <i className="fas fa-arrow-up"></i>
                        </div>
                        <div>
                          <p
                            className="af-history-amount"
                            style={{ color: "#ce9f2a" }}
                          >
                            -${Number(w.amountUSD || 0).toFixed(2)}
                          </p>
                          <p className="af-history-method">
                            {w.withdrawalMethodId?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="af-history-right">
                        <span
                          className="af-status-badge"
                          style={{
                            color: statusColor[w.status] || "#64748b",
                            borderColor: statusColor[w.status] || "#64748b",
                          }}
                        >
                          {w.status}
                        </span>
                        <p className="af-history-date">
                          {formatDate(w.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WithdrawFunds;
