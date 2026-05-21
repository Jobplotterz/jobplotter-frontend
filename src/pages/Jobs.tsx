import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search, MapPin, SlidersHorizontal, Check, ChevronDown, X,
  Building2, Sparkles, Clock, ExternalLink, Briefcase,
  AlertCircle, ThumbsUp, Compass, RefreshCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Job {
  _id: string;
  jobId: string;
  title: string;
  company?: string;
  location?: string;
  description: string;
  url?: string;
  source?: string;
  remote?: boolean;
  remote_type?: string;
  postedAt?: string;
  logo?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_unit?: string;
  employment_type?: string;
}

interface Match {
  _id: string;
  userId: string;
  resumeId: string;
  jobId: string;
  score: number;
  reasoning?: string;
  strengths?: string[];
  gaps?: string[];
  job: Job;
}

export function Jobs() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const openJobId = searchParams.get("openJobId");

  const [activeTab, setActiveTab] = useState<"matches" | "all">("matches");
  const [resumes, setResumes] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  
  const [isResumesLoading, setIsResumesLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);


  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedMatchInfo, setSelectedMatchInfo] = useState<{
    score: number;
    reasoning?: string;
    strengths?: string[];
    gaps?: string[];
  } | null>(null);
  
  const [jobTypeOpen, setJobTypeOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Skip refetching if the cache for this tab+resume was written less than 15 min ago.
  // Why: navigating between sidebar pages was triggering a full /jobs/matches re-run on
  // every mount; matches are resume-keyed and don't churn that quickly.
  const CACHE_TTL_MS = 15 * 60 * 1000;
  const isCacheFresh = (key: string) => {
    const tsRaw = localStorage.getItem(`${key}_ts`);
    if (!tsRaw) return false;
    const ts = parseInt(tsRaw, 10);
    if (Number.isNaN(ts)) return false;
    return Date.now() - ts < CACHE_TTL_MS;
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
        if (data.length === 0) {
          setActiveTab("all");
        }
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setIsResumesLoading(false);
    }
  };

  // Check if user has resumes, to default to matches or all roles
  useEffect(() => {
    fetchResumes();
  }, []);

  const activeResume = resumes.find(r => r.isDefault) || resumes[0];
  const activeResumeId = activeResume?._id || "none";

  // Load initial cached data from localStorage if present to prevent spinner flash
  useEffect(() => {
    if (isResumesLoading) return;
    try {
      const cachedMatches = localStorage.getItem(`jobplotter_cached_matches_${activeResumeId}`);
      const cachedAllJobs = localStorage.getItem(`jobplotter_cached_alljobs_${activeResumeId}`);
      if (cachedMatches) {
        setMatches(JSON.parse(cachedMatches));
      } else {
        setMatches([]);
      }
      if (cachedAllJobs) {
        setAllJobs(JSON.parse(cachedAllJobs));
      } else {
        setAllJobs([]);
      }
      
      const hasCache = activeTab === "matches" ? !!cachedMatches : !!cachedAllJobs;
      setIsDataLoading(!hasCache);
    } catch (e) {
      console.error("Failed to load jobs cache:", e);
    }
  }, [activeResumeId, isResumesLoading, activeTab]);

  // Fetch jobs / matches based on the active tab.
  // `force=true` bypasses the freshness check (used by the manual Refresh button).
  const fetchJobsData = useCallback(async (force = false) => {
    const cacheKey = activeTab === "matches"
      ? `jobplotter_cached_matches_${activeResumeId}`
      : `jobplotter_cached_alljobs_${activeResumeId}`;

    if (!force) {
      // Check localStorage directly — in-memory `matches`/`allJobs` may not yet
      // reflect the sibling hydration effect's setState on this same render.
      const cachedRaw = localStorage.getItem(cacheKey);
      let cachedIsNonEmpty = false;
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          cachedIsNonEmpty = Array.isArray(parsed) && parsed.length > 0;
        } catch {
          cachedIsNonEmpty = false;
        }
      }
      // Only short-circuit on fresh AND non-empty cache — empty results are
      // almost always an AI/source hiccup we want to retry.
      if (cachedIsNonEmpty && isCacheFresh(cacheKey)) {
        setIsDataLoading(false);
        return;
      }
      if (!cachedRaw) {
        setIsDataLoading(true);
      }
    } else {
      setIsDataLoading(true);
    }

    try {
      const token = localStorage.getItem("jobplotter_token");
      const headers = { "Authorization": `Bearer ${token}` };

      if (activeTab === "matches") {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/jobs/matches`, { headers });
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
          // Don't cache empty results — they almost always mean a transient AI
          // failure (Gemini 503/500), and a 15-min TTL on that "poisons" the
          // tab so the user sees no jobs until the timestamp expires.
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(`${cacheKey}_ts`, String(Date.now()));
          } else {
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_ts`);
          }
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/jobs/`, { headers });
        if (response.ok) {
          const data = await response.json();
          setAllJobs(data);
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(`${cacheKey}_ts`, String(Date.now()));
          } else {
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_ts`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch jobs data:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, [activeTab, activeResumeId]);

  useEffect(() => {
    if (!isResumesLoading) {
      fetchJobsData(false);
    }
  }, [fetchJobsData, isResumesLoading]);

  // Handle URL deep-linking for openJobId
  useEffect(() => {
    if (openJobId && !isDataLoading) {
      if (activeTab === "matches") {
        const matchedObj = matches.find(m => m.jobId === openJobId || m.job?._id === openJobId);
        if (matchedObj) {
          handleOpenJob(matchedObj.job, {
            score: matchedObj.score,
            reasoning: matchedObj.reasoning,
            strengths: matchedObj.strengths,
            gaps: matchedObj.gaps
          });
        }
      } else {
        const jobObj = allJobs.find(j => j._id === openJobId || j.jobId === openJobId);
        if (jobObj) {
          handleOpenJob(jobObj, null);
        }
      }
    }
  }, [openJobId, matches, allJobs, isDataLoading, activeTab]);

  // Record a job visit when details are viewed and retrieve structured description
  const handleOpenJob = async (job: Job, matchInfo: typeof selectedMatchInfo) => {
    // Open modal immediately with the current raw job details to keep the interface instant
    setSelectedJob(job);
    setSelectedMatchInfo(matchInfo);
    
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/jobs/visited`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job.jobId || job._id,
          title: job.title,
          company: job.company || "Unknown Company",
          location: job.location || "Anywhere",
          description: job.description,
          url: job.url,
          source: job.source,
          remote: job.remote,
          remote_type: job.remote_type,
          postedAt: job.postedAt,
          logo: job.logo,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_currency: job.salary_currency,
          salary_unit: job.salary_unit,
          employment_type: job.employment_type
        })
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData && resData.job) {
          const structuredJob = resData.job;
          // Update selected job state with structured description & Convex database _id
          setSelectedJob(structuredJob);
          
          // Propagate structured details back to list to cache in memory
          if (activeTab === "matches") {
            setMatches(prev => prev.map(m => {
              if (m.job.jobId === job.jobId || m.job._id === job._id) {
                return { ...m, job: structuredJob };
              }
              return m;
            }));
          } else {
            setAllJobs(prev => prev.map(j => {
              if (j.jobId === job.jobId || j._id === job._id) {
                return structuredJob;
              }
              return j;
            }));
          }
        }
      }
    } catch (err) {
      console.error("Failed to record job visit and retrieve structured description:", err);
    }
  };

  // Filter jobs locally
  const filteredJobsList = useMemo(() => {
    const sq = searchQuery.toLowerCase().trim();
    const lq = locationQuery.toLowerCase().trim();

    if (activeTab === "matches") {
      return matches.filter(m => {
        const j = m.job;
        if (!j) return false;
        const matchesSearch = !sq || 
          j.title.toLowerCase().includes(sq) || 
          (j.company && j.company.toLowerCase().includes(sq)) ||
          j.description.toLowerCase().includes(sq);
        const matchesLocation = !lq || 
          (j.location && j.location.toLowerCase().includes(lq));
        return matchesSearch && matchesLocation;
      });
    } else {
      return allJobs.filter(j => {
        const matchesSearch = !sq || 
          j.title.toLowerCase().includes(sq) || 
          (j.company && j.company.toLowerCase().includes(sq)) ||
          j.description.toLowerCase().includes(sq);
        const matchesLocation = !lq || 
          (j.location && j.location.toLowerCase().includes(lq));
        return matchesSearch && matchesLocation;
      });
    }
  }, [activeTab, matches, allJobs, searchQuery, locationQuery]);

  // Reset pagination when search queries or tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, locationQuery]);

  // Paginate list
  const paginatedJobsList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredJobsList.slice(start, start + itemsPerPage);
  }, [filteredJobsList, currentPage]);

  const totalPages = Math.ceil(filteredJobsList.length / itemsPerPage);

  // Generate match score color
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (score >= 70) return "bg-indigo-50 text-indigo-700 border-indigo-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="relative bg-slate-50/30 font-sans text-slate-900 pb-12 min-h-full overflow-x-hidden">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-pink-50 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24 relative z-10 mt-4 sm:mt-8">
        {/* Active Profile Card */}
        {activeResume && (
          <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-indigo-300">
                  Active Search Profile
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{activeResume.title || "Untitled Resume"}</h3>
                <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                  We're matching roles based on this profile's skills and target title. To change the active resume, open Settings.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 flex flex-col sm:flex-row items-center mb-8 sm:mb-10">
          <div className="flex-1 flex items-center px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 w-full">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input 
              type="text" 
              placeholder="Job title, keyword, or company" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full outline-none py-1.5 text-sm text-slate-900 font-medium" 
            />
          </div>
          <div className="flex-1 flex items-center px-3 py-2 w-full">
            <MapPin className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input 
              type="text" 
              placeholder="Filter by location" 
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full outline-none py-1.5 text-sm text-slate-600" 
            />
          </div>
        </div>

        {/* Tab Toggle between matches and all jobs */}
        {resumes.length > 0 && (
          <div className="flex items-center justify-between gap-2 mb-6 border-b border-slate-200/60 pb-3">
            <button
              onClick={() => fetchJobsData(true)}
              disabled={isDataLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Force refresh (bypass cache)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDataLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("matches")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "matches"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Top Matches
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                All Related Roles
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Main Job Listings Column */}
          <div className="flex-1 space-y-3">
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4" />
                <p className="text-sm font-semibold text-slate-500">Matching the best roles for you...</p>
              </div>
            ) : filteredJobsList.length === 0 ? (
              (() => {
                const sourceList = activeTab === "matches" ? matches : allJobs;
                const sourceEmpty = sourceList.length === 0;
                const isFiltered = searchQuery.trim() !== "" || locationQuery.trim() !== "";

                // Source-empty + no filter → likely an AI/RapidAPI hiccup, not a real zero-result.
                if (sourceEmpty && !isFiltered) {
                  return (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-base font-bold text-slate-800 mb-1">
                        {activeTab === "matches" ? "Couldn't score your matches" : "Couldn't load roles"}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                        {activeTab === "matches"
                          ? "The AI matcher is temporarily unavailable. This usually clears in a few seconds."
                          : "We couldn't pull roles from the job source right now. Try again in a moment."}
                      </p>
                      <button
                        onClick={() => fetchJobsData(true)}
                        disabled={isDataLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isDataLoading ? "animate-spin" : ""}`} />
                        Try Again
                      </button>
                    </div>
                  );
                }

                // Has source rows but filter excluded them all → genuine "no results for this filter".
                return (
                  <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-base font-bold text-slate-800 mb-1">No jobs match your filters</h3>
                    <p className="text-xs text-slate-500">Try adjusting your search criteria or explore other roles.</p>
                  </div>
                );
              })()
            ) : (
              paginatedJobsList.map(item => {
                // In matches view, item is the match object containing the nested job
                const job: Job = activeTab === "matches" ? (item as any).job : (item as any);
                if (!job) return null;
                const matchScore = activeTab === "matches" ? (item as any).score : null;

                return (
                  <div 
                    key={job._id} 
                    onClick={() => handleOpenJob(job, activeTab === "matches" ? {
                      score: (item as any).score,
                      reasoning: (item as any).reasoning,
                      strengths: (item as any).strengths,
                      gaps: (item as any).gaps
                    } : null)}
                    className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      {/* Logo container */}
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
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

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <h3 className="text-[14px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {matchScore !== null && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getScoreColorClass(matchScore)}`}>
                                {matchScore}% Match
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs font-semibold text-slate-500 mb-2">
                          {job.company || "Unknown Company"} &bull; {job.location || "Anywhere"}
                        </p>
                        
                        <p className="text-[12.5px] text-slate-500 leading-relaxed mb-3.5 line-clamp-2">
                          {job.description.replace(/[#*`_-]/g, "")}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {job.remote && (
                            <span className="px-2 py-0.5 bg-indigo-50/50 text-indigo-600 text-[10px] font-bold rounded-md border border-indigo-50">
                              {job.remote_type || "Remote"}
                            </span>
                          )}
                          {job.employment_type && (
                            <span className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md border border-slate-100">
                              {job.employment_type}
                            </span>
                          )}
                          {job.salary_min && (
                            <span className="px-2 py-0.5 bg-emerald-50/50 text-emerald-600 text-[10px] font-bold rounded-md border border-emerald-50">
                              {job.salary_currency || "$"}{Math.round(job.salary_min / 1000)}k+
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 pb-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
                >
                  &larr; Previous
                </button>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Right Filters Panel */}
          <div className="w-full lg:w-64 shrink-0 lg:block">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter by
              </div>

              <div className="border-b border-slate-100 pb-3">
                <button 
                  onClick={() => setJobTypeOpen(!jobTypeOpen)}
                  className="flex items-center justify-between w-full py-2 hover:no-underline font-semibold text-sm text-slate-800 text-left cursor-pointer"
                >
                  <span>Job Type</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${jobTypeOpen ? 'rotate-180' : ''}`} />
                </button>
                {jobTypeOpen && (
                  <div className="pt-1.5 pb-1 space-y-2.5 animate-in fade-in duration-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                      Full-time
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900">
                      <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
                      Contract
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900">
                      <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                      Part-time
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Detail Modal overlay */}
      {selectedJob && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedJob(null)}
        >
          <div 
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedJob.logo ? (
                    <img src={selectedJob.logo} alt={selectedJob.company} className="w-full h-full object-contain" />
                  ) : selectedJob.company ? (
                    <img 
                      src={`https://logo.clearbit.com/${selectedJob.company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`} 
                      alt={selectedJob.company} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-sm">${selectedJob.company?.charAt(0) || ''}</div>`;
                        }
                      }}
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{selectedJob.title}</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    {selectedJob.company || "Unknown Company"} &bull; {selectedJob.location || "Anywhere"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              
              {/* AI Match Details Section */}
              {selectedMatchInfo && (
                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
                  <div className="flex items-center justify-between mb-3 border-b border-indigo-100/30 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                      <span className="text-xs font-bold text-indigo-950">AI Match Insights</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border bg-white ${getScoreColorClass(selectedMatchInfo.score)}`}>
                      {selectedMatchInfo.score}% Fit Score
                    </span>
                  </div>

                  {selectedMatchInfo.reasoning && (
                    <p className="text-xs font-semibold text-indigo-900/90 leading-relaxed mb-4">
                      {selectedMatchInfo.reasoning}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedMatchInfo.strengths && selectedMatchInfo.strengths.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-2">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
                        </div>
                        <ul className="space-y-1">
                          {selectedMatchInfo.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] font-semibold text-emerald-700">
                              <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedMatchInfo.gaps && selectedMatchInfo.gaps.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Potential Gaps
                        </div>
                        <ul className="space-y-1">
                          {selectedMatchInfo.gaps.map((gap, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] font-semibold text-amber-700">
                              <X className="w-3 h-3 text-amber-600 mt-0.5 shrink-0" />
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Meta details */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                {selectedJob.remote && (
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                    {selectedJob.remote_type || "Remote"}
                  </span>
                )}
                {selectedJob.employment_type && (
                  <span className="px-2.5 py-1 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-100">
                    {selectedJob.employment_type}
                  </span>
                )}
                {selectedJob.salary_min && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                    Salary: {selectedJob.salary_currency || "$"}{Math.round(selectedJob.salary_min / 1000)}k - {selectedJob.salary_max ? `${Math.round(selectedJob.salary_max / 1000)}k` : "Open"}
                  </span>
                )}
              </div>

              {/* Job Description (Markdown) */}
              <div className="prose prose-slate max-w-none text-slate-800 text-sm whitespace-pre-line">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-base font-extrabold text-slate-900 mt-6 mb-2.5 border-b pb-1 border-slate-100" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-[15px] font-bold text-slate-900 mt-5 mb-2 border-b pb-0.5 border-slate-100" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-sm font-bold text-slate-850 mt-4 mb-1.5" {...props} />,
                    p: ({node, ...props}) => <p className="text-[12.5px] text-slate-600 leading-relaxed mb-3.5 whitespace-pre-line" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4 text-[12.5px] text-slate-600" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-[12.5px] text-slate-600" {...props} />,
                    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-slate-950" {...props} />,
                  }}
                >
                  {selectedJob.description}
                </ReactMarkdown>
              </div>

            </div>

            {/* Apply & Optimize Button Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky bottom-0 z-20">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Posted {selectedJob.postedAt ? new Date(selectedJob.postedAt).toLocaleDateString() : "Recently"}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {resumes.length > 0 ? (
                  <button
                    onClick={() => {
                      navigate(
                        `/dashboard/review?id=${activeResumeId}&jobId=${selectedJob._id}`,
                        { state: { job: selectedJob, matchInfo: selectedMatchInfo } }
                      );
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-100 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    Optimize Resume
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/dashboard/builder");
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer border border-slate-200/60"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Upload Resume to Optimize
                  </button>
                )}
                {selectedJob.url && (
                  <a 
                    href={selectedJob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-700 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    Apply on Company Site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
