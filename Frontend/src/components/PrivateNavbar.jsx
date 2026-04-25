import React from "react";
import { FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Bell } from "lucide-react";
import { FiChevronDown } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import assets from "../assets/assets";

const PrivateNavbar = () => {
  const navItems = [
    { to: "/dashboard", label: "Home" },
    { to: "/user-booking", label: "Booking" },
    { to: "/user-ticket", label: "Create Ticket" },
    { to: "/user-service", label: "Services" },
    { to: "/user-report", label: "Reports" },
  ];

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
            <FaFacebook className="h-4 w-4 cursor-pointer hover:text-blue-600" />
            <FaTwitter className="h-4 w-4 cursor-pointer hover:text-sky-500" />
            <FaInstagram className="h-4 w-4 cursor-pointer hover:text-pink-600" />
            <FaLinkedin className="h-4 w-4 cursor-pointer hover:text-blue-700" />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={assets.logo} alt="Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-black text-slate-900">CampusOpsHub</h1>
              <p className="text-[11px] font-semibold uppercase text-cyan-700">
                User Portal
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-cyan-600 hover:text-white"
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            
            {/* Notification */}
            <div className="relative cursor-pointer rounded-xl border p-2 text-slate-700">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                3
              </span>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white">
                U
              </div>
              <span className="text-sm">Username</span>
              <FiChevronDown className="h-4 w-4" />
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default PrivateNavbar;
