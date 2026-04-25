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
