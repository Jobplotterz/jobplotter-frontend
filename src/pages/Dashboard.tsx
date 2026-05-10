import { useState, useEffect } from "react";
import {
  FileText, Sparkles, Plus, Upload, LayoutDashboard, User as UserIcon, Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ResumeUpload } from "@/components/ResumeUpload";

export function Dashboard() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const latestResume = resumes[0];

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
                    {latestResume?.title?.[0] || "R"}
                  </div>
                  <span>{latestResume?.title || "Latest Resume"} &bull; {user?.email}</span>
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
            <button className="flex items-center gap-1.5 pb-3 text-[13px] font-semibold text-slate-900 border-b-2 border-slate-900 whitespace-nowrap cursor-pointer">
              <LayoutDashboard className="w-3.5 h-3.5" /> Overview
            </button>
            <Link to="/dashboard/builder" className="flex items-center gap-1.5 pb-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap cursor-pointer">
              <FileText className="w-3.5 h-3.5" /> My Resumes
            </Link>
            <Link to="/dashboard/jobs" className="flex items-center gap-1.5 pb-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap cursor-pointer">
              <Briefcase className="w-3.5 h-3.5" /> Job Matches
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Latest Activity</h2>
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{latestResume?.title || "No title"}</p>
                      <p className="text-xs text-slate-500">Last updated {latestResume?._creationTime ? new Date(latestResume._creationTime).toLocaleDateString() : "Never"}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-5">
               <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
                 <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                 <p className="text-xs font-bold text-slate-900">AI Analysis Active</p>
                 <p className="text-[11px] text-slate-500 mt-1">We're scanning startup roles for your profile.</p>
               </div>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-indigo-900 mb-0.5">Your AI Profile is growing!</h4>
              <p className="text-sm text-indigo-700">Keep your resumes updated for the best job matching results.</p>
            </div>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-2 bg-white text-indigo-600 font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              Update Profile
            </button>
          </div>
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
    </div>
  );
}
