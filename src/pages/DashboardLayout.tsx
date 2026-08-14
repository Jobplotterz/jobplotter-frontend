import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Briefcase, ClipboardList, LogOut, Settings, User, X, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Builder", href: "/dashboard/builder", icon: FileText },
    { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { name: "Applications", href: "/dashboard/applications", icon: ClipboardList },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard" && location.pathname !== "/dashboard") return false;
    return location.pathname.startsWith(path);
  };

  const NavContent = () => (
    <>
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/jp-logo.png" alt="Jobplotter" className="h-8 w-auto object-contain" />
        </Link>
        <button
          className="md:hidden ml-auto p-2 text-slate-500 hover:text-slate-700"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 bg-slate-50 ring-1 ring-slate-100 rounded-2xl p-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden shrink-0">
            {user?.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              {user?.email || "Signed in"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-3">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 shrink-0 transition-colors ${
                    active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-200 space-y-1">
        <Link
          to="/dashboard/settings"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`group w-full flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
            isActive("/dashboard/settings")
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Settings className={`w-5 h-5 mr-3 shrink-0 transition-colors ${isActive("/dashboard/settings") ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2.5 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3 shrink-0" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex h-full overflow-hidden">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
          <button 
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/jp-logo.png" alt="Jobplotter" className="h-7 w-auto object-contain" />
          </Link>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
