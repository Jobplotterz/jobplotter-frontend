import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, Download, ScanSearch, Save, Loader2, ChevronDown, Edit2, Check } from "lucide-react";
import { useResumeData } from "../types";
import { ResumeForm } from "../components/ResumeForm";
import { ResumePreview } from "../components/ResumePreview";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Builder() {
  const [resumeData, setResumeData, saveToBackend, isSaving, resumes, loadResume, title, setTitle, currentResumeId, savedReview, lastReviewedHash, needsAnalysis] = useResumeData();
  const [showPreview, setShowPreview] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cachedDownload, setCachedDownload] = useState<{hash: string, url: string} | null>(null);

  const handleLoadResume = async (id: string) => {
    await loadResume(id);
    setIsEditingTitle(false);
  };

  const handleDownload = async () => {
    // 1. Check local cache first for instant download
    const currentHash = JSON.stringify(resumeData);
    if (cachedDownload && cachedDownload.hash === currentHash) {
      const a = document.createElement('a');
      a.href = cachedDownload.url;
      a.target = "_blank";
      a.download = `${resumeData.personalInfo.fullName || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      setIsDownloading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/resumes/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jobplotter_token')}`
        },
        body: JSON.stringify({ resumeData })
      });

      if (!response.ok) throw new Error('Download failed');

      const data = await response.json();
      if (!data.downloadUrl) throw new Error('No download URL returned');

      // Update cache
      setCachedDownload({ hash: currentHash, url: data.downloadUrl });

      // Trigger download from the Cloudflare Signed URL
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.target = "_blank";
      a.download = `${resumeData.personalInfo.fullName || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const activeResume = resumes.find(r => (r._id || r.id) === currentResumeId) || (currentResumeId ? null : resumes[0]);

  const handleSaveTitle = async () => {
    if (!title.trim()) return;
    setIsEditingTitle(false);
    await saveToBackend(resumeData, title);
  };

  return (
    <div className="h-full flex flex-col bg-white font-sans text-slate-900 overflow-hidden">

      {/* Top Header / Nav */}
      <div className="h-16 shrink-0 border-b border-slate-200 bg-white px-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-8 h-8 bg-indigo-50 rounded-lg items-center justify-center text-indigo-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Editing Resume</p>
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input 
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  onBlur={handleSaveTitle}
                  className="text-sm font-bold text-slate-900 border-b-2 border-indigo-600 focus:outline-none bg-transparent py-0 px-0 h-6 w-48"
                />
                <Check className="w-3.5 h-3.5 text-green-500 cursor-pointer" onClick={handleSaveTitle} />
              </div>
            ) : (
              <div className="flex items-center gap-2 group/title">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer group">
                    <span className="truncate max-w-[200px]">{title || "My Resume"}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl shadow-xl border-slate-200">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Your Resumes
                    </div>
                    {resumes.map((r) => {
                      const rid = r._id || r.id;
                      const isActive = currentResumeId === rid || (!currentResumeId && r === resumes[0]);
                      return (
                        <DropdownMenuItem
                          key={rid}
                          onClick={() => handleLoadResume(rid)}
                          className={`flex flex-col items-start p-2.5 rounded-lg cursor-pointer ${
                            isActive ? "bg-indigo-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className={`text-sm font-bold ${isActive ? "text-indigo-700" : "text-slate-700"}`}>
                            {r.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium italic truncate w-full">
                            {r.filename || "Manual Entry"}
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-slate-100 rounded transition-all text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => saveToBackend(resumeData, title)}
            disabled={isSaving}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save
          </button>
          {resumes.length > 0 && (
            <Link to={`/dashboard/review?id=${activeResume?._id || ""}`} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-all cursor-pointer">
              <ScanSearch className="w-3.5 h-3.5" /> Review
            </Link>
          )}
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm cursor-pointer disabled:opacity-70"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isDownloading ? "Generating..." : "Download"}
          </button>
        </div>
      </div>

      {/* Mobile toggle tabs */}
      <div className="lg:hidden flex items-center border-b border-slate-200 bg-white no-print">
        <button
          onClick={() => setShowPreview(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold transition-colors cursor-pointer ${!showPreview ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Edit Details
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold transition-colors cursor-pointer ${showPreview ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          View Preview
        </button>
      </div>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Middle Pane: Form */}
        <div className={`${showPreview ? 'hidden' : 'flex flex-col'} lg:flex lg:flex-col flex-1 h-full border-r border-slate-200 bg-white overflow-hidden no-print`}>
          <div className="flex-1 overflow-y-auto">
            <ResumeForm data={resumeData} onChange={setResumeData} />
          </div>
          <div className="shrink-0 px-5 sm:px-6 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autosaves every 2s</p>
            <div className="sm:hidden">
              <button 
                onClick={() => saveToBackend(resumeData)}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-bold text-slate-700 bg-white border border-slate-200 rounded-md cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-3 animate-spin" /> : <Save className="w-3" />}
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Preview */}
        <div className={`${showPreview ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 h-full bg-slate-100 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center`}>
          <div className="w-full flex-1 flex flex-col">
            <ResumePreview data={resumeData} />
          </div>
        </div>
      </div>
    </div>
  );
}
