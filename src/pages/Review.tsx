import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Download, Info, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useResumeData } from "../types";
import { getStoredTemplate, TemplateId } from "../components/resumeTemplateMeta";

// Lazy so the heavy @react-pdf/renderer bundle only loads on this page, not app-wide.
const ResumePdfPreview = lazy(() => import("../components/ResumePdfPreview"));

// Look up a cached job by id (Convex `_id` or external `jobId`) across all
// per-resume caches the Jobs page may have populated. Lets us hydrate the
// review/optimize flows without depending on Convex having persisted the row.
function findCachedJob(id: string): any | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith("jobplotter_cached_matches_")) {
        const matches = JSON.parse(localStorage.getItem(key) || "[]");
        const found = matches.find((m: any) => m?.job && (m.job._id === id || m.job.jobId === id));
        if (found?.job) return found.job;
      } else if (key.startsWith("jobplotter_cached_alljobs_")) {
        const jobs = JSON.parse(localStorage.getItem(key) || "[]");
        const found = jobs.find((j: any) => j?._id === id || j?.jobId === id);
        if (found) return found;
      }
    }
  } catch {
    // Bad JSON in one cache key shouldn't sink the whole lookup.
  }
  return null;
}

export function Review() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const resumeId = searchParams.get("id");
  const jobId = searchParams.get("jobId");
  const [resumeData, setResumeData, saveToBackend, , , , , , , savedReview, lastReviewedHash, needsAnalysis] = useResumeData(resumeId);
  const [review, setReview] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [showOptimized, setShowOptimized] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOptimizationInferior, setIsOptimizationInferior] = useState(false);
  const [optimizationNudgeMessage, setOptimizationNudgeMessage] = useState<string | null>(null);
  const [pendingMatchInfo, setPendingMatchInfo] = useState<any | null>(null);
  const [pendingReview, setPendingReview] = useState<any | null>(null);
  // Cache the fetched PDF bytes by content hash so back-to-back clicks on the
  // same resume (e.g. toggling optimized/original) don't re-fetch or re-generate.
  const [cachedDownload, setCachedDownload] = useState<{ hash: string; blob: Blob } | null>(null);
  // Transient confirmation shown after a download so users know it worked
  // (and, on iOS, where the file went).
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  // Selected PDF template (persisted). Drives both the live preview and download.
  const [template, setTemplate] = useState<TemplateId>(getStoredTemplate());

  const [job, setJob] = useState<any>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [jobFetchFailed, setJobFetchFailed] = useState(false);
  // Per-job match data (score / reasoning / strengths / gaps) handed over
  // via navigation state when the user came from the Jobs/Dashboard modal.
  // Only present when there's a Match for this resume+job pair.
  const [matchInfo, setMatchInfo] = useState<{
    score?: number;
    reasoning?: string;
    strengths?: string[];
    gaps?: string[];
  } | null>(((location.state as any)?.matchInfo) || null);

  useEffect(() => {
    const stateMatch = (location.state as any)?.matchInfo;
    if (stateMatch) setMatchInfo(stateMatch);
  }, [location.state]);

  useEffect(() => {
    if (!jobId) return;

    // 1. Job handed to us via navigation state (the common path — user
    //    clicked "Optimize Resume" on the Jobs/Dashboard modal).
    const stateJob = (location.state as any)?.job;
    if (stateJob && (stateJob._id === jobId || stateJob.jobId === jobId)) {
      setJob(stateJob);
      setJobFetchFailed(false);
      return;
    }

    // 2. Hydrate from the Jobs page's localStorage cache (covers reloads as
    //    long as the cache is still present).
    const cached = findCachedJob(jobId);
    if (cached) {
      setJob(cached);
      setJobFetchFailed(false);
      return;
    }

    // 3. Last resort: ask the backend. The matches/alljobs endpoints return
    //    un-persisted RapidAPI rows, so this only succeeds for jobs the user
    //    has previously opened (which persists them via /visited).
    const fetchJobDetails = async () => {
      setIsLoadingJob(true);
      setJobFetchFailed(false);
      try {
        const token = localStorage.getItem("jobplotter_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/jobs/${jobId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setJob(data);
        } else {
          setJobFetchFailed(true);
        }
      } catch (e) {
        console.error("Failed to fetch job details:", e);
        setJobFetchFailed(true);
      } finally {
        setIsLoadingJob(false);
      }
    };
    fetchJobDetails();
  }, [jobId, location.state]);

  // Map a fetch failure to a human-friendly message. Gemini's 500 ("INTERNAL")
  // and 503 ("UNAVAILABLE") are transient; anything else is generic.
  const messageForOptimizationFailure = async (response: Response | null, fallback: string) => {
    if (!response) return "We couldn't reach the AI Optimizer. Check your connection and try again.";
    if (response.status === 503) return "The AI Optimizer is briefly overloaded. This usually clears in a few seconds — try again.";
    if (response.status === 429) {
      try {
        const body = await response.clone().json();
        if (body?.detail) return body.detail;
      } catch {
        // ignore
      }
      return "You have reached your daily limit of AI operations. Please try again tomorrow.";
    }
    if (response.status === 500) {
      try {
        const body = await response.clone().json();
        const detail = (body?.detail || "").toString().toLowerCase();
        if (detail.includes("high demand") || detail.includes("unavailable") || detail.includes("internal error")) {
          return "The AI Optimizer hit a temporary hiccup on Google's side. Try again in a moment — it almost always works on retry.";
        }
      } catch {
        // ignore body parse failures, fall through
      }
      return "Something went wrong on the AI side. Give it another try.";
    }
    return fallback;
  };

  const runJobOptimization = async () => {
    if (!jobId) return;
    setIsOptimizing(true);
    setOptimizationError(null);
    setIsOptimizationInferior(false);
    setOptimizationNudgeMessage(null);
    let response: Response | null = null;
    try {
      const token = localStorage.getItem("jobplotter_token");
      response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/optimize-for-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // Send the cached job inline so the backend doesn't need it persisted
        // in Convex. `jobId` is still passed for backwards-compatible lookup.
        body: JSON.stringify({
          resumeData,
          jobId: jobId,
          job: job || undefined,
          oldScore: matchInfo?.score ?? undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        const oldScore = result.oldScore ?? matchInfo?.score ?? 0;
        const newScore = result.newScore ?? 0;

        if (newScore < oldScore) {
          setIsOptimizationInferior(true);
          setOptimizedData(null);
          setShowOptimized(false);
          setPendingMatchInfo(null);
          setOptimizationNudgeMessage(
            `Our AI analyzed options to tailor your resume for this role, but the optimized version scored lower than your current version (${newScore}% vs ${oldScore}% match). This can occur when descriptions are refined without fabricating new experience. We recommend making a manual update to your experience/skills section to tailor it closer to this role.`
          );
        } else {
          setIsOptimizationInferior(false);
          setOptimizedData(result.optimizedData);
          setShowOptimized(true);
          setPendingMatchInfo(result.newMatchInfo);
          setOptimizationNudgeMessage(null);
        }
      } else {
        throw new Error("Failed to tailor resume");
      }
    } catch (e: any) {
      console.error("Job Optimization Error:", e);
      setOptimizationError(await messageForOptimizationFailure(response, "We couldn't tailor your resume for this job. Try again."));
    } finally {
      setIsOptimizing(false);
    }
  };

  const runOptimization = async () => {
    if (!review) return;
    setIsOptimizing(true);
    setOptimizationError(null);
    setIsOptimizationInferior(false);
    setOptimizationNudgeMessage(null);
    let response: Response | null = null;
    try {
      const token = localStorage.getItem("jobplotter_token");
      response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeData,
          reviewData: review
        })
      });

      if (response.ok) {
        const result = await response.json();
        const oldScore = result.oldScore ?? review?.overallScore ?? 0;
        const newScore = result.newScore ?? 0;

        if (newScore < oldScore) {
          setIsOptimizationInferior(true);
          setOptimizedData(null);
          setShowOptimized(false);
          setPendingReview(null);
          setOptimizationNudgeMessage(
            `Our AI analyzed options to optimize your resume, but the optimized version scored lower than your current version (${newScore} vs ${oldScore} recruiter impact score). This can occur when bullet points are simplified too much. We recommend making a manual update to your resume based on the detailed recruiter feedback below.`
          );
        } else {
          setIsOptimizationInferior(false);
          setOptimizedData(result.optimizedData);
          setShowOptimized(true);
          setPendingReview(result.newReview);
          setOptimizationNudgeMessage(null);
        }
      } else {
        throw new Error("Failed to optimize resume");
      }
    } catch (e: any) {
      console.error("Optimization Error:", e);
      setOptimizationError(await messageForOptimizationFailure(response, "We couldn't optimize your resume. Try again."));
    } finally {
      setIsOptimizing(false);
    }
  };

  const retryOptimization = () => {
    setOptimizationError(null);
    if (jobId) {
      runJobOptimization();
    } else {
      runOptimization();
    }
  };

  const applyOptimization = async () => {
    if (!optimizedData) return;
    setResumeData(optimizedData);
    await saveToBackend(optimizedData);
    
    if (pendingMatchInfo) {
      setMatchInfo(pendingMatchInfo);
      setPendingMatchInfo(null);
    }
    if (pendingReview) {
      setReview(pendingReview);
      setPendingReview(null);
    }
    
    setOptimizedData(null);
    setShowOptimized(false);
    alert("Optimization applied successfully! Your resume has been updated.");
  };

  // Download whatever's currently displayed (optimized if user is viewing it,
  // otherwise the original). Caches the generated bytes by content+template
  // hash so a toggle-back-and-forth doesn't re-generate the PDF.
  const handleDownload = async () => {
    const dataToDownload = showOptimized && optimizedData ? optimizedData : resumeData;
    if (!dataToDownload?.personalInfo) return;

    // Template is part of the cache key — switching templates must regenerate.
    const currentHash = JSON.stringify({ d: dataToDownload, t: template });
    const filename = `${dataToDownload.personalInfo.fullName || "resume"}.pdf`;

    // iOS Safari ignores the <a download> attribute for blob URLs (it renders
    // the PDF inline instead), so on iOS we navigate a tab to the blob and let
    // the user Save to Files from the share sheet. Everywhere else, a
    // same-origin blob URL + download attribute downloads reliably.
    const isIOS =
      /iP(hone|ad|od)/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Pre-open the iOS tab synchronously — inside the click, before any await —
    // so the later navigation isn't treated as a popup and blocked.
    const iosTab = isIOS ? window.open("", "_blank") : null;

    const saveBlob = (blob: Blob) => {
      const objectUrl = URL.createObjectURL(blob);
      if (isIOS) {
        if (iosTab) iosTab.location.href = objectUrl;
        else window.location.href = objectUrl;
      } else {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      // Release the object URL once the browser has had time to start the download.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);

      // Confirm to the user — behaviour differs by device, so say what happened.
      setDownloadNotice(
        isIOS
          ? "Opened your resume in a new tab — tap Share, then \"Save to Files\" to keep it."
          : `Downloading ${filename}`
      );
      setTimeout(() => setDownloadNotice(null), 6000);
    };

    // Reuse already-fetched bytes for the same content (toggling views, etc.).
    if (cachedDownload && cachedDownload.hash === currentHash) {
      saveBlob(cachedDownload.blob);
      return;
    }

    try {
      setIsDownloading(true);
      // Generate the PDF on-device from the same template as the preview
      // (react-pdf). Dynamically imported so its bundle is code-split.
      const { generateResumePdfBlob } = await import("../components/resumeTemplates");
      const blob = await generateResumePdfBlob(dataToDownload, template);
      setCachedDownload({ hash: currentHash, blob });
      saveBlob(blob);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      if (iosTab) iosTab.close();
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Sync with savedReview when it loads
  useEffect(() => {
    if (savedReview) {
      setReview(savedReview);
    }
  }, [savedReview]);

  const runReview = async () => {
    setIsReviewing(true);
    setError(null);
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeData,
          id: resumeId,
          job: job || undefined
        })
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setReview(data);
      } else {
        const errorMsg = data.error || data.detail || "Failed to get AI review. Please try again.";
        if (errorMsg.includes("high demand") || response.status === 503) {
          throw new Error("The AI Reviewer is currently in high demand. This is temporary, please click 'Try Again' in a few seconds.");
        }
        throw new Error(errorMsg);
      }
    } catch (e: any) {
      console.error("Review Error:", e);
      setError(e.message || "Unable to connect to AI Reviewer. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const lastCheckedDataRef = useRef<string>("");

  useEffect(() => {
    if (!resumeData.personalInfo.fullName || isReviewing) return;
    
    // If we are waiting for the job details to load, do not run yet
    if (jobId && !job && isLoadingJob) return;

    const currentDataStr = JSON.stringify({ resumeData, jobId, job }, Object.keys({ resumeData, jobId, job }).sort());
    
    const savedReviewJobId = savedReview?.jobId || null;
    const currentJobId = jobId || null;
    const isJobMismatch = savedReviewJobId !== currentJobId;

    // Trigger review if database flag says it's updated, OR if we have no review at all, OR if target job changed
    const shouldRun = needsAnalysis || !savedReview || isJobMismatch;

    if (shouldRun && currentDataStr !== lastCheckedDataRef.current) {
      lastCheckedDataRef.current = currentDataStr;
      runReview();
    }
  }, [resumeData, savedReview, needsAnalysis, jobId, job, isLoadingJob]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'bg-green-50 text-green-700 border-green-100';
      case 'good': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'needs work': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <header className="h-14 shrink-0 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between">
        <Link
          to="/dashboard/jobs"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </Link>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          title={showOptimized && optimizedData ? "Download the optimized resume" : "Download this resume"}
        >
          {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {isDownloading
            ? "Generating PDF…"
            : showOptimized && optimizedData
            ? "Download optimized"
            : "Download"}
        </button>
      </header>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center order-2 lg:order-1 bg-slate-50">
          <div className="w-full flex-1 flex flex-col max-w-4xl">
            {/* Version switcher. Only meaningful once an optimized version
                exists — makes it unmistakable which version is on screen (and
                therefore which one the Download button will produce). */}
            {optimizedData && (
              <div className="mb-3 flex items-center justify-center gap-3">
                <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setShowOptimized(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      !showOptimized ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setShowOptimized(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                      showOptimized ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    AI-Optimized
                  </button>
                </div>
                <span className="hidden sm:inline text-[11px] font-semibold text-slate-400">
                  Viewing the {showOptimized ? "AI-optimized" : "original"} version
                </span>
              </div>
            )}
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            }>
              <ResumePdfPreview
                data={showOptimized ? optimizedData : resumeData}
                templateId={template}
                onTemplateChange={setTemplate}
              />
            </Suspense>
          </div>
        </div>

        {/* Right Pane: Review Panel */}
        <div className="w-full lg:w-[420px] xl:w-[460px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 overflow-y-auto shrink-0 order-1 lg:order-2 max-h-[70vh] lg:max-h-none">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                AI Resume Review
              </h2>
            </div>

            {job && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 mb-5 animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse shrink-0" />
                    <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider">Fit for this role</span>
                  </div>
                  {matchInfo && typeof matchInfo.score === "number" && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-white text-indigo-700 text-[11px] font-extrabold border border-indigo-200" title="How well your resume profile matches this specific job">
                      {matchInfo.score}% match · this job
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-0.5">{job.title}</h4>
                <p className="text-xs text-slate-500 font-semibold">{job.company || 'Unknown Company'} &bull; {job.location || 'Anywhere'}</p>
                {matchInfo?.reasoning && (
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed italic border-t border-indigo-100 pt-2">
                    {matchInfo.reasoning}
                  </p>
                )}
              </div>
            )}

            {jobFetchFailed && !job && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-bold mb-0.5">Job context unavailable</p>
                  <p className="text-amber-800">We couldn't load the job you came from. The review below is general — to tailor for a specific role, reopen it from the Jobs page.</p>
                </div>
              </div>
            )}

            {isReviewing ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Analyzing your resume...</h3>
                <p className="text-sm text-slate-500 max-w-xs">Our AI is checking for ATS compatibility, tone, and professional impact.</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-red-800 mb-4">{error}</p>
                <button 
                  onClick={runReview}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : !review ? (
              <div className="text-center py-20">
                <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm text-slate-500 mb-6">Complete your profile to get a detailed AI review.</p>
                <button 
                  onClick={runReview}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Start AI Analysis
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {/* Section transition: from job-specific match (above) to
                    job-agnostic resume quality (below). Only render this
                    divider when there's a job attached — otherwise the
                    "resume in general" framing is the only thing on the page. */}
                {job ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Your resume in general</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Independent of any job — how well this resume reads to recruiters and parses through ATS systems.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 flex gap-2.5">
                    <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800">Tip:</span> Even when you're not targeting a specific role, it's worth checking how recruiters and ATS systems read your resume. A strong general score makes every job match land better.
                    </p>
                  </div>
                )}

                {/* Overall Score Card */}
                <div className="border border-slate-200 rounded-xl p-5 mb-5 shadow-sm">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path
                          className={review.overallScore > 70 ? "text-green-500" : review.overallScore > 40 ? "text-amber-500" : "text-red-500"}
                          strokeWidth="3"
                          strokeDasharray={`${review.overallScore}, 100`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-xl font-extrabold text-slate-900">{review.overallScore}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Recruiter Impact</h3>
                      <p className="text-xs text-slate-500">How a human recruiter will read this resume on its own.</p>
                    </div>
                  </div>

                  {/* Move Optimize Button and Banner Here */}
                  <div className="mb-6">
                    {jobId ? (
                      <button
                        onClick={runJobOptimization}
                        disabled={isOptimizing}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 mb-3"
                      >
                        {isOptimizing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {isOptimizing ? "Tailoring for role..." : "Tailor Resume for this Job"}
                      </button>
                    ) : (
                      <button
                        onClick={runOptimization}
                        disabled={isOptimizing}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70 mb-3"
                      >
                        {isOptimizing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {isOptimizing ? "Optimizing for ATS..." : "Optimize My Resume"}
                      </button>
                    )}

                    {optimizationError && !optimizedData && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-3 animate-in slide-in-from-top duration-300">
                        <div className="flex gap-2.5 mb-3">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div className="text-xs text-red-900">
                            <p className="font-bold mb-0.5">Optimization didn't go through</p>
                            <p className="text-red-800 leading-relaxed">{optimizationError}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={retryOptimization}
                            disabled={isOptimizing}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isOptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            {isOptimizing ? "Retrying..." : "Try Again"}
                          </button>
                          <button
                            onClick={() => setOptimizationError(null)}
                            className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}

                    {isOptimizationInferior && optimizationNudgeMessage && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3 animate-in slide-in-from-top duration-300">
                        <div className="flex gap-2.5 mb-3">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-900">
                            <p className="font-bold mb-0.5">Manual Update Recommended</p>
                            <p className="text-amber-800 leading-relaxed">{optimizationNudgeMessage}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsOptimizationInferior(false);
                            setOptimizationNudgeMessage(null);
                          }}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {optimizedData && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-indigo-900">Optimization Ready!</h3>
                          <button 
                            onClick={() => setShowOptimized(!showOptimized)}
                            className="text-[11px] font-bold text-indigo-600 hover:underline"
                          >
                            {showOptimized ? "View Original" : "View Optimized"}
                          </button>
                        </div>
                        <p className="text-[11px] text-indigo-700 mb-4">We've rewritten your descriptions and skills for better ATS performance.</p>
                        
                        <div className="bg-white/50 rounded-lg p-3 mb-4 border border-indigo-100 flex gap-2.5">
                          <AlertCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-indigo-800 leading-relaxed italic">
                            <strong>AI Ethics Note:</strong> This optimization only refines your existing story. The AI cannot (and should not) fabricate experience you haven't provided, as honesty is critical for interview success.
                          </p>
                        </div>

                        <button
                          onClick={applyOptimization}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Apply Optimized Version
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {review?.categories && Object.entries(review.categories).map(([key, cat]: [string, any]) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 capitalize">{key}</span>
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${getStatusColor(cat.status)}`}>
                              {cat.status}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-900">{cat.score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${cat.score > 70 ? "bg-green-500" : cat.score > 40 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ATS Compatibility Section */}
                <div className="bg-slate-900 rounded-xl p-5 mb-5 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-0.5">ATS Compatibility</h3>
                      <p className="text-[11px] text-slate-400">How well applicant tracking systems can parse your resume.</p>
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-lg text-lg font-bold border border-white/10">
                      {review?.atsScore ?? 0}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    {review?.suggestions?.map((text: string, i: number) => (
                      <div key={i} className="flex gap-2.5 bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Feedback Accordion */}
                <Accordion type="multiple" defaultValue={["content"]} className="w-full space-y-3">
                  {review?.detailedFeedback && Object.entries(review.detailedFeedback).map(([category, feedback]: [string, any]) => (
                    <AccordionItem key={category} value={category} className="border border-slate-200 rounded-xl px-3 bg-white shadow-sm overflow-hidden">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 capitalize">{category} Feedback</span>
                          <span className="text-[11px] text-slate-400 font-medium">{feedback?.length ?? 0} items</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 space-y-3">
                        {feedback?.map((item: any, i: number) => (
                          <div key={i} className="flex gap-3 bg-amber-50/40 p-4 rounded-xl border border-amber-100/50">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-xs font-bold text-amber-900 mb-1">{item.title}</h4>
                              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download confirmation toast */}
      {downloadNotice && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg max-w-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
