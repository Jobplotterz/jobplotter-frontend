import { Link } from "react-router-dom";
import { Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 pt-16 pb-8 mt-12 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img src="/jp-logo.png" alt="Jobplotter" className="h-9 w-auto object-contain" />
            </div>
            <p className="text-slate-500 text-[13px] leading-relaxed max-w-xs">
              The intelligent way to navigate the modern job market. Plot your path to the perfect role with data-driven matches, ATS-ready resumes, and strategic insights.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-[11px] tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-[13px] text-slate-500">
              <li><Link to="/" className="hover:text-indigo-600 transition-colors">How it works</Link></li>
              <li><Link to="/jobs" className="hover:text-indigo-600 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/builder" className="hover:text-indigo-600 transition-colors">Resume Builder</Link></li>
              <li><Link to="/review" className="hover:text-indigo-600 transition-colors">Resume Review</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-[11px] tracking-wider uppercase mb-4">Job Seekers</h4>
            <ul className="space-y-2.5 text-[13px] text-slate-500">
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">Career Advice</Link></li>
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">Salary Guide</Link></li>
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">Interview Prep</Link></li>
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">ATS Tips</Link></li>
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-[11px] tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-[13px] text-slate-500">
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">About</Link></li>
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-slate-400">&copy; {new Date().getFullYear()} Jobplotter. Built for the future of work.</p>
          <div className="flex items-center gap-3">
            <Link to="#" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Linkedin className="w-3.5 h-3.5" />
            </Link>
            <Link to="#" aria-label="Twitter" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Twitter className="w-3.5 h-3.5" />
            </Link>
            <Link to="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Instagram className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
