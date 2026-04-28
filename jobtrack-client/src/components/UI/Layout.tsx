import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  IconBriefcase,
  IconLayoutKanban,
  IconChartBar,
  IconLogout,
} from "@tabler/icons-react";
import { useAuthStore } from "../../store/authStore";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { to: "/board", icon: <IconLayoutKanban size={16} />, label: "Board" },
  { to: "/dashboard", icon: <IconChartBar size={16} />, label: "Dashboard" },
];

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const initials = [user?.first_name[0], user?.last_name[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen bg-surface-secondary overflow-hidden">
      <aside className="w-56 bg-surface border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-border">
          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <IconBriefcase
              size={16}
              className="text-brand-600"
              aria-hidden="true"
            />
            JobTrack
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Job search tracker</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-2">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-500 hover:bg-surface-secondary hover:text-gray-700"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-4 py-3 border-t border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-medium flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Logout"
          >
            <IconLogout size={16} />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
