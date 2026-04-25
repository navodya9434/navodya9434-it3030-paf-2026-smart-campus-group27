import React, { useState } from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiSearch,
  FiShield,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiUsers,
} from "react-icons/fi";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const MANAGER_ROLE_OPTIONS = [
  { value: "ROLE_TICKET_MANAGER", label: "Ticket Manager" },
  { value: "ROLE_BOOKING_MANAGER", label: "Booking Manager" },
  { value: "ROLE_FACILITIES_MANAGER", label: "Facilities Manager" },
  { value: "ROLE_USER", label: "User" },
];

const DEFAULT_ROLE_FILTER_OPTIONS = [
  "ROLE_TICKET_MANAGER",
  "ROLE_FACILITIES_MANAGER",
  "ROLE_FACILITY_MANAGER",
];

const getAuthHeaders = () => {
  const rawToken =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken");
  if (!rawToken) {
    return {};
  }

  const normalizedToken = rawToken.replace(/^Bearer\s+/i, "").trim();
  if (!normalizedToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${normalizedToken}`,
  };
};

const formatRoleLabel = (role) => {
  if (!role) {
    return "-";
  }

  return role
    .replace("ROLE_", "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatAuthProviderLabel = (provider) => {
  if (!provider || typeof provider !== "string") {
    return "Local";
  }

  const normalizedProvider = provider.trim().toUpperCase();
  if (normalizedProvider === "GOOGLE") {
    return "Google";
  }

  if (normalizedProvider === "LOCAL") {
    return "Local";
  }

  return provider
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatCreatedAt = (createdAtValue) => {
  if (!createdAtValue) {
    return "-";
  }

  const parsedDate = new Date(createdAtValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};


  const formatRole = (role) =>
    role.replace("ROLE_", "").toLowerCase();

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* HEADER */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h1 className="text-3xl font-bold">User Command Center</h1>
        <p className="text-slate-400 mt-2">
          Manage users from one place
        </p>
        <div className="mt-3 flex items-center gap-2 text-cyan-300">
          <FiUsers />
          {filteredUsers.length} users
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800 rounded-xl">
          <FiUser />
          <p>{totalUsers}</p>
        </div>
        <div className="p-4 bg-green-800 rounded-xl">
          <FiActivity />
          <p>{activeUsers}</p>
        </div>
        <div className="p-4 bg-yellow-800 rounded-xl">
          <FiUserX />
          <p>{inactiveUsers}</p>
        </div>
        <div className="p-4 bg-blue-800 rounded-xl">
          <FiCheckCircle />
          <p>{verifiedUsers}</p>
        </div>
      </section>

      {/* FILTER */}
      <section className="flex gap-3">
        <div className="relative w-full">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 py-2 rounded-lg bg-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="bg-slate-800 rounded-lg px-3"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="all">All</option>
          <option value="ROLE_USER">User</option>
          <option value="ROLE_ADMIN">Admin</option>
        </select>
      </section>

      {/* TABLE */}
      <section className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-slate-700">
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{formatRole(user.role)}</td>
                <td>
                  {user.isActive ? "Active" : "Inactive"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* EMPTY */}
      {filteredUsers.length === 0 && (
        <div className="text-center text-slate-400">
          <FiUserCheck className="inline mr-2" />
          No users found
        </div>
      )}
    </div>
  );
};

export default Users;
