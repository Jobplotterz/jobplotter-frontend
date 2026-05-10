import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Briefcase, Star, LogOut, Settings, User, X, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasResumes, setHasResumes] = useState<boolean>(false);
  
  useEffect(() => {
    const checkResumes = async () => {
      try {
        const token = localStorage.getItem("jobplotter_token");
        if (!token) return;
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setHasResumes(data.length > 0);
        }
      } catch (e) {
        console.error("Failed to check resumes in sidebar", e);
      }
    };
    checkResumes();
  }, [location.pathname]); // Re-check on navigation in case they just added one

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Builder", href: "/dashboard/builder", icon: FileText },
    { name: "Job Matches", href: "/dashboard/jobs", icon: Briefcase },
    ...(hasResumes ? [{ name: "Resume Review", href: "/dashboard/review", icon: Star }] : []),
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
          className="md:hidden ml-auto p-2 text-slate-500"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 py-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            {user?.image ? (
              <img src={user.image} alt="" className="w-10 h-10 rounded-full" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || "Signed in"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 shrink-0 ${
                    active ? "text-indigo-600" : "text-slate-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200 space-y-1">
        <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <Settings className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
          Settings
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 mr-3 text-red-500 shrink-0" />
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
