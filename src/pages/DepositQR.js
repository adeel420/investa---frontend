import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import Layout from "../components/Layout";
import { depositService, paymentMethodService } from "../lib/services";
import "./DepositQR.css";

const DepositQR = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const method = searchParams.get("method");
  const amount = searchParams.get("amount");
  const paymentMethodId = searchParams.get("paymentMethodId");

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loadingMethod, setLoadingMethod] = useState(true);

  const [transactionId, setTransactionId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        if (!paymentMethodId) {
          setLoadingMethod(false);
          return;
        }

        setLoadingMethod(true);
        const response = await paymentMethodService.getById(paymentMethodId);
        const methodData = response?.data?.data?.paymentMethod || response?.data?.data?.method || response?.data?.data || null;
        setPaymentMethod(methodData);
      } catch (error) {
        console.error("Fetch payment method error:", error);
        alert("Failed to load payment method details");
      } finally {
        setLoadingMethod(false);
      }
    };

    fetchPaymentMethod();
  }, [paymentMethodId]);

  const paymentValue = useMemo(() => {
    if (!paymentMethod) return "";
    return (
      paymentMethod.walletAddress ||
      paymentMethod.accountNumber ||
      paymentMethod.accountName ||
      ""
    );
  }, [paymentMethod]);

  const paymentLabel = useMemo(() => {
    if (!paymentMethod) return "Payment ID";
    if (paymentMethod.walletAddress) return "Wallet Address";
    if (paymentMethod.accountNumber) return "Account Number";
    if (paymentMethod.accountName) return "Account Name";
    return "Payment ID";
  }, [paymentMethod]);

  const handleCopy = async () => {
    try {
      if (!paymentValue) return;
      await navigator.clipboard.writeText(paymentValue);
      alert(`${paymentLabel} copied successfully`);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Copy failed");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    setSelectedFile(file);
    setUploadedImage(null);
  };

  const handleUploadScreenshot = async () => {
    try {
      if (!selectedFile) {
        alert("Please select a screenshot first");
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      const result = await depositService.uploadScreenshotToImageKit(
        selectedFile,
        (evt) => {
          const progress = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(progress);
        }
      );

      setUploadedImage({
        url: result.url,
        fileId: result.fileId,
        name: result.name,
      });

      alert("Screenshot uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error || "Screenshot upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitDeposit = async () => {
    try {
      if (!amount) {
        alert("Amount is missing");
        return;
      }

      if (!paymentMethodId) {
        alert("Payment method ID is missing");
        return;
      }

      if (!transactionId.trim()) {
        alert("Transaction ID is required");
        return;
      }

      if (!uploadedImage?.url) {
        alert("Please upload screenshot first");
        return;
      }

      setSubmitting(true);

      const payload = {
        amountUSD: Number(amount),
        paymentMethodId,
        transactionId: transactionId.trim(),
        screenshot: uploadedImage.url,
        screenshotFileId: uploadedImage.fileId,
      };

      console.log("Submitting deposit payload:", payload);

      const response = await depositService.create(payload);

      alert(response.data.message || "Deposit request submitted");

      setTransactionId("");
      setSelectedFile(null);
      setUploadedImage(null);
      setUploadProgress(0);

      navigate("/dashboard");
    } catch (error) {
      console.error("Create deposit error:", error);
      alert(error || "Deposit submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Deposit QR Code">
      <div className="dashboard-card text-center">
        <h5 className="text-white mb-4">Complete Your Deposit</h5>

        <p className="text-gray mb-2">
          Payment Method: {paymentMethod?.name || method || "N/A"}
        </p>

        <p className="text-white mb-4">Amount: ${Number(amount || 0).toFixed(2)}</p>

        {loadingMethod ? (
          <div className="mb-4">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : paymentValue ? (
          <>
            <div
              className="mb-4 d-flex justify-content-center"
              style={{
                background: "#fff",
                padding: "16px",
                borderRadius: "12px",
                width: "fit-content",
                margin: "0 auto",
              }}
            >
              <QRCode value={paymentValue} size={220} />
            </div>

            <p className="text-gray small mb-2">
              Scan the QR code to complete your payment
            </p>

            <div
              className="mb-4 text-start"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <label className="form-label text-white fw-bold">
                {paymentLabel}
              </label>

              <div className="d-flex gap-2 align-items-center flex-wrap">
                <input
                  type="text"
                  className="form-control"
                  value={paymentValue}
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={handleCopy}
                >
                  Copy
                </button>
              </div>

              {paymentMethod?.accountName ? (
                <p className="text-gray small mt-2 mb-0">
                  Account Name: {paymentMethod.accountName}
                </p>
              ) : null}

              {paymentMethod?.bankName ? (
                <p className="text-gray small mt-1 mb-0">
                  Bank Name: {paymentMethod.bankName}
                </p>
              ) : null}

              {paymentMethod?.instructions ? (
                <p className="text-gray small mt-2 mb-0">
                  {paymentMethod.instructions}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="qr-placeholder mb-4">
            <i className="fas fa-qrcode fa-5x text-gray"></i>
            <p className="text-gray mt-3">
              No wallet address or account number found for this payment method
            </p>
          </div>
        )}

        <div className="mb-3 text-start">
          <label className="form-label text-white">Transaction ID</label>
          <input
            type="text"
            className="form-control"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID"
          />
        </div>

        <div className="mb-3 text-start">
          <label className="form-label text-white">Upload Screenshot</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && !uploadedImage && (
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleUploadScreenshot}
              disabled={uploading}
            >
              {uploading ? `Uploading ${uploadProgress}%...` : "Upload Screenshot"}
            </button>
          </div>
        )}

        {uploadedImage?.url && (
          <div className="mb-3">
            <p className="text-success">Screenshot uploaded successfully</p>
            <img
              src={uploadedImage.url}
              alt="Deposit screenshot"
              style={{ width: "180px", borderRadius: "8px" }}
            />
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmitDeposit}
          disabled={submitting || uploading || loadingMethod}
        >
          {submitting ? "Submitting..." : "Submit Deposit"}
        </button>
      </div>
    </Layout>
  );
};

export default DepositQR;