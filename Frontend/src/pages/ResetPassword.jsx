import React, { useState } from "react";
import API from "../api";
import toast from "react-hot-toast";
import { FiLock, FiMail } from "react-icons/fi";
import assets from "../assets/assets";

//  OTP Circle Input Component
const OTPInput = ({ length = 6, value, onChange }) => {
  const handleInput = (e, idx) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // only digits
    const newVal = value.split("");
    newVal[idx] = val;
    onChange(newVal.join(""));
    // auto focus next
    if (val && idx < length - 1) {
      const nextInput = document.getElementById(`otp-${idx + 1}`);
      nextInput?.focus();
    }
    // auto backspace focus
    if (!val && idx > 0) {
      const prevInput = document.getElementById(`otp-${idx - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 mb-4">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          id={`otp-${idx}`}
          type="text"
          maxLength={1}
          value={value[idx] || ""}
          onChange={(e) => handleInput(e, idx)}
          className="w-12 h-12 text-center rounded-full border border-gray-400 text-lg font-semibold focus:border-cyan-600 focus:ring-1 focus:ring-cyan-400 outline-none"
        />
      ))}
    </div>
  );
};

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err, fallback) => {
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }
    if (typeof err?.response?.data === "string") {
      return err.response.data;
    }
    return fallback;
  };

  //  Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required!");
    setLoading(true);
    try {
      await API.post(`/send-reset-otp?email=${email}`, { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  //  Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return toast.error("Enter full 6-digit OTP");
    if (!password.trim()) return toast.error("Password is required");
    setLoading(true);
    try {
      await API.post("/reset-password", {
        email,
        otp,
        newPassword: password,
      });
      toast.success("Password reset successful!");
      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-6"
      style={{
        backgroundImage: `url(${assets.logo_back})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-sm bg-white/95 p-6 rounded-xl shadow-lg backdrop-blur-md z-10">
        <img src={assets.logo} alt="Logo" className="h-14 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-center mb-4">
          {step === 1 ? "Reset Password" : "Enter OTP & New Password"}
        </h2>
        <p className="text-center text-sm text-gray-600 mb-4">
          {step === 1
            ? "Enter your registered email to receive OTP."
            : "Enter the OTP sent to your email and set new password."}
        </p>

        {/* STEP 1 - Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 - OTP + New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
            <OTPInput length={6} value={otp} onChange={setOtp} />
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
