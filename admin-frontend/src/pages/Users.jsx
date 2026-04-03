import React, { useEffect, useState } from "react";
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

const API_BASE_URL = "http://localhost:9090/api/v1.0";

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

const resolveUserIdentifier = (user) => {
  if (!user) {
    return "";
  }

  if (user.id !== undefined && user.id !== null && user.id !== "") {
    return String(user.id);
  }

  if (user.userId !== undefined && user.userId !== null && user.userId !== "") {
    return String(user.userId);
  }

  return "";
};

const getResponseErrorMessage = async (response, fallbackMessage) => {
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      if (typeof payload === "string" && payload.trim()) {
        return payload;
      }

      if (payload?.message) {
        return payload.message;
      }

      if (payload?.error) {
        return payload.error;
      }
    } else {
      const text = await response.text();
      if (text?.trim()) {
        return text;
      }
    }
  } catch {
    // Ignore parse failures and use fallback message below.
  }

  return fallbackMessage;
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [promotionSelections, setPromotionSelections] = useState({});
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [actionUserId, setActionUserId] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");

    try {
      const headers = getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Unauthorized: please log in with an admin account"
            : await getResponseErrorMessage(response, "Failed to fetch users")
        );
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const availableRoles = Array.from(
    new Set(users.map((user) => user.role).filter(Boolean))
  );
  const roleFilterOptions = Array.from(
    new Set([...DEFAULT_ROLE_FILTER_OPTIONS, ...availableRoles])
  );

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      user.name?.toLowerCase().includes(normalizedSearchTerm) ||
      user.email?.toLowerCase().includes(normalizedSearchTerm);

    const matchesRole =
      selectedRole === "all" ||
      user.role?.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive !== false).length;
  const inactiveUsers = users.filter((user) => user.isActive === false).length;
  const verifiedUsers = users.filter((user) => Boolean(user.isAccountVerified)).length;

  const handlePromoteRole = async (user) => {
    const targetUserId = resolveUserIdentifier(user);
    const selectedManagerRole = promotionSelections[targetUserId];

    if (!targetUserId) {
      setActionMessage("Unable to update role: invalid user id");
      return;
    }

    if (!selectedManagerRole) {
      setActionMessage("Please choose a role before promoting");
      return;
    }

    setUpdatingUserId(String(targetUserId));
    setActionMessage("");

    try {
      const headers = getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/admin/promote/${encodeURIComponent(targetUserId)}?role=${encodeURIComponent(
          selectedManagerRole
        )}`,
        {
          method: "PUT",
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Unauthorized: admin access required"
            : await getResponseErrorMessage(response, "Failed to update user role")
        );
      }

      await fetchUsers();

      setActionMessage(`Role updated for ${user.name || user.email || "user"}`);
    } catch (err) {
      setActionMessage(err.message || "Unable to update role");
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleUserAction = async ({ user, action }) => {
    const targetUserId = resolveUserIdentifier(user);

    if (!targetUserId) {
      setActionMessage("Unable to process request: invalid user id");
      return;
    }

    setActionUserId(String(targetUserId));
    setActionMessage("");

    try {
      const headers = getAuthHeaders();

      let endpoint = "";
      let method = "PUT";
      const encodedUserId = encodeURIComponent(targetUserId);

      if (action === "activate") {
        endpoint = `${API_BASE_URL}/admin/users/${encodedUserId}/activate`;
      } else if (action === "deactivate") {
        endpoint = `${API_BASE_URL}/admin/users/${encodedUserId}/deactivate`;
      } else if (action === "delete") {
        endpoint = `${API_BASE_URL}/admin/users/${encodedUserId}`;
        method = "DELETE";
      } else {
        throw new Error("Unsupported user action");
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Unauthorized: admin access required"
            : await getResponseErrorMessage(response, `Failed to ${action} user`)
        );
      }

      await fetchUsers();

      setActionMessage(
        action === "delete"
          ? `User deleted: ${user.name || user.email || targetUserId}`
          : `${action === "activate" ? "Activated" : "Deactivated"} ${
              user.name || user.email || "user"
            }`
      );
    } catch (err) {
      setActionMessage(err.message || "Unable to process user action");
    } finally {
      setActionUserId("");
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/55 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              CampusOps Admin
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">
              User Command Center
            </h1>
            <p className="mt-2 text-slate-300">
              Manage account access, role promotions, and lifecycle actions from one place.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
            <FiUsers className="text-cyan-300" />
            {filteredUsers.length} visible users
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Total Users</span>
            <FiUser className="text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{totalUsers}</p>
        </article>

        <article className="rounded-xl border border-emerald-500/35 bg-emerald-500/8 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-300">Active</span>
            <FiActivity className="text-emerald-300" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-200">{activeUsers}</p>
        </article>

        <article className="rounded-xl border border-amber-500/35 bg-amber-500/8 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-300">Inactive</span>
            <FiUserX className="text-amber-300" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-200">{inactiveUsers}</p>
        </article>

        <article className="rounded-xl border border-sky-500/35 bg-sky-500/8 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-sky-300">Verified</span>
            <FiCheckCircle className="text-sky-300" />
          </div>
          <p className="mt-2 text-2xl font-bold text-sky-200">{verifiedUsers}</p>
        </article>
      </section>

      {isLoading && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-6 text-slate-300 backdrop-blur-md">
          Loading users...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 font-medium text-rose-200">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {actionMessage && (
            <p className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              {actionMessage}
            </p>
          )}

          <section className="rounded-2xl border border-slate-700 bg-slate-950/55 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-xl">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name or email"
                  className="w-full rounded-xl border border-slate-600 bg-slate-900/80 py-2.5 pl-10 pr-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <FiShield className="text-cyan-300" />
                <select
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-900/80 py-2.5 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 sm:w-64"
                >
                  <option value="all">All Roles</option>
                  {roleFilterOptions.map((role) => (
                    <option key={role} value={role}>
                      {formatRoleLabel(role)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950/55 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Auth Provider</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Promote</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const userKey = resolveUserIdentifier(user);
                  const isAdmin = user.role === "ROLE_ADMIN";
                  const isActive = user.isActive !== false;
                  const selectedManagerRole =
                    promotionSelections[userKey] || "ROLE_TICKET_MANAGER";

                  return (
                    <tr
                      key={userKey}
                      className="border-t border-slate-800 odd:bg-slate-900/35 even:bg-slate-900/15"
                    >
                      <td className="px-4 py-3 font-medium text-slate-300">{user.id || user.userId}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{user.name}</td>
                      <td className="px-4 py-3 text-slate-300">{user.email}</td>
                      <td className="px-4 py-3 text-slate-300">{formatAuthProviderLabel(user.authProvider)}</td>
                      <td className="px-4 py-3 text-slate-300">{formatCreatedAt(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        {user.isAccountVerified ? (
                          <span className="inline-flex items-center rounded-full border border-sky-400/40 bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-200">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-amber-500/35 bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                          {formatRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="min-w-72 px-4 py-3">
                        {isAdmin ? (
                          <span className="text-xs text-slate-400">Admin role locked</span>
                        ) : (
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <select
                              value={selectedManagerRole}
                              onChange={(event) =>
                                setPromotionSelections((current) => ({
                                  ...current,
                                  [userKey]: event.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-slate-600 bg-slate-900/80 py-2 px-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            >
                              {MANAGER_ROLE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => handlePromoteRole(user)}
                              disabled={updatingUserId === String(userKey)}
                              className="shrink-0 rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-3 py-2 text-cyan-100 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingUserId === String(userKey) ? "Saving..." : "Promote"}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="min-w-72 px-4 py-3">
                        {isAdmin ? (
                          <span className="text-xs text-slate-400">Admin protected</span>
                        ) : (
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleUserAction({ user, action: "deactivate" })}
                                disabled={actionUserId === String(userKey)}
                                className="rounded-lg border border-amber-500/35 bg-amber-500/15 px-3 py-2 text-amber-200 hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleUserAction({ user, action: "activate" })}
                                disabled={actionUserId === String(userKey)}
                                className="rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-3 py-2 text-emerald-200 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Activate
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleUserAction({ user, action: "delete" })}
                              disabled={actionUserId === String(userKey)}
                              className="rounded-lg border border-rose-500/35 bg-rose-500/15 px-3 py-2 text-rose-200 hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                      <div className="inline-flex items-center gap-2">
                        <FiUserCheck className="text-slate-500" />
                        No users match your filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
};

export default Users;
