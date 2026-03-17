import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../lib/services";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    countryCode: "+92",
    phone: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [forgotData, setForgotData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refFromUrl = params.get("ref")?.trim();

    if (refFromUrl) {
      setIsLogin(false);
      setFormData((prev) => ({
        ...prev,
        referralCode: refFromUrl,
      }));
    }
  }, [location.search]);

  const phoneLengths = {
    "+92": 10,
    "+1": 10,
    "+44": 10,
    "+971": 9,
    "+91": 10,
    "+966": 9,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        phone: digitsOnly,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleForgotChange = (e) => {
    setForgotData({
      ...forgotData,
      [e.target.name]: e.target.value,
    });
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep(1);
    setForgotError("");
    setForgotSuccess("");
    setForgotData({
      email: formData.email || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotLoading(false);
    setForgotError("");
    setForgotSuccess("");
    setForgotData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const validatePhoneByCountry = (countryCode, phone) => {
    const cleanPhone = phone.replace(/\D/g, "").replace(/^0+/, "");

    const rules = {
      "+92": /^3\d{9}$/,
      "+1": /^\d{10}$/,
      "+44": /^\d{10}$/,
      "+971": /^5\d{8}$/,
      "+91": /^[6-9]\d{9}$/,
      "+966": /^5\d{8}$/,
    };

    const regex = rules[countryCode];

    if (!regex) {
      return cleanPhone.length >= 6 && cleanPhone.length <= 15;
    }

    return regex.test(cleanPhone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        navigate("/dashboard");
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const cleanedPhone = formData.phone.replace(/\D/g, "").replace(/^0+/, "");

        if (!validatePhoneByCountry(formData.countryCode, cleanedPhone)) {
          setError("Please enter a valid phone number for the selected country");
          setLoading(false);
          return;
        }

        const registerData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: `${formData.countryCode}${cleanedPhone}`,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          referralCode: formData.referralCode?.trim() || undefined,
        };

        await register(registerData);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setForgotError("");
    setForgotSuccess("");

    if (!forgotData.email.trim()) {
      setForgotError("Please enter your email");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await authService.forgotPasswordSendOtp({
        email: forgotData.email,
      });

      setForgotSuccess(
        response?.data?.message || "OTP sent successfully to your email."
      );
      setForgotStep(2);
    } catch (err) {
      setForgotError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setForgotError("");
    setForgotSuccess("");

    if (!forgotData.otp.trim()) {
      setForgotError("Please enter OTP");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await authService.forgotPasswordVerifyOtp({
        email: forgotData.email,
        otp: forgotData.otp,
      });

      setForgotSuccess(response?.data?.message || "OTP verified successfully.");
      setForgotStep(3);
    } catch (err) {
      setForgotError(
        err?.response?.data?.message ||
          err?.message ||
          "Invalid OTP. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotError("");
    setForgotSuccess("");

    if (!forgotData.newPassword || !forgotData.confirmPassword) {
      setForgotError("Please fill all password fields");
      return;
    }

    if (forgotData.newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters");
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setForgotError("Passwords do not match");
      return;
    }

    try {
      setForgotLoading(true);

      const response = await authService.forgotPasswordReset({
        email: forgotData.email,
        password: forgotData.newPassword,
        confirmPassword: forgotData.confirmPassword,
      });

      setForgotSuccess(
        response?.data?.message || "Password reset successfully."
      );

      setTimeout(() => {
        closeForgotModal();
      }, 1200);
    } catch (err) {
      setForgotError(
        err?.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="text-center mb-4">
          <div className="login-icon">
            <img
              src="https://ik.imagekit.io/b6iqka2sz/WhatsApp%20Image%202026-03-10%20at%203.42.10%20AM.jpeg"
              alt="Investa Logo"
              className="login-logo"
            />
          </div>
        </div>

        {error && (
          <div
            className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        {isLogin ? (
          <form id="loginForm" onSubmit={handleSubmit}>
            <h5 className="mb-4 text-white">Login</h5>

            <div className="mb-3">
              <label htmlFor="loginEmail" className="form-label">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  id="loginEmail"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="loginPassword"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <p
              onClick={openForgotModal}
              className="text-white/50 hover:underline cursor-pointer mb-4 text-sm text-end"
            >
              Forgot Password?
            </p>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-right me-2"></i>Login
                </>
              )}
            </button>

            <p className="mt-3 mb-0 text-center">
              <span className="text-white/50">New user?</span>
              <span className="register-link" onClick={() => setIsLogin(false)}>
                Register
              </span>
            </p>
          </form>
        ) : (
          <form id="registerForm" onSubmit={handleSubmit}>
            <h5 className="mb-4 text-white">Register</h5>

            <div className="mb-3">
              <label htmlFor="registerName" className="form-label">
                Full Name
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="registerName"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="registerEmail" className="form-label">
                Email Address
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  id="registerEmail"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="registerPhone" className="form-label">
                Phone Number
              </label>
              <div className="input-group phone-group">
                <span className="input-group-text">
                  <i className="fas fa-phone"></i>
                </span>

                <select
                  className="phone-country-code"
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  required
                >
                  <option value="+92">+92</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+971">+971</option>
                  <option value="+91">+91</option>
                  <option value="+966">+966</option>
                </select>

                <input
                  type="tel"
                  className="form-control phone-number-input"
                  id="registerPhone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={phoneLengths[formData.countryCode] || 15}
                  required
                />
              </div>

              <small className="text-white/50">
                {formData.countryCode === "+92" && "Example: 3451234567"}
                {formData.countryCode === "+1" && "Example: 5551234567"}
                {formData.countryCode === "+44" && "Example: 7123456789"}
                {formData.countryCode === "+971" && "Example: 501234567"}
                {formData.countryCode === "+91" && "Example: 9876543210"}
                {formData.countryCode === "+966" && "Example: 512345678"}
              </small>
            </div>

            <div className="mb-3">
              <label htmlFor="registerReferralCode" className="form-label">
                Referral Code (Optional)
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-gift"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="registerReferralCode"
                  name="referralCode"
                  placeholder="Enter referral code (optional)"
                  value={formData.referralCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="registerPassword" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="registerPassword"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="registerConfirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="registerConfirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>Creating
                  Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus me-2"></i>Create Account
                </>
              )}
            </button>

            <p className="mt-3 mb-0 text-center">
              <span className="text-white/50">Already have an account?</span>
              <span className="register-link" onClick={() => setIsLogin(true)}>
                Login
              </span>
            </p>
          </form>
        )}
      </div>

      {showForgotModal && (
        <div className="forgot-modal-overlay" onClick={closeForgotModal}>
          <div
            className="forgot-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="forgot-modal-close"
              onClick={closeForgotModal}
            >
              <i className="fas fa-times"></i>
            </button>

            <h4 className="text-white mb-3">Forgot Password</h4>

            <div className="forgot-steps mb-4">
              <div className={`forgot-step ${forgotStep >= 1 ? "active" : ""}`}>
                1
              </div>
              <div
                className={`forgot-step-line ${forgotStep >= 2 ? "active" : ""}`}
              ></div>
              <div className={`forgot-step ${forgotStep >= 2 ? "active" : ""}`}>
                2
              </div>
              <div
                className={`forgot-step-line ${forgotStep >= 3 ? "active" : ""}`}
              ></div>
              <div className={`forgot-step ${forgotStep >= 3 ? "active" : ""}`}>
                3
              </div>
            </div>

            {forgotError && (
              <div className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 && (
              <>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="Enter your email"
                      value={forgotData.email}
                      onChange={handleForgotChange}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="login-btn"
                  onClick={handleSendOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>Sending OTP...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>Continue
                    </>
                  )}
                </button>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <div className="mb-3">
                  <label className="form-label">Enter OTP</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-shield-alt"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="otp"
                      placeholder="Enter OTP"
                      value={forgotData.otp}
                      onChange={handleForgotChange}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="forgot-secondary-btn"
                    onClick={() => setForgotStep(1)}
                    disabled={forgotLoading}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="login-btn"
                    onClick={handleVerifyOtp}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Verifying...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>Verify OTP
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      placeholder="Enter new password"
                      value={forgotData.newPassword}
                      onChange={handleForgotChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={forgotData.confirmPassword}
                      onChange={handleForgotChange}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="forgot-secondary-btn"
                    onClick={() => setForgotStep(2)}
                    disabled={forgotLoading}
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    className="login-btn"
                    onClick={handleResetPassword}
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key me-2"></i>Reset Password
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
