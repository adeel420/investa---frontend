import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import './Security.css';

const Security = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('Jessica@gmail.com');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Add floating animation to cards
    const cards = document.querySelectorAll('.security-card');
    cards.forEach((card, index) => {
      card.style.animation = `fadeInUp 0.8s ease-out ${index * 0.1}s both`;
    });
  }, []);

  const goToStep2 = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    setCurrentStep(2);
  };

  const goBackToStep1 = () => {
    setCurrentStep(1);
  };

  const sendVerificationCode = () => {
    setCurrentStep(3);
    alert('Verification code sent to your email!');
  };

  const goBackToStep2 = () => {
    setCurrentStep(2);
  };

  const verifyOTP = (e) => {
    e.preventDefault();
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      alert('OTP verified successfully!');
      // Reset to step 1
      setCurrentStep(1);
      setOtp('');
    } else {
      alert('Please enter a valid 6-digit OTP');
    }
  };

  return (
    <Layout title="Withdraw Security">
      <div className="p-4 d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="security-card">
          {/* Progress Steps */}
          <div className="progress-steps">
            <div className="progress-line"></div>
            
            {/* Step 1 */}
            <div className="step">
              <div className={`step-number ${currentStep >= 1 ? 'active' : 'inactive'}`}>1</div>
              <div className={`step-label ${currentStep >= 1 ? 'active' : ''}`}>Enter Email</div>
            </div>
            
            {/* Step 2 */}
            <div className="step">
              <div className={`step-number ${currentStep >= 2 ? 'active' : 'inactive'}`}>2</div>
              <div className={`step-label ${currentStep >= 2 ? 'active' : ''}`}>Send OTP</div>
            </div>
            
            {/* Step 3 */}
            <div className="step">
              <div className={`step-number ${currentStep >= 3 ? 'active' : 'inactive'}`}>3</div>
              <div className={`step-label ${currentStep >= 3 ? 'active' : ''}`}>Verify OTP</div>
            </div>
          </div>

          {/* Icon */}
          <div className="icon-circle">
            <i className="far fa-envelope"></i>
          </div>

          {/* Step 1: Enter Email */}
          {currentStep === 1 && (
            <div id="step1">
              <div className="form-group">
                <h4 className="text-white text-center fw-bold mb-2">Enter Your Email</h4>
                <p className="text-gray text-center mb-4">Enter your email to set up withdrawal security</p>

                <label className="form-label">Email Address</label>
                <div className="position-relative">
                  <i className="far fa-envelope input-icon"></i>
                  <input
                    type="email"
                    id="emailInput"
                    className="form-input form-input-with-icon"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button className="btn-continue" onClick={goToStep2}>Continue</button>
            </div>
          )}

          {/* Step 2: Send OTP */}
          {currentStep === 2 && (
            <div id="step2">
              <h4 className="text-white text-center fw-bold mb-2">Verify Your Email</h4>
              <p className="text-gray text-center mb-2">We'll send a verification code to your email address</p>
              <p className="text-white text-center fw-bold mb-4" id="displayEmail">{email}</p>

              <button className="btn-continue mb-3" onClick={sendVerificationCode}>Send Verification Code</button>
              <button className="btn-outline" onClick={goBackToStep1}>Change Email</button>
            </div>
          )}

          {/* Step 3: Verify OTP */}
          {currentStep === 3 && (
            <div id="step3">
              <h4 className="text-white text-center fw-bold mb-2">Enter Verification Code</h4>
              <p className="text-gray text-center mb-4">Please enter the 6-digit code sent to your email</p>

              <form onSubmit={verifyOTP}>
                <div className="form-group">
                  <label className="form-label">OTP Code</label>
                  <div className="position-relative">
                    <i className="fas fa-key input-icon"></i>
                    <input
                      type="text"
                      id="otpInput"
                      className="form-input form-input-with-icon"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength="6"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-continue mb-3">Verify OTP</button>
                <button type="button" className="btn-outline" onClick={goBackToStep2}>Resend Code</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Security;
