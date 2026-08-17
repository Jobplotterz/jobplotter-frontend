import { useState, useEffect } from "react";
import {
  FileText, Sparkles, Plus, Upload, LayoutDashboard, Briefcase, X, Pencil, Clock,
  Search, ScanSearch, ArrowUpRight, ArrowRight, ClipboardList, CalendarCheck, Award, Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ResumePreview } from "@/components/ResumePreview";
import { CompanyLogo } from "@/components/CompanyLogo";
import { initialResumeData, ResumeData } from "@/types";

type ActiveTab = "overview" | "resumes";

function parseResumeData(resume: any): ResumeData {
  if (resume?.extractedData && typeof resume.extractedData === "object") {
    return { ...initialResumeData, ...resume.extractedData };
  }
  if (resume?.data && typeof resume.data === "string") {
    try {
      return { ...initialResumeData, ...JSON.parse(resume.data) };
    } catch {
      // fall through
    }
  }
  return initialResumeData;
}

export function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [previewResume, setPreviewResume] = useState<any | null>(null);

  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [isVisitsLoading, setIsVisitsLoading] = useState(true);

  const [applications, setApplications] = useState<any[]>([]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/applications/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    }
  };

  const fetchRecentVisits = async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/jobs/visited`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecentVisits(data);
      }
    } catch (error) {
      console.error("Failed to fetch recent visits:", error);
    } finally {
      setIsVisitsLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchRecentVisits();
    fetchApplications();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeResume = resumes.find((r) => r.isDefault) || resumes[0];

  const firstName = user?.name?.split(" ")[0] || "there";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  const statusCounts = applications.reduce(
    (acc: Record<string, number>, a: any) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    { saved: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0 }
  );
  const trackedTotal = applications.length;
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 4);

  const STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
    saved: { label: "Saved", chip: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
    applied: { label: "Applied", chip: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
    interviewing: { label: "Interviewing", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    offer: { label: "Offer", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    rejected: { label: "Rejected", chip: "bg-red-50 text-red-700", dot: "bg-red-400" }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 py-8 pb-14 font-sans text-slate-900">
      {resumes.length === 0 ? (
        /* EMPTY STATE */
        <div className="py-12">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-50 -ml-32 -mb-32" />
            
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 animate-bounce">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Welcome to your new career HQ, {user?.name?.split(' ')[0] || 'there'}!
              </h1>
              
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                JobPlotter uses AI to match your unique skills with the perfect startup roles. To get started, upload your resume and watch the magic happen.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12">
                <div 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Import Resume</h3>
                  <p className="text-sm text-slate-500">PDF or DOCX. We'll parse it and build your AI profile instantly.</p>
                </div>
                
                <Link to="/dashboard/builder" className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-left hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-pink-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Interactive Builder</h3>
                  <p className="text-sm text-slate-500">Don't have a file? Use our intelligent builder to create one from scratch.</p>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link 
                  to="/dashboard/builder" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Plus className="w-5 h-5" /> Start Building
                </Link>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Upload className="w-5 h-5" /> Upload File
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DASHBOARD STATE */
        <>
          {/* Page header */}
          <section className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-slate-200/70">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-400">{todayStr}</p>
              <h1 className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-slate-900 mt-1 truncate">
                {greeting}, {firstName}
              </h1>
              <p className="text-sm text-slate-500 mt-1">Here's where your job search stands today.</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/dashboard/jobs"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Search className="w-4 h-4" /> Find Jobs
              </Link>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Resume
              </button>
            </div>
          </section>

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
            {[
              { label: "Tracked jobs", value: trackedTotal, icon: ClipboardList, tint: "bg-indigo-50 text-indigo-600", href: "/dashboard/applications" },
              { label: "Applications sent", value: statusCounts.applied + statusCounts.interviewing + statusCounts.offer, icon: Briefcase, tint: "bg-sky-50 text-sky-600", href: "/dashboard/applications" },
              { label: "Interviews", value: statusCounts.interviewing, icon: CalendarCheck, tint: "bg-amber-50 text-amber-600", href: "/dashboard/applications" },
              { label: "Offers", value: statusCounts.offer, icon: Award, tint: "bg-emerald-50 text-emerald-600", href: "/dashboard/applications" }
            ].map(({ label, value, icon: Icon, tint, href }) => (
              <Link
                key={label}
                to={href}
                className="group bg-white rounded-2xl border border-slate-200/70 p-4 sm:p-5 hover:border-indigo-200 hover:shadow-md hover:shadow-slate-900/5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <p className="text-[12px] font-semibold text-slate-500">{label}</p>
                  <div className={`w-8 h-8 rounded-lg ${tint} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[26px] font-extrabold text-slate-900 leading-none mt-2 font-departure">{value}</p>
              </Link>
            ))}
          </div>

          {/* Pipeline strip */}
          {trackedTotal > 0 && (
            <Link
              to="/dashboard/applications"
              className="mt-4 flex flex-col gap-3 bg-white rounded-2xl border border-slate-200/70 p-4 sm:px-5 hover:border-indigo-200 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-slate-500">Application pipeline</p>
                <span className="text-[12px] font-bold text-indigo-600 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open tracker <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                {(["saved", "applied", "interviewing", "offer", "rejected"] as const).map((s) =>
                  statusCounts[s] > 0 ? (
                    <div
                      key={s}
                      className={`${STATUS_META[s].dot} h-full`}
                      style={{ width: `${(statusCounts[s] / trackedTotal) * 100}%` }}
                    />
                  ) : null
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                {(["saved", "applied", "interviewing", "offer", "rejected"] as const).map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`} />
                    {STATUS_META[s].label} <span className="text-slate-900 font-bold">{statusCounts[s]}</span>
                  </span>
                ))}
              </div>
            </Link>
          )}

          <div className="mt-10 mb-6">
            <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Overview
              </button>
              <button
                onClick={() => setActiveTab("resumes")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === "resumes"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> My Resumes
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === "resumes" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>{resumes.length}</span>
              </button>
            </div>
          </div>

          {activeTab === "overview" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left: activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent applications */}
                <section className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900">Recent applications</h2>
                    <Link to="/dashboard/applications" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  {recentApplications.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-500">Nothing tracked yet.</p>
                      <p className="text-xs text-slate-400 mt-1">Save or apply to a job and it will show up here.</p>
                      <Link
                        to="/dashboard/jobs"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-3"
                      >
                        Browse jobs <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {recentApplications.map((app) => {
                        const job = app.job || {};
                        const meta = STATUS_META[app.status] || STATUS_META.saved;
                        const updated = app.updatedAt
                          ? new Date(app.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                          : "";
                        return (
                          <li key={app._id}>
                            <Link
                              to="/dashboard/applications"
                              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                            >
                              <CompanyLogo company={job.company} logo={job.logo} className="w-9 h-9" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-900 truncate">{job.title || "Untitled role"}</p>
                                <p className="text-[12px] text-slate-500 truncate">
                                  {job.company || "Unknown company"} &bull; {job.location || "Anywhere"}
                                </p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${meta.chip}`}>
                                {meta.label}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400 shrink-0 w-14 text-right hidden sm:block">{updated}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                {/* Recently viewed jobs */}
                <section className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900">Recently viewed jobs</h2>
                    {recentVisits.length > 0 && (
                      <Link to="/dashboard/jobs" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                        View all <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                  {isVisitsLoading ? (
                    <div className="p-6 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : recentVisits.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-500">No recently viewed jobs yet.</p>
                      <Link
                        to="/dashboard/jobs"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2"
                      >
                        Explore jobs <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {recentVisits.slice(0, 6).map((visit) => {
                        const job = visit.job;
                        if (!job) return null;
                        const visitedDate = new Date(visit.visitedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric"
                        });
                        return (
                          <li key={visit._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                            <CompanyLogo company={job.company} logo={job.logo} className="w-9 h-9" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-slate-900 truncate">{job.title}</p>
                              <p className="text-[12px] text-slate-500 truncate">
                                {job.company || "Unknown company"} &bull; {job.location || "Anywhere"}
                              </p>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                              <Clock className="w-3.5 h-3.5" /> {visitedDate}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>

              {/* Right: resume panel + shortcuts */}
              <div className="space-y-6">
                <section className="bg-white border border-slate-200/70 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-900">Active resume</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide">Active</span>
                  </div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{activeResume?.title || "Untitled Resume"}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Updated{" "}
                        {activeResume?.updatedAt || activeResume?._creationTime
                          ? new Date(activeResume.updatedAt || activeResume._creationTime).toLocaleDateString()
                          : "recently"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-5">
                    <Link
                      to={`/dashboard/builder?resumeId=${activeResume?._id || ""}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <Link
                      to={`/dashboard/review?id=${activeResume?._id || ""}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <ScanSearch className="w-3.5 h-3.5" /> AI Review
                    </Link>
                    <button
                      onClick={() => activeResume && setPreviewResume(activeResume)}
                      className="col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-bold text-slate-700 bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </section>

                <section className="bg-white border border-slate-200/70 rounded-2xl p-2">
                  <h2 className="text-sm font-bold text-slate-900 px-3 pt-3 pb-2">Shortcuts</h2>
                  <nav className="pb-1">
                    {[
                      { to: "/dashboard/jobs", icon: Search, label: "Find matched jobs", sub: "Scored against your resume" },
                      { to: "/dashboard/builder", icon: Plus, label: "Build a new resume", sub: "Start from scratch or a template" },
                      { to: "/dashboard/applications", icon: ClipboardList, label: "Application tracker", sub: "Update stages and follow up" }
                    ].map(({ to, icon: Icon, label, sub }) => (
                      <Link
                        key={to + label}
                        to={to}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-slate-900">{label}</p>
                          <p className="text-[11px] text-slate-500 truncate">{sub}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                      </Link>
                    ))}
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-slate-900">Upload a resume</p>
                        <p className="text-[11px] text-slate-500 truncate">PDF or DOCX</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                    </button>
                  </nav>
                </section>
              </div>
            </div>
          ) : (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">My Resumes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{resumes.length} {resumes.length === 1 ? "resume" : "resumes"} saved. Click any to preview.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resumes.map((resume) => {
                  const rid = resume._id || resume.id;
                  const updatedTime = resume.updatedAt || resume._creationTime;
                  const updated = updatedTime
                    ? new Date(updatedTime).toLocaleDateString()
                    : "Unknown";
                  return (
                    <button
                      key={rid}
                      onClick={() => setPreviewResume(resume)}
                      className={`text-left bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${
                        resume._id === activeResume?._id
                          ? "border-indigo-600 shadow-indigo-100/50"
                          : "border-slate-100 hover:border-indigo-200"
                      }`}
                    >
                      {resume._id === activeResume?._id && (
                        <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full z-10">
                          Active
                        </span>
                      )}
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                          <FileText className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{resume.title || "Untitled Resume"}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Updated {updated}</span>
                          </div>
                          {resume.filename && (
                            <p className="text-[11px] text-slate-400 mt-1 truncate">{resume.filename}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="text-left bg-white border border-dashed border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center gap-3 text-slate-500 hover:text-indigo-600"
                >
                  <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Upload new resume</p>
                    <p className="text-[11px]">PDF or DOCX</p>
                  </div>
                </button>
              </div>
            </section>
          )}
          

        </>
      )}

      {isUploadModalOpen && (
        <ResumeUpload
          onSuccess={() => {
            fetchResumes();
            window.location.href = '/dashboard/builder';
          }}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}

      {previewResume && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setPreviewResume(null)}
        >
          <div
            className="relative bg-slate-50 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Resume Preview</p>
                <h3 className="text-sm font-bold text-slate-900 truncate">{previewResume.title || "Untitled Resume"}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/dashboard/builder?resumeId=${previewResume._id || previewResume.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <button
                  onClick={() => setPreviewResume(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ResumePreview data={parseResumeData(previewResume)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
