import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import PublicNavbar from "./components/PublicNavbar";
import PrivateNavbar from "./components/PrivateNavbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import OAuth2Success from "./pages/OAuth2Success";
import VerifyEmail from "./pages/VerifyEmail";

const App = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation(); // React Router hook
  const hideNavbarPaths = ["/login", "/oauth2/success", "/verify-email"];
  const hideFooterPaths = ["/login", "/oauth2/success", "/verify-email"];

  const isEmailVerified = (userData) => {
    const value =
      userData?.emailVerified ??
      userData?.isEmailVerified ??
      userData?.verified ??
      userData?.isVerified ??
      userData?.isAccountVerified ??
      userData?.accountVerified;

    return value === true || value === "true";
  };

  const hasVerifiedUser = user && isEmailVerified(user);

  // Decide whether to show navbar
  const showNavbar = !hideNavbarPaths.includes(location.pathname);
  const showFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <>
      {/* Navbar switch */}
      {showNavbar && (user ? <PrivateNavbar /> : <PublicNavbar />)}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to={hasVerifiedUser ? "/dashboard" : "/verify-email"} replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={
            !user ? <Navigate to="/login" replace /> : hasVerifiedUser ? <Dashboard /> : <Navigate to="/verify-email" replace />
          }
        />
        <Route
          path="/verify-email"
          element={
            !user ? <Navigate to="/login" replace /> : hasVerifiedUser ? <Navigate to="/dashboard" replace /> : <VerifyEmail />
          }
        />
        <Route path="/oauth2/success" element={<OAuth2Success />} />

        <Route path="/reset-password" element={<ResetPassword />} />

      </Routes>

      {showFooter && <Footer />}
    </>
  );
};

export default App;
