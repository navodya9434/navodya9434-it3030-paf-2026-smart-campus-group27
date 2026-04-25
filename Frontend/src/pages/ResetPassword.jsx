import React, { useState } from "react";
import { FiLock, FiMail } from "react-icons/fi";
import assets from "../assets/assets";

// OTP UI Component (no logic)
const OTPInput = ({ length = 6 }) => {
  return (
    <div className="flex justify-center gap-2 mb-4">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center rounded-full border border-gray-400 text-lg font-semibold focus:border-cyan-600 outline-none"
        />
      ))}
    </div>
  );
};

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


const ResetPassword = () => {
  const [step, setStep] = useState(1); // only UI toggle

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

        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-cyan-600 text-white py-2 rounded-lg font-semibold"
            >
              Send OTP
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <OTPInput length={6} />

            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="New Password"
                className="w-full pl-10 pr-3 py-2 border rounded-lg"
              />
            </div>

            <button
              type="button"
              className="bg-green-600 text-white py-2 rounded-lg font-semibold"
            >
              Reset Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
