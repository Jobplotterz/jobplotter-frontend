import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="flex items-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 max-w-7xl mx-auto gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0 mr-auto md:mr-0" aria-label="Jobplotter">
          <img src="/jp-logo.png" alt="Jobplotter" className="h-8 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 ml-8">
          <Link to="/pricing" className="text-[14px] font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
          <Link to="/features" className="text-[14px] font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {isAuthenticated ? (
            <Link to="/dashboard" className="flex items-center gap-2 px-6 py-2.5 text-[14px] font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-5 py-2.5 text-[14px] font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="px-6 py-2.5 text-[14px] font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-50 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col px-6 py-6 space-y-4">
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="text-base font-semibold text-slate-900 py-2">Pricing</Link>
            <Link to="/features" onClick={() => setMobileOpen(false)} className="text-base font-semibold text-slate-900 py-2">Features</Link>
            
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full px-6 py-3 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg">
                  <LayoutDashboard className="w-5 h-5" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full text-center px-6 py-3 text-base font-bold text-slate-900 bg-slate-100 rounded-xl hover:bg-slate-200">
                    Log in
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="w-full text-center px-6 py-3 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
