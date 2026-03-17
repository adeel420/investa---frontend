import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { planService, investmentService } from "../lib/services";
import "../pages/Dashboard.css";
import "./InvestmentPlans.css";

const InvestmentPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investAmount, setInvestAmount] = useState("");
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planService.getAll();
      setPlans(response.data.data.plans || []);
    } catch (err) {
      setError("Failed to load investment plans");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInvesting = (plan) => {
    setSelectedPlan(plan);
    setInvestAmount(plan.min.toString());
    setShowInvestModal(true);
  };

  const handleInvest = async () => {
    if (!selectedPlan || !investAmount) return;
    const amount = parseFloat(investAmount);
    if (amount < selectedPlan.min) {
      alert(`Minimum investment is $${selectedPlan.min}`);
      return;
    }
    if (amount > selectedPlan.max) {
      alert(`Maximum investment is $${selectedPlan.max}`);
      return;
    }
    try {
      setInvesting(true);
      await investmentService.create({ planId: selectedPlan._id, amount });
      alert("Investment created successfully!");
      setShowInvestModal(false);
      setInvestAmount("");
      setSelectedPlan(null);
    } catch (err) {
      alert(err.message || "Failed to create investment");
    } finally {
      setInvesting(false);
    }
  };

  const formatCurrency = (amount) => `$${Number(amount).toLocaleString()}`;

  const getPlanIcon = (name) => {
    const icons = {
      Lithium: "fas fa-battery-full",
      Gold: "fas fa-coins",
      Platinum: "fas fa-crown",
      Diamond: "fas fa-gem",
      Silver: "fas fa-medal",
      Bronze: "fas fa-award",
    };
    return icons[name] || "fas fa-chart-line";
  };

  // alternate teal/gold accent per card
  const getAccent = (index) => (index % 2 === 0 ? "teal" : "gold");

  if (loading)
    return (
      <Layout title="Investment Plans">
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
    <Layout title="Investment Plans">
      <div className="p-4">
        {/* Page header */}
        <div className="ip-page-header mb-4">
          <div className="tx-card-title-wrap">
            <div className="tx-card-icon">
              <i className="fas fa-chart-pie"></i>
            </div>
            <div>
              <h4 className="tx-card-title" style={{ fontSize: "20px" }}>
                Investment Plans
              </h4>
              <p className="tx-card-sub">
                Choose a plan and start earning daily returns
              </p>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger mb-4">{error}</div>}

        {/* Plans grid — 2 per row */}
        <div className="row g-4">
          {plans.length === 0 ? (
            <div className="col-12">
              <div className="tx-empty">
                <i className="fas fa-inbox"></i>
                <p>No investment plans available at the moment.</p>
              </div>
            </div>
          ) : (
            plans.map((plan, index) => {
              const accent = getAccent(index);
              return (
                <div key={plan._id || index} className="col-12 col-md-6">
                  <div
                    className={`ip-plan-card ip-accent-${accent}`}
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    {/* Top: icon + name + badge */}
                    <div className="ip-plan-top">
                      <div className={`ip-plan-icon ip-icon-${accent}`}>
                        <i className={getPlanIcon(plan.name)}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="ip-plan-name">{plan.name}</h5>
                        <span className={`ip-plan-badge ip-badge-${accent}`}>
                          {plan.capitalReturn
                            ? "Principal Return Included"
                            : "No Principal Return"}
                        </span>
                      </div>
                      {/* <div className="ip-roi-pill">
                        <span className="ip-roi-value">
                          {plan.dailyProfit}%
                        </span>
                        <span className="ip-roi-label">Daily</span>
                      </div> */}
                    </div>

                    {/* Stats row */}
                    <div className="ip-stats-row">
                      <div className="ip-stat ip-stat-left">
                        <p className="ip-stat-label">Range</p>
                        <p className="ip-stat-value text-nowrap d-flex align-items-center ">
                          {formatCurrency(plan.min)} -{" "}
                          {formatCurrency(plan.max)}
                          {"  "}
                          <p className="ip-stat-sub">Min</p>
                        </p>
                      </div>
                      <div className="ip-stat-divider"></div>
                      <div className="ip-stat ip-stat-right">
                        <p className="ip-stat-label">
                          <span className="ip-stat-value">
                            ROI {plan.dailyProfit}%
                          </span>{" "}
                          <span className="ip-stat-sub">Daily</span>
                        </p>
                        <p className="ip-stat-value">
                          {(plan.dailyProfit / 24).toFixed(3)}%{" "}
                          <span className="ip-stat-sub">/ Hourly</span>
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="ip-btn-row">
                      <button
                        className="btn-primary-dash flex-fill"
                        onClick={() => handleStartInvesting(plan)}
                        disabled={!plan.active}
                      >
                        <i className="fas fa-bolt me-2"></i>
                        {plan.active ? "Start Investing" : "Inactive"}
                      </button>
                      <button
                        className="btn-secondary-dash flex-fill"
                        onClick={() => navigate("/add-funds")}
                      >
                        <i className="fas fa-plus me-2"></i>Deposit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && selectedPlan && (
        <div
          className="ip-modal-overlay"
          onClick={() => setShowInvestModal(false)}
        >
          <div className="ip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ip-modal-header">
              <div className="tx-card-title-wrap">
                <div className="tx-card-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div>
                  <h5 className="tx-card-title">
                    Invest in {selectedPlan.name}
                  </h5>
                  <p className="tx-card-sub">
                    Min: {formatCurrency(selectedPlan.min)} · Max:{" "}
                    {formatCurrency(selectedPlan.max)}
                  </p>
                </div>
              </div>
              <button
                className="ip-modal-close"
                onClick={() => setShowInvestModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="ip-modal-body">
              <label className="af-label">Investment Amount</label>
              <div className="af-input-wrap mb-3">
                <span className="af-input-prefix">$</span>
                <input
                  type="number"
                  className="af-input"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  min={selectedPlan.min}
                  max={selectedPlan.max}
                  placeholder="Enter amount"
                />
              </div>

              <div className="ip-modal-stats">
                <div className="ip-modal-stat">
                  <span className="ip-stat-label">Daily Return</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>
                    {selectedPlan.dailyProfit}%
                  </span>
                </div>
                <div className="ip-modal-stat">
                  <span className="ip-stat-label">Hourly Return</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>
                    {(selectedPlan.dailyProfit / 24).toFixed(4)}%
                  </span>
                </div>
                <div className="ip-modal-stat">
                  <span className="ip-stat-label">Duration</span>
                  <span style={{ color: "#f1f5f9", fontWeight: 700 }}>
                    {selectedPlan.duration} days
                  </span>
                </div>
              </div>
            </div>

            <div className="ip-modal-footer">
              <button
                className="ip-btn-cancel"
                onClick={() => setShowInvestModal(false)}
                disabled={investing}
              >
                Cancel
              </button>
              <button
                className="ip-btn-confirm"
                onClick={handleInvest}
                disabled={investing || !investAmount}
              >
                {investing ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>Confirm Investment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default InvestmentPlans;
