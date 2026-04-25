import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const OAuth2Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get("error");
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const role = searchParams.get("role") || "ROLE_USER";
    const provider = searchParams.get("provider") || "GOOGLE";
    const name = searchParams.get("name") || "";
    const googleId = searchParams.get("googleId") || "";

    if (error) {
      toast.error("Google login failed. Please try again.");
      navigate("/login", { replace: true });
      return;
    }

    if (!token || !email) {
      toast.error("Invalid Google login response.");
      navigate("/login", { replace: true });
      return;
    }

    const oauthUser = {
      token,
      email,
      role,
      provider,
      name,
      googleId,
      emailVerified: true,
    };

    localStorage.setItem("user", JSON.stringify(oauthUser));
    toast.success("Google login successful!");
    navigate("/dashboard", { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-sm font-medium text-slate-700">Signing you in with Google...</p>
    </div>
  );
};

export default OAuth2Success;
