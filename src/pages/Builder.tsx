import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, Eye, Download, ScanSearch, Save, Loader2, ChevronDown, Edit2, Check } from "lucide-react";
import { useResumeData } from "../types";
import { ResumeForm } from "../components/ResumeForm";
import { getStoredTemplate, TemplateId } from "../components/resumeTemplateMeta";

// Lazy so the heavy @react-pdf/renderer bundle only loads on this page, not app-wide.
const ResumePdfPreview = lazy(() => import("../components/ResumePdfPreview"));
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Builder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resumeIdFromUrl = searchParams.get("resumeId");
  const [resumeData, setResumeData, saveToBackend, isSaving, resumes, loadResume, title, setTitle, currentResumeId, savedReview, lastReviewedHash, needsAnalysis] = useResumeData(resumeIdFromUrl);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cachedDownload, setCachedDownload] = useState<{hash: string, blob: Blob} | null>(null);
  const [template, setTemplate] = useState<TemplateId>(getStoredTemplate());

  // Strip the `?resumeId=...` query param once the hook has loaded that
  // resume into the editor. We deliberately do NOT change the user's default
  // resume here — default-setting lives in Settings only.
  useEffect(() => {
    if (!resumeIdFromUrl) return;
    setSearchParams({}, { replace: true });
  }, [resumeIdFromUrl, setSearchParams]);

  const handleLoadResume = async (id: string) => {
    await loadResume(id);
    setIsEditingTitle(false);
  };

  const handleDownload = async () => {
    // Template is part of the cache key — switching templates must regenerate.
    const currentHash = JSON.stringify({ d: resumeData, t: template });
    const filename = `${resumeData.personalInfo.fullName || 'resume'}.pdf`;

    // iOS Safari ignores <a download> for blob URLs (renders inline), so on
    // iOS we navigate a tab to the blob and let the user Save to Files.
    // Elsewhere, a same-origin blob URL + download attribute downloads reliably.
    const isIOS =
      /iP(hone|ad|od)/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Pre-open the iOS tab synchronously (before any await) so it isn't blocked.
    const iosTab = isIOS ? window.open("", "_blank") : null;

    const saveBlob = (blob: Blob) => {
      const objectUrl = URL.createObjectURL(blob);
      if (isIOS) {
        if (iosTab) iosTab.location.href = objectUrl;
        else window.location.href = objectUrl;
      } else {
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
    };

    // Reuse already-fetched bytes for the same content.
    if (cachedDownload && cachedDownload.hash === currentHash) {
      saveBlob(cachedDownload.blob);
      return;
    }

    try {
      setIsDownloading(true);

      // Generate the PDF on-device from the same template as the preview
      // (react-pdf). Dynamically imported so its bundle is code-split.
      const { generateResumePdfBlob } = await import('../components/resumeTemplates');
      const blob = await generateResumePdfBlob(resumeData, template);
      setCachedDownload({ hash: currentHash, blob });
      saveBlob(blob);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      if (iosTab) iosTab.close();
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
      <div className="h-16 shrink-0 border-b border-slate-200 bg-white px-3 sm:px-4 flex items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="hidden sm:flex w-8 h-8 bg-indigo-50 rounded-lg items-center justify-center text-indigo-600 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
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
                    <span className="truncate max-w-[110px] sm:max-w-[200px]">{title || "My Resume"}</span>
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

        <div className="flex items-center gap-2 shrink-0">
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
        <div className={`${showPreview ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 h-full bg-slate-100 overflow-hidden p-4 sm:p-6 lg:p-8 flex flex-col items-center`}>
          <div className="w-full flex-1 flex flex-col min-h-0">
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            }>
              <ResumePdfPreview
                data={resumeData}
                templateId={template}
                onTemplateChange={setTemplate}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
