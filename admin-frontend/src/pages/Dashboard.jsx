import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiBookOpen,
  FiCalendar,
  FiChevronRight,
  FiLogOut,
  FiTag,
  FiUsers,
  FiHome,
} from "react-icons/fi";
import { MdOutlineMeetingRoom } from "react-icons/md";
import logo from "../assets/logo.png";

const navigationItems = [

   {
    to: "/admin/home",
    label: "Home",
    icon: FiHome,
    roles: ["ROLE_ADMIN"],
  },
  {
    to: "/admin/users",
    label: "User Management",
    icon: FiUsers,
    roles: ["ROLE_ADMIN"],
  },
  {
    to: "/admin/tickets",
    label: "Tickets",
    icon: FiTag,
    roles: ["ROLE_ADMIN", "ROLE_TICKET_MANAGER"],
  },
  {
    to: "/admin/booking",
    label: "Booking",
    icon: FiBookOpen,
    roles: ["ROLE_ADMIN", "ROLE_BOOKING_MANAGER"],
  },

   {
    to: "/admin/facilities",
    label: "Facilities",
    icon: MdOutlineMeetingRoom,
    roles: ["ROLE_ADMIN", "ROLE_FACILITIES_MANAGER", "ROLE_FACILITY_MANAGER"],
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole") || "";
  const visibleNavigationItems = navigationItems.filter((item) =>
    item.roles.includes(role)
  );
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");

    // redirect to login
    navigate("/admin/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-8 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 -translate-y-16 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-400 gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:gap-6 lg:px-6 lg:py-6">
        <aside className="w-20 lg:w-72 shrink-0 rounded-3xl border border-slate-700/70 bg-slate-950/60 backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.45)] px-2 py-3 sm:px-3 sm:py-4 lg:px-5 lg:py-6">
          <div className="flex items-center gap-3 px-2 lg:px-0">
            <div className="h-10 w-10 overflow-hidden rounded-2xl border border-cyan-300/40 bg-slate-900 ring-2 ring-cyan-400/20">
              <img
                src={logo}
                alt="CampusOps logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden lg:block">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">CampusOps</p>
              <h1 className="text-lg font-extrabold text-white">Admin Panel</h1>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {visibleNavigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "group flex items-center justify-center lg:justify-between gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-linear-to-r from-cyan-500/20 to-sky-500/20 text-cyan-100 border border-cyan-300/30 shadow-[0_0_24px_rgba(6,182,212,0.15)]"
                        : "text-slate-300 hover:bg-white/8 hover:text-white",
                    ].join(" ")
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon className="text-base" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </span>
                  <FiChevronRight className="hidden lg:inline text-xs opacity-70" />
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-slate-700/70 pt-4">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center lg:justify-between gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-rose-200 font-semibold hover:bg-rose-500/20 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                <FiLogOut />
                <span className="hidden lg:inline">Logout</span>
              </span>
              <span className="hidden lg:inline text-xs opacity-80">Secure Exit</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-3xl border border-slate-700/70 bg-slate-950/55 backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.45)] overflow-hidden">
          <header className="border-b border-slate-700/70 bg-slate-900/40 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/75">Operations Dashboard</p>
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Control Room</h2>
                <p className="mt-1 text-sm text-slate-300">Command visibility across users, tickets, booking, and facilities.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
                  <FiCalendar className="text-cyan-300" />
                  {todayLabel}
                </div>
                <div className="inline-flex items-center rounded-xl border border-slate-600 bg-slate-800/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200">
                  {role.replace("ROLE_", "").replaceAll("_", " ") || "Admin"}
                </div>
              </div>
            </div>
          </header>

          <section className="p-4 sm:p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
