import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" aria-label="Jobplotter">
          <img src="/jp-logo.png" alt="Jobplotter" className="h-8 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-7">
          <Link to="/" className="text-[13px] font-medium text-slate-600 hover:text-indigo-600 transition-colors">Home</Link>
          <Link to="/jobs" className="text-[13px] font-medium text-slate-600 hover:text-indigo-600 transition-colors">Jobs</Link>
          <Link to="/dashboard" className="text-[13px] font-medium text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</Link>
          <Link to="/builder" className="text-[13px] font-medium text-slate-600 hover:text-indigo-600 transition-colors">Resume Builder</Link>
          <Link to="/review" className="text-[13px] font-medium text-slate-600 hover:text-indigo-600 transition-colors">Review</Link>
          <Link to="/pricing" className="text-[13px] font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="#" className="px-4 py-2 text-[13px] font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
            Log in
          </Link>
          <Link to="/builder" className="px-4 py-2 text-[13px] font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors">
            Sign up
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 -mr-2 text-slate-700 hover:text-slate-900 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50">
          <div className="flex flex-col px-5 py-4 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Home</Link>
            <Link to="/jobs" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Jobs</Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Dashboard</Link>
            <Link to="/builder" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Resume Builder</Link>
            <Link to="/review" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Review</Link>
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">Pricing</Link>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2">
              <Link to="#" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                Log in
              </Link>
              <Link to="/builder" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
