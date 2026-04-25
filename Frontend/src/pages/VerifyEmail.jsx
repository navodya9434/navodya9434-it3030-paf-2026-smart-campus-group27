import React, { useState } from "react";
import { logo_back } from "../assets/assets";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

    useEffect(() => {
    const sendOtp = async () => {
      if (!storedUser?.email) {
        navigate("/login", { replace: true });
        return;
      }

      setSendingOtp(true);
      try {
        await API.post(`/send-otp?email=${encodeURIComponent(storedUser.email)}`);
        toast.success("OTP sent to your email");
      } catch (err) {
        const message = err?.response?.data?.message || err?.response?.data || "Failed to send OTP";
        toast.error(message);
      } finally {
        setSendingOtp(false);
      }
    };

    sendOtp();
  }, [navigate, storedUser?.email]);



  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{
        backgroundImage: `url(${logo_back})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.3),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(14,116,144,0.35),transparent_52%)]" />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/25 bg-white/10 p-7 text-white shadow-[0_20px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        
        <h1 className="text-2xl font-bold">Verify Your Email</h1>

        <p className="mt-2 text-sm text-slate-100/90">
          Enter the 6-digit OTP sent to{" "}
          <span className="font-semibold text-white">
            user@example.com
          </span>
        </p>

        {/* Form */}
        <div className="mt-6 space-y-4">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            className="w-full rounded-xl border border-white/35 bg-white/85 px-4 py-3 text-center text-lg tracking-[0.25em] text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300"
            placeholder="000000"
          />

          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110"
          >
            Verify Email
          </button>
        </div>

        {/* Resend */}
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-white/35 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
