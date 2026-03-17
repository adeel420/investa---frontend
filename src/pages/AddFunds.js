import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { depositService, paymentMethodService } from "../lib/services";
import "../pages/Dashboard.css";
import "./AddFunds.css";

const AddFunds = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [selectedMethod, setSelectedMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [depositHistory, setDepositHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
    fetchDepositHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setMethodDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentMethodService.getActive();
      let methodsData =
        response.data?.data?.methods ||
        response.data?.methods ||
        (Array.isArray(response.data) ? response.data : []);
      setPaymentMethods(
        methodsData.map((pm) => ({
          id: pm._id,
          name: pm.name,
          icon: pm.type === "crypto" ? "fab fa-bitcoin" : "fas fa-university",
          bgClass: pm.type === "crypto" ? "bg-crypto" : "bg-bank",
          details: pm.details,
          image: pm.image || pm.logo || pm.iconUrl || "",
        })),
      );
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    }
  };

  const fetchDepositHistory = async () => {
    try {
      setLoading(true);
      const response = await depositService.getMyDeposits();
      setDepositHistory(response.data?.data?.deposits || []);
    } catch (err) {
      console.error("Failed to fetch deposit history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (methodId) => {
    if (!amount || parseFloat(amount) < 2) {
      alert("Please enter a valid deposit amount first (Min: $2).");
      return;
    }
    setSelectedMethod(methodId);
    setMethodDropdownOpen(false);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    if (!e.target.value) setSelectedMethod("");
  };

  const handleContinue = () => {
    if (!amount || parseFloat(amount) < 2) {
      alert("Minimum deposit amount is $2.");
      return;
    }
    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }
    const method = paymentMethods.find((pm) => pm.id === selectedMethod);
    navigate(
      `/deposit-qr?method=${encodeURIComponent(method?.name || "Payment Method")}&amount=${amount}&paymentMethodId=${selectedMethod}`,
    );
  };

  const filteredHistory =
    historyFilter === "all"
      ? depositHistory
      : depositHistory.filter((d) => {
          const days = parseInt(historyFilter, 10);
          return (new Date() - new Date(d.createdAt)) / 86400000 <= days;
        });

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const formatDetailLabel = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const selectedMethodDetails = paymentMethods.find(
    (pm) => pm.id === selectedMethod,
  );

  const statusColor = {
    PENDING: "#f59e0b",
    APPROVED: "#10b981",
    REJECTED: "#ef4444",
  };

  return (
    <Layout title="Add Funds">
      <div className="p-4">
        <div className="row g-4">
          {/* LEFT — Deposit Form */}
          <div className="col-lg-6">
            <div className="dashboard-card">
              {/* Card header */}
              <div className="tx-card-title-wrap mb-4">
                <div className="tx-card-icon">
                  <i className="fas fa-arrow-circle-up"></i>
                </div>
                <div>
                  <h5 className="tx-card-title">Make a Deposit</h5>
                  <p className="tx-card-sub">Min deposit: $2.00</p>
                </div>
              </div>

              {/* Amount input */}
              <div className="mb-4">
                <label className="af-label">Deposit Amount</label>
                <div className="af-input-wrap">
                  <span className="af-input-prefix">$</span>
                  <input
                    type="number"
                    className="af-input"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                    min="2"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Payment method dropdown */}
              <div className="mb-4" ref={dropdownRef} style={{ position: 'relative', zIndex: 100 }}>
                <label className="af-label">Payment Method</label>
                {paymentMethods.length === 0 ? (
                  <div className="af-empty-methods">
                    <i className="fas fa-credit-card"></i>
                    <span>No payment methods available</span>
                  </div>
                ) : (
                  <div className="af-dropdown" style={{ zIndex: 9999 }}>
                    <div
                      className={`af-dropdown-trigger ${methodDropdownOpen ? "open" : ""}`}
                      onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
                    >
                      <div className="d-flex align-items-center gap-3 flex-grow-1">
                        {selectedMethodDetails ? (
                          <>
                            {selectedMethodDetails.image ? (
                              <img
                                src={selectedMethodDetails.image}
                                alt={selectedMethodDetails.name}
                                className="af-method-img"
                              />
                            ) : (
                              <div
                                className={`af-method-icon ${selectedMethodDetails.bgClass}`}
                              >
                                <i className={selectedMethodDetails.icon}></i>
                              </div>
                            )}
                            <span className="af-method-name">
                              {selectedMethodDetails.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="af-method-icon af-method-icon-default">
                              <i className="fas fa-wallet"></i>
                            </div>
                            <span className="af-placeholder-text">
                              Choose payment method
                            </span>
                          </>
                        )}
                      </div>
                      <i
                        className={`fas fa-chevron-down af-chevron ${methodDropdownOpen ? "rotate" : ""}`}
                      ></i>
                    </div>

                    {methodDropdownOpen && (
                      <div className="af-dropdown-menu">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`af-dropdown-item ${selectedMethod === method.id ? "selected" : ""}`}
                            onClick={() => handleMethodSelect(method.id)}
                          >
                            {method.image ? (
                              <img
                                src={method.image}
                                alt={method.name}
                                className="af-method-img"
                              />
                            ) : (
                              <div
                                className={`af-method-icon ${method.bgClass}`}
                              >
                                <i className={method.icon}></i>
                              </div>
                            )}
                            <span className="af-method-name">
                              {method.name}
                            </span>
                            {selectedMethod === method.id && (
                              <i className="fas fa-check af-check"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected method details */}
              {selectedMethodDetails && (
                <div className="af-method-details">
                  <div className="af-method-details-header">
                    {selectedMethodDetails.image ? (
                      <img
                        src={selectedMethodDetails.image}
                        alt={selectedMethodDetails.name}
                        className="af-method-img"
                      />
                    ) : (
                      <div
                        className={`af-method-icon ${selectedMethodDetails.bgClass}`}
                      >
                        <i className={selectedMethodDetails.icon}></i>
                      </div>
                    )}
                    <div>
                      <p className="af-method-details-name">
                        {selectedMethodDetails.name}
                      </p>
                      <p className="af-method-details-sub">
                        Selected payment method
                      </p>
                    </div>
                  </div>

                  {selectedMethodDetails.details && (
                    <div className="af-details-grid">
                      {Object.entries(selectedMethodDetails.details).map(
                        ([key, value]) => (
                          <div key={key} className="af-detail-row">
                            <span className="af-detail-key">
                              {formatDetailLabel(key)}
                            </span>
                            <span className="af-detail-val">
                              {String(value)}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <button className="af-continue-btn" onClick={handleContinue}>
                    <i className="fas fa-arrow-right me-2"></i>Continue to
                    Payment
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Instructions + History */}
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
                  <h5 className="tx-card-title">Deposit Instructions</h5>
                  <p className="tx-card-sub">Please read before depositing</p>
                </div>
              </div>
              <ul className="af-instruction-list">
                <li>
                  <i className="fas fa-clock"></i>If the transfer time is up,
                  please fill out the deposit form again.
                </li>
                <li>
                  <i className="fas fa-equals"></i>The amount you send must be
                  the same as your order.
                </li>
                <li>
                  <i className="fas fa-exclamation-triangle"></i>Don't cancel
                  the deposit after sending the money.
                </li>
                <li>
                  <i className="fas fa-dollar-sign"></i>Minimum deposit is $2.00
                </li>
              </ul>
            </div>

            {/* Deposit History */}
            <div className="dashboard-card">
              <div className="tx-card-header">
                <div className="tx-card-title-wrap">
                  <div className="tx-card-icon">
                    <i className="fas fa-history"></i>
                  </div>
                  <div>
                    <h5 className="tx-card-title">Deposit History</h5>
                    <p className="tx-card-sub">
                      {filteredHistory.length} records
                    </p>
                  </div>
                </div>
                <select
                  className="wallet-filter-select"
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
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
              ) : filteredHistory.length === 0 ? (
                <div className="tx-empty">
                  <i className="fas fa-inbox"></i>
                  <p>No deposit history found!</p>
                </div>
              ) : (
                <div className="af-history-list">
                  {filteredHistory.map((deposit, index) => (
                    <div key={deposit._id || index} className="af-history-row">
                      <div className="af-history-left">
                        <div className="tx-type-icon deposit">
                          <i className="fas fa-arrow-down"></i>
                        </div>
                        <div>
                          <p className="af-history-amount">
                            +${Number(deposit.amountUSD || 0).toFixed(2)}
                          </p>
                          <p className="af-history-method">
                            {deposit.paymentMethod?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="af-history-right">
                        <span
                          className="af-status-badge"
                          style={{
                            color: statusColor[deposit.status] || "#64748b",
                            borderColor:
                              statusColor[deposit.status] || "#64748b",
                          }}
                        >
                          {deposit.status}
                        </span>
                        <p className="af-history-date">
                          {formatDate(deposit.createdAt)}
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

export default AddFunds;
