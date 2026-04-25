import React, { useState, useEffect } from "react";
import { FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Bell } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import API from "../api";
import toast from "react-hot-toast";

const PrivateNavbar = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const resolveEmailVerified = (data, fallback = false) => {
    const value =
      data?.emailVerified ??
      data?.isEmailVerified ??
      data?.verified ??
      data?.isVerified ??
      data?.isAccountVerified ??
      data?.accountVerified;
    if (value === undefined || value === null) return fallback;
    return value === true || value === "true";
  };

  const [user, setUser] = useState(storedUser || null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(resolveEmailVerified(storedUser));
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Home" },
    { to: "/user-booking", label: "Booking" },
    { to: "/user-ticket", label: "Create Ticket" },
    { to: "/user-service", label: "Services" },
    { to: "/user-report", label: "Reports" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.email) return;
      try {
        const res = await API.get("/profile");
        const verifiedFromApi = resolveEmailVerified(res.data, resolveEmailVerified(user));
        const refreshedUser = {
          ...user,
          ...res.data,
          emailVerified: verifiedFromApi,
        };
        setUser(refreshedUser);
        setEmailVerified(verifiedFromApi);
        if (verifiedFromApi) {
          setShowOtpInput(false);
          setOtp("");
        }
        localStorage.setItem("user", JSON.stringify(refreshedUser));
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchUser();
  }, []);

  const handleVerifyClick = async () => {
    if (emailVerified) {
      setShowOtpInput(false);
      setOtp("");
      toast("Email is already verified");
      return;
    }

    try {
      await API.post(`/send-otp?email=${encodeURIComponent(user.email)}`);
      toast.success("OTP sent to your email!");
      setShowOtpInput(true);
    } catch (err) {
      toast.error(err.response?.data || "Failed to send OTP");
    }
  };

  const handleOtpVerify = async () => {
    if (emailVerified) {
      setShowOtpInput(false);
      setOtp("");
      toast("Email is already verified");
      return;
    }

    if (otp.length < 6) return toast.error("Enter full 6-digit OTP");
    setVerifying(true);
    try {
      await API.post("/verify-otp", { email: user.email, otp });
      toast.success("Email verified successfully!");
      const updatedUser = { ...user, emailVerified: true };
      setUser(updatedUser);
      setEmailVerified(true);
      setShowOtpInput(false);
      setOtp("");
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      toast.error(err.response?.data || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 sm:text-sm">
            <FaPhone className="h-4 w-4" />
            <span>+(94) 776-957-704</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <FaFacebook className="h-4 w-4 cursor-pointer transition hover:text-blue-600 sm:h-5 sm:w-5" />
            <FaTwitter className="h-4 w-4 cursor-pointer transition hover:text-sky-500 sm:h-5 sm:w-5" />
            <FaInstagram className="h-4 w-4 cursor-pointer transition hover:text-pink-600 sm:h-5 sm:w-5" />
            <FaLinkedin className="h-4 w-4 cursor-pointer transition hover:text-blue-700 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          {/* LEFT - Logo */}
          <div className="flex items-center gap-3">
            <img src={assets.logo} alt="Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">CampusOpsHub</h1>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">User Portal</p>
            </div>
          </div>

          {/* CENTER - Links */}
          <div className="order-3 flex w-full flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 lg:order-none lg:w-auto lg:gap-3 lg:bg-transparent lg:p-0 lg:border-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-white hover:text-cyan-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* RIGHT - Notification + Profile Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification */}
            <div className="relative cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">3</span>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-sm font-bold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user?.name || user?.email.split("@")[0]}</span>
                <FiChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                  <div className="flex flex-col p-2">
                    <span className="px-3 py-1 text-xs text-slate-500">Account</span>

                    {emailVerified && (
                      <span className="mt-1 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                        Email Verified
                      </span>
                    )}
                   

                    {!emailVerified && !showOtpInput && (
                      <button
                        onClick={handleVerifyClick}
                        className="mt-1 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        Verify Email
                      </button>
                    )}
                    {!emailVerified && showOtpInput && (
                      <div className="mt-1 flex items-center gap-1.5 px-3 py-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="w-16 rounded-md border border-slate-300 px-1.5 py-1 text-center text-sm outline-none focus:border-cyan-500"
                          placeholder="OTP"
                        />
                        <button
                          onClick={handleOtpVerify}
                          disabled={verifying}
                          className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:bg-emerald-300"
                        >
                          {verifying ? "Verifying..." : "Verify"}
                        </button>
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PrivateNavbar;
