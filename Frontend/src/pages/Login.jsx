import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FiArrowLeft, FiHome, FiMail, FiLock, FiUser } from "react-icons/fi";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
 const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const isSubmitDisabled =
    !form.email.trim() ||
    !form.password.trim() ||
    (!isLogin && !form.name.trim());

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) {
      setError("");
    }
    if (success) {
      setSuccess("");
    }
  };

   const getErrorMessage = (err, fallback) => {
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }
    if (typeof err?.response?.data === "string") {
      return err.response.data;
    }
    return fallback;
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

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/25"
      >
        <FiArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      {/* Form Container */}
      <div className="relative w-full max-w-sm rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl backdrop-blur-md flex flex-col items-center">
        
        {/* Logo */}
        <img src={assets.logo} alt="Logo" className="mb-4 h-14" />

        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700">
          <FiHome className="h-3.5 w-3.5" />
          Secure Access Portal
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-slate-900 text-center">
          {isLogin ? "Sign In" : "Sign Up"}
        </h2>

        <p className="mb-5 text-center text-xs text-slate-500">
          {isLogin
            ? "Welcome back. Enter your details to continue."
            : "Create your account to access the dashboard."}
        </p>

        {/* Form */}
        <form className="w-full flex flex-col gap-3">
          
          {!isLogin && (
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-600"
              />
            </div>
          )}

          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-600"
            />
          </div>

          {/* Forgot Password */}
          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                className="text-xs text-cyan-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            className={`rounded-lg p-2.5 text-sm text-white font-semibold ${
              isLogin
                ? "bg-cyan-700 hover:bg-cyan-600"
                : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-4 text-center text-xs text-gray-500">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-700 font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>

        {/* Social */}
        <div className="mt-5 flex w-full flex-col gap-2.5">
          <button className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-gray-100">
            <FcGoogle />
            Continue with Google
          </button>

          <button className="flex items-center justify-center gap-2 rounded-lg border bg-gray-100 px-4 py-2.5 text-sm font-semibold hover:bg-gray-200">
            <FaGithub />
            Continue with GitHub
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
