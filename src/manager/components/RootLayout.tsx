import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Users, FileText, Calendar, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth/auth";

export function RootLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/accounts", icon: Users, label: "Accounts" },
    { path: "/demand-letter", icon: FileText, label: "Demand Letter" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ backgroundColor: "#1C4D8D" }}
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 border-r border-[#163e72] transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b border-[#163e72]">
            <div className="flex items-center justify-between">
              <img src="/logo.png" alt="SynCollect" className="w-full h-auto object-contain object-left" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-blue-200 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20 text-white font-semibold"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#163e72]">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-blue-100 border border-blue-400 rounded-lg hover:bg-white/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
