import { useState, useEffect } from "react";
import {
  FileText, Sparkles, Plus, Upload, LayoutDashboard, User as UserIcon, Briefcase, X, Pencil, Clock, Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ResumeUpload } from "@/components/ResumeUpload";
import { ResumePreview } from "@/components/ResumePreview";
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
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeResume = resumes.find((r) => r.isDefault) || resumes[0];

  return (
    <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 py-8 pb-12 font-sans text-slate-900">
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-4 mb-6 gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border-4 border-white shadow-sm shrink-0 overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8" />
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-slate-900 mb-1">{user?.name || "JobPlotter User"}</h1>
                <div className="flex items-center gap-1.5 text-slate-600 text-[13px] font-medium">
                  <div className="w-4 h-4 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                    {activeResume?.title?.[0] || "R"}
                  </div>
                  <span>{activeResume?.title || "Active Resume"} &bull; {user?.email}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:mt-1">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Resume
              </button>
            </div>
          </div>

          <div className="flex items-center gap-5 sm:gap-7 border-b border-slate-200 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 pb-3 text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === "overview"
                  ? "font-semibold text-slate-900 border-b-2 border-slate-900"
                  : "font-medium text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Overview
            </button>
            <button
              onClick={() => setActiveTab("resumes")}
              className={`flex items-center gap-1.5 pb-3 text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === "resumes"
                  ? "font-semibold text-slate-900 border-b-2 border-slate-900"
                  : "font-medium text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> My Resumes
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">{resumes.length}</span>
            </button>
          </div>

          {activeTab === "overview" ? (
            <div className="space-y-10">
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Recently Viewed Jobs</h2>
                {isVisitsLoading ? (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  </div>
                ) : recentVisits.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center">
                    <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3 animate-pulse" style={{ opacity: 0.7 }} />
                    <p className="text-sm font-medium text-slate-500">No recently viewed jobs yet.</p>
                    <Link 
                      to="/dashboard/jobs" 
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2"
                    >
                      Explore Jobs &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentVisits.map((visit) => {
                      const job = visit.job;
                      if (!job) return null;
                      const visitedDate = new Date(visit.visitedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      return (
                        <div
                          key={visit._id}
                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                              {job.logo ? (
                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                              ) : job.company ? (
                                <img 
                                  src={`https://logo.clearbit.com/${job.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`} 
                                  alt={job.company} 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-xs">${job.company?.charAt(0) || ''}</div>`;
                                    }
                                  }}
                                />
                              ) : (
                                <Building2 className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-slate-900 truncate">
                                {job.title}
                              </h3>
                              <p className="text-xs font-semibold text-slate-500 truncate">
                                {job.company || "Unknown Company"} &bull; {job.location || "Anywhere"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {visitedDate}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
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
                  const updated = resume._creationTime
                    ? new Date(resume._creationTime).toLocaleDateString()
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
