import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminDashboard from "./pages/Dashboard";

// child pages
import UserManagement from "./pages/Users";
import Tickets from "./pages/Tickets";
import Booking from "./pages/Booking";
import Facilities from "./pages/Facilities";

const ROLE_ADMIN = "ROLE_ADMIN";
const ROLE_BOOKING_MANAGER = "ROLE_BOOKING_MANAGER";
const ROLE_TICKET_MANAGER = "ROLE_TICKET_MANAGER";
const ROLE_FACILITIES_MANAGER = "ROLE_FACILITIES_MANAGER";

const getToken = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("jwtToken");

const getRole = () => {
  const role = localStorage.getItem("userRole") || "";
  if (role === "ROLE_FACILITY_MANAGER") {
    return ROLE_FACILITIES_MANAGER;
  }
  return role;
};

const getDefaultRouteForRole = (role) => {
  if (role === ROLE_ADMIN) return "/admin/home";
  if (role === ROLE_BOOKING_MANAGER) return "/admin/booking";
  if (role === ROLE_TICKET_MANAGER) return "/admin/tickets";
  if (role === ROLE_FACILITIES_MANAGER) return "/admin/facilities";
  return "/admin/login";
};

function RequireAuth({ children }) {
  const token = getToken();
  const role = getRole();

  if (!token || !role) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function RequireRole({ allowedRoles, children }) {
  const role = getRole();

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return children;
}


function App() {
  const role = getRole();
  const defaultRoute = getDefaultRouteForRole(role);

  return (
    <Routes>
      {/* redirect root */}
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      {/* login */}
      <Route path="/admin/login" element={<Login />} />

      {/* dashboard layout with sidebar */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminDashboard />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to={defaultRoute} replace />} />
        <Route
          path="home"
          element={
            <RequireRole allowedRoles={[ROLE_ADMIN]}>
              <Home />
            </RequireRole>
          }
        />
        <Route
          path="users"
          element={
            <RequireRole allowedRoles={[ROLE_ADMIN]}>
              <UserManagement />
            </RequireRole>
          }
        />
        <Route
          path="booking"
          element={
            <RequireRole allowedRoles={[ROLE_ADMIN, ROLE_BOOKING_MANAGER]}>
              <Booking />
            </RequireRole>
          }
        />
        <Route
          path="tickets"
          element={
            <RequireRole allowedRoles={[ROLE_ADMIN, ROLE_TICKET_MANAGER]}>
              <Tickets />
            </RequireRole>
          }
        />
        <Route
          path="facilities"
          element={
            <RequireRole allowedRoles={[ROLE_ADMIN, ROLE_FACILITIES_MANAGER]}>
              <Facilities />
            </RequireRole>
          }
        />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

export default App;
