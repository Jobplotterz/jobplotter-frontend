import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useResumeData } from "../types";
import { ResumePreview } from "../components/ResumePreview";

export function Review() {
  const [searchParams] = useSearchParams();
  const resumeId = searchParams.get("id");
  const [resumeData, setResumeData, saveToBackend, , , , , , , savedReview, lastReviewedHash, needsAnalysis] = useResumeData(resumeId);
  const [review, setReview] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [showOptimized, setShowOptimized] = useState(false);

  const runOptimization = async () => {
    if (!review) return;
    setIsOptimizing(true);
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/optimize`, {
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
        const data = await response.json();
        setOptimizedData(data);
        setShowOptimized(true);
      } else {
        throw new Error("Failed to optimize resume");
      }
    } catch (e: any) {
      console.error("Optimization Error:", e);
      alert("Unable to optimize resume. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyOptimization = async () => {
    if (!optimizedData) return;
    setResumeData(optimizedData);
    await saveToBackend(optimizedData);
    setOptimizedData(null);
    setShowOptimized(false);
    alert("Optimization applied successfully! Your resume has been updated.");
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
        body: JSON.stringify(resumeData)
      });
      
      const data = await response.json();

      if (response.ok && !data.error) {
        setReview(data);
      } else {
        const errorMsg = data.error || "Failed to get AI review. Please try again.";
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

    const currentDataStr = JSON.stringify(resumeData, Object.keys(resumeData).sort());
    
    // Trigger review if database flag says it's updated, OR if we have no review at all
    const shouldRun = needsAnalysis || !savedReview;

    if (shouldRun && currentDataStr !== lastCheckedDataRef.current) {
      lastCheckedDataRef.current = currentDataStr;
      runReview();
    }
  }, [resumeData, savedReview, needsAnalysis]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'excellent': return 'bg-green-50 text-green-700 border-green-100';
      case 'good': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'needs work': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center order-2 lg:order-1 bg-slate-50">
          <div className="w-full flex-1 flex flex-col max-w-4xl">
            <ResumePreview data={showOptimized ? optimizedData : resumeData} />
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
                      <p className="text-xs text-slate-500">Measures quality and impact for human recruiters.</p>
                    </div>
                  </div>

                  {/* Move Optimize Button and Banner Here */}
                  <div className="mb-6">
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

                {/* Bot Compatibility Section */}
                <div className="bg-slate-900 rounded-xl p-5 mb-5 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-0.5">Bot Compatibility</h3>
                      <p className="text-[11px] text-slate-400">Measures how well AI/ATS systems parse your data.</p>
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
    </div>
  );
}
