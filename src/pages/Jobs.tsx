import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search, SlidersHorizontal, Check, ChevronDown, X,
  Sparkles, Clock, ExternalLink, Briefcase,
  AlertCircle, ThumbsUp, Compass, RefreshCw, Bookmark, BookmarkCheck
} from "lucide-react";
import { useJobTracker } from "../hooks/useJobTracker";
import { CompanyLogo } from "../components/CompanyLogo";
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

// Phase-aware loading card. Shows the keyword being searched up front so
// users know what was extracted from their resume; after ~1.5s, swaps in
// a second line acknowledging that this is likely a cold cache miss and
// the wait is one-time.
function JobsLoadingState({
  activeTab,
  keyword,
}: {
  activeTab: "for-you" | "search";
  keyword: string | null;
}) {
  const primary = activeTab === "search"
    ? (keyword ? `Searching for “${keyword}”…` : "Searching…")
    : (keyword ? `Finding matches for “${keyword}”…` : "Finding the best matches for you…");

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-center px-6">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4" />
      <p className="text-sm font-semibold text-slate-700">{primary}</p>
    </div>
  );
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// US states for the State sub-filter. We keep both the full name and the
// abbreviation so we can match a job's free-text location whether it spells
// the state out ("California") or abbreviates it (", CA").
const US_STATES: { name: string; abbr: string }[] = [
  { name: "Alabama", abbr: "AL" }, { name: "Alaska", abbr: "AK" },
  { name: "Arizona", abbr: "AZ" }, { name: "Arkansas", abbr: "AR" },
  { name: "California", abbr: "CA" }, { name: "Colorado", abbr: "CO" },
  { name: "Connecticut", abbr: "CT" }, { name: "Delaware", abbr: "DE" },
  { name: "District of Columbia", abbr: "DC" }, { name: "Florida", abbr: "FL" },
  { name: "Georgia", abbr: "GA" }, { name: "Hawaii", abbr: "HI" },
  { name: "Idaho", abbr: "ID" }, { name: "Illinois", abbr: "IL" },
  { name: "Indiana", abbr: "IN" }, { name: "Iowa", abbr: "IA" },
  { name: "Kansas", abbr: "KS" }, { name: "Kentucky", abbr: "KY" },
  { name: "Louisiana", abbr: "LA" }, { name: "Maine", abbr: "ME" },
  { name: "Maryland", abbr: "MD" }, { name: "Massachusetts", abbr: "MA" },
  { name: "Michigan", abbr: "MI" }, { name: "Minnesota", abbr: "MN" },
  { name: "Mississippi", abbr: "MS" }, { name: "Missouri", abbr: "MO" },
  { name: "Montana", abbr: "MT" }, { name: "Nebraska", abbr: "NE" },
  { name: "Nevada", abbr: "NV" }, { name: "New Hampshire", abbr: "NH" },
  { name: "New Jersey", abbr: "NJ" }, { name: "New Mexico", abbr: "NM" },
  { name: "New York", abbr: "NY" }, { name: "North Carolina", abbr: "NC" },
  { name: "North Dakota", abbr: "ND" }, { name: "Ohio", abbr: "OH" },
  { name: "Oklahoma", abbr: "OK" }, { name: "Oregon", abbr: "OR" },
  { name: "Pennsylvania", abbr: "PA" }, { name: "Rhode Island", abbr: "RI" },
  { name: "South Carolina", abbr: "SC" }, { name: "South Dakota", abbr: "SD" },
  { name: "Tennessee", abbr: "TN" }, { name: "Texas", abbr: "TX" },
  { name: "Utah", abbr: "UT" }, { name: "Vermont", abbr: "VT" },
  { name: "Virginia", abbr: "VA" }, { name: "Washington", abbr: "WA" },
  { name: "West Virginia", abbr: "WV" }, { name: "Wisconsin", abbr: "WI" },
  { name: "Wyoming", abbr: "WY" },
];

// Countries offered in the filter. `aliases` are lowercased forms we accept
// inside a job's free-text location. Only United States exposes the State
// sub-filter (US_STATES above).
const COUNTRIES: { name: string; aliases: string[] }[] = [
  { name: "United States", aliases: ["united states", "usa", "us", "u.s.a"] },
  { name: "Canada", aliases: ["canada"] },
  { name: "United Kingdom", aliases: ["united kingdom", "uk", "england", "scotland", "wales", "britain"] },
  { name: "Australia", aliases: ["australia"] },
  { name: "Germany", aliases: ["germany", "deutschland"] },
  { name: "France", aliases: ["france"] },
  { name: "Netherlands", aliases: ["netherlands", "holland"] },
  { name: "Ireland", aliases: ["ireland"] },
  { name: "Spain", aliases: ["spain"] },
  { name: "India", aliases: ["india"] },
  { name: "Singapore", aliases: ["singapore"] },
  { name: "Brazil", aliases: ["brazil", "brasil"] },
  { name: "Mexico", aliases: ["mexico", "méxico"] },
  { name: "Japan", aliases: ["japan"] },
];

// Match a job's location string against a US state, accepting either the full
// name (case-insensitive) or the abbreviation as a standalone token (", CA" /
// "CA," / " CA ") so we never match the letters inside another word.
const matchesState = (jobLoc: string, state: { name: string; abbr: string }): boolean => {
  if (jobLoc.toLowerCase().includes(state.name.toLowerCase())) return true;
  return new RegExp(`(^|[,\\s])${state.abbr}([,\\s]|$)`).test(jobLoc);
};

const matchesCountry = (jobLoc: string, countryName: string): boolean => {
  const country = COUNTRIES.find((c) => c.name === countryName);
  if (!country) return true;
  const loc = jobLoc.toLowerCase();
  if (country.aliases.some((a) => new RegExp(`\\b${escapeRegExp(a)}\\b`).test(loc))) {
    return true;
  }
  // US listings frequently drop the country and show only "City, ST" — treat
  // any recognized US state token as United States.
  if (countryName === "United States") {
    return US_STATES.some((s) => matchesState(jobLoc, s));
  }
  return false;
};

export function Jobs() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const openJobId = searchParams.get("openJobId");

  const [activeTab, setActiveTab] = useState<"for-you" | "search">("for-you");
  const [resumes, setResumes] = useState<any[]>([]);
  const activeResume = resumes.find(r => r.isDefault) || resumes[0];
  const activeResumeId = activeResume?._id || "none";
  const [matches, setMatches] = useState<Match[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  
  const [isResumesLoading, setIsResumesLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { tracked, isSaving: isTracking, track } = useJobTracker(selectedJob?._id);
  const [selectedMatchInfo, setSelectedMatchInfo] = useState<{
    score: number;
    reasoning?: string;
    strengths?: string[];
    gaps?: string[];
  } | null>(null);
  const [isStructuring, setIsStructuring] = useState(false);
  
  const [zipCode, setZipCode] = useState<string>("");
  const [resolvedCityState, setResolvedCityState] = useState<{ city: string; state: string } | null>(null);
  const [isResolvingZip, setIsResolvingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [geoOpen, setGeoOpen] = useState(true);
  
  const [jobTypeOpen, setJobTypeOpen] = useState(true);
  // All three filter sections are collapsible for a consistent UX —
  // previously only Job Type collapsed, which felt arbitrary.
  const [locationOpen, setLocationOpen] = useState(true);
  const [salaryOpen, setSalaryOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Daily Refresh quota. Backend enforces the cap; UI just displays it.
  const [refreshQuota, setRefreshQuota] = useState<{
    used: number; limit: number; remaining: number;
  } | null>(null);

  // Search-tab state. `searchInput` is what's currently typed; `searchKeyword`
  // is the most recently submitted query (used as the backend keyword). They
  // separate so typing doesn't refetch — only submit does.
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const latestSearchKeywordRef = useRef(searchKeyword);
  const latestActiveTabRef = useRef(activeTab);
  const activeJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    latestSearchKeywordRef.current = searchKeyword;
  }, [searchKeyword]);

  useEffect(() => {
    latestActiveTabRef.current = activeTab;
  }, [activeTab]);

  const fetchRefreshQuota = useCallback(async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/jobs/refresh-status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) setRefreshQuota(await res.json());
    } catch (e) {
      // Non-fatal — button just won't show a counter.
      console.error("Failed to fetch refresh quota:", e);
    }
  }, []);

  useEffect(() => {
    fetchRefreshQuota();
  }, [fetchRefreshQuota]);

  // --- Filter state ---
  // employmentTypes: set of selected canonical labels. Empty set = no
  // restriction (don't accidentally hide every job when the user touches no
  // checkboxes).
  const EMPLOYMENT_LABELS = ["Full-time", "Part-time", "Contract", "Internship"] as const;
  type EmploymentLabel = (typeof EMPLOYMENT_LABELS)[number];
  const [employmentTypes, setEmploymentTypes] = useState<Set<EmploymentLabel>>(new Set());
  const [remoteFilters, setRemoteFilters] = useState<Set<"remote" | "onsite" | "hybrid">>(new Set());
  // Minimum salary in thousands per year. null = no floor.
  const [minSalaryK, setMinSalaryK] = useState<number | null>(null);

  const activeFilterCount =
    employmentTypes.size +
    remoteFilters.size +
    (minSalaryK !== null ? 1 : 0) +
    (zipCode.trim().length === 5 && resolvedCityState ? 1 : 0) +
    (selectedCountry ? 1 : 0) +
    (selectedCountry === "United States" && selectedState ? 1 : 0);

  const clearFilters = () => {
    setEmploymentTypes(new Set());
    setRemoteFilters(new Set());
    setMinSalaryK(null);
    setZipCode("");
    setResolvedCityState(null);
    setSelectedCountry("");
    setSelectedState("");
  };

  // Map RapidAPI's noisy raw employment_type values (FULL_TIME, Full Time,
  // full-time, "FULL_TIME, OTHER" from our list-flattening, etc.) onto our
  // canonical labels.
  const employmentMatches = (raw: string | null | undefined, selected: Set<EmploymentLabel>): boolean => {
    if (selected.size === 0) return true;
    if (!raw) return false;
    const lower = raw.toLowerCase();
    for (const label of selected) {
      if (label === "Full-time" && (lower.includes("full"))) return true;
      if (label === "Part-time" && lower.includes("part")) return true;
      if (label === "Contract" && (lower.includes("contract") || lower.includes("contractor"))) return true;
      if (label === "Internship" && (lower.includes("intern"))) return true;
    }
    return false;
  };

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
          setActiveTab("search");
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

  // Resolve ZIP code to City, State
  useEffect(() => {
    const trimmedZip = zipCode.trim();
    if (/^\d{5}$/.test(trimmedZip)) {
      const resolve = async () => {
        setIsResolvingZip(true);
        setZipError(null);
        try {
          const res = await fetch(`https://api.zippopotam.us/us/${trimmedZip}`);
          if (res.ok) {
            const data = await res.json();
            if (data?.places?.length > 0) {
              const place = data.places[0];
              setResolvedCityState({
                city: place["place name"],
                state: place["state abbreviation"]
              });
            } else {
              setResolvedCityState(null);
              setZipError("ZIP code not found");
            }
          } else {
            setResolvedCityState(null);
            setZipError("Invalid ZIP code");
          }
        } catch (e) {
          console.error("Failed to resolve zip code:", e);
          setZipError("Network error checking ZIP code");
        } finally {
          setIsResolvingZip(false);
        }
      };
      resolve();
    } else {
      setResolvedCityState(null);
      if (trimmedZip.length > 0 && trimmedZip.length !== 5) {
        setZipError("ZIP code must be 5 digits");
      } else {
        setZipError(null);
      }
    }
  }, [zipCode]);



  // The keyword the backend will extract from this resume mirrors
  // extract_keywords_from_resume in jobs.py: prefer jobTitle, fall back to
  // the first skill. Shown in the loading state so users know what's being
  // searched on their behalf.
  const activeKeyword: string | null = useMemo(() => {
    const data = activeResume?.extractedData;
    const jobTitle = data?.personalInfo?.jobTitle;
    if (typeof jobTitle === "string" && jobTitle.trim()) return jobTitle.trim();
    const skills = data?.skills;
    if (Array.isArray(skills) && typeof skills[0] === "string" && skills[0].trim()) {
      return skills[0].trim();
    }
    return null;
  }, [activeResume]);

  // Load initial cached data from localStorage if present to prevent spinner flash.
  // For You cache is per-resume; Search cache is per-submitted-keyword so two
  // different searches don't cross-pollinate each other's previews.
  useEffect(() => {
    if (isResumesLoading) return;
    try {
      const cachedMatches = localStorage.getItem(`jobplotter_cached_matches_${activeResumeId}`);
      const searchCacheKey = searchKeyword.trim()
        ? `jobplotter_cached_search_${searchKeyword.trim().toLowerCase()}`
        : null;
      const cachedSearch = searchCacheKey ? localStorage.getItem(searchCacheKey) : null;

      setMatches(cachedMatches ? JSON.parse(cachedMatches) : []);
      setAllJobs(cachedSearch ? JSON.parse(cachedSearch) : []);

      if (activeTab === "search" && !searchKeyword.trim()) {
        // Search tab with no query yet → nothing to fetch, nothing to load.
        // Render the empty "Search for jobs" prompt instead of a spinner.
        setIsDataLoading(false);
      } else {
        const hasCache = activeTab === "for-you" ? !!cachedMatches : !!cachedSearch;
        setIsDataLoading(!hasCache);
      }
    } catch (e) {
      console.error("Failed to load jobs cache:", e);
    }
  }, [activeResumeId, isResumesLoading, activeTab, searchKeyword]);

  // Tracks the (tab, resume, force) combo currently in-flight. Skipping
  // re-entrant calls for the same combo prevents the double-/jobs/matches
  // burst we used to see on cold mount (effect deps churning while resumes
  // load) — which racing burned RapidAPI quota on every cold cache miss.
  const inFlightRef = useRef<string | null>(null);

  const fetchJobsData = useCallback(async (force = false) => {
    setError(null);
    // Search tab needs a submitted query to do anything. Bail out cleanly
    // so the empty-state UI ("type a search") can render without spinners.
    if (activeTab === "search" && !searchKeyword.trim()) {
      setAllJobs([]);
      setIsDataLoading(false);
      inFlightRef.current = null;
      return;
    }

    // Cache keys differ by mode. For You is per-resume (matches don't change
    // with keystrokes); Search is per-keyword (every submitted query is its
    // own corpus slice).
    const cacheKey = activeTab === "for-you"
      ? `jobplotter_cached_matches_${activeResumeId}`
      : `jobplotter_cached_search_${searchKeyword.trim().toLowerCase()}`;

    const inFlightKey = activeTab === "for-you"
      ? `for-you:${activeResumeId}:${force ? "force" : "auto"}`
      : `search:${searchKeyword.trim().toLowerCase()}:${force ? "force" : "auto"}`;
    if (inFlightRef.current === inFlightKey) {
      return;
    }
    inFlightRef.current = inFlightKey;

    if (!force) {
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
      if (cachedIsNonEmpty && isCacheFresh(cacheKey)) {
        setIsDataLoading(false);
        inFlightRef.current = null;
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
      const base = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

      if (activeTab === "for-you") {
        const params = new URLSearchParams();
        if (force) params.set("force_refresh", "true");
        
        let locationParam = "";
        if (resolvedCityState) {
          locationParam = `${resolvedCityState.city}, ${resolvedCityState.state}`;
        }
        if (locationParam) {
          params.set("location", locationParam);
        }

        const response = await fetch(`${base}/jobs/matches?${params.toString()}`, { headers });
        if (response.ok) {
          const data = await response.json();

          // Discard if user navigated away from the For You tab before completion
          if (latestActiveTabRef.current !== "for-you") return;

          setMatches(data);
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(`${cacheKey}_ts`, String(Date.now()));
          } else {
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_ts`);
          }
        } else {
          if (latestActiveTabRef.current === "for-you") {
            setError("The AI matcher is temporarily unavailable. Please try again in a few seconds.");
          }
        }
      } else {
        // Search mode: hit /jobs/ with the user-typed keyword. Backend uses
        // it as the corpus search key; no resume lookup happens.
        const params = new URLSearchParams({ keyword: searchKeyword.trim() });
        if (force) params.set("force_refresh", "true");
        
        let locationParam = "";
        if (resolvedCityState) {
          locationParam = `${resolvedCityState.city}, ${resolvedCityState.state}`;
        }
        if (locationParam) {
          params.set("location", locationParam);
        }

        const response = await fetch(`${base}/jobs/?${params.toString()}`, { headers });
        if (response.ok) {
          const data = await response.json();

          // Discard if user changed the search keyword or tab before this completes (race condition)
          if (
            latestActiveTabRef.current !== "search" ||
            latestSearchKeywordRef.current.trim().toLowerCase() !== searchKeyword.trim().toLowerCase()
          ) {
            return;
          }

          setAllJobs(data);
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            localStorage.setItem(`${cacheKey}_ts`, String(Date.now()));
          } else {
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(`${cacheKey}_ts`);
          }
        } else {
          if (
            latestActiveTabRef.current === "search" &&
            latestSearchKeywordRef.current.trim().toLowerCase() === searchKeyword.trim().toLowerCase()
          ) {
            setError("We couldn't connect to the job search service. Please try again.");
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch jobs data:", err);
      // Only set error if the search is still relevant to the user's current view
      const isStillRelevant =
        activeTab === latestActiveTabRef.current &&
        (activeTab === "for-you" ||
          latestSearchKeywordRef.current.trim().toLowerCase() === searchKeyword.trim().toLowerCase());
      if (isStillRelevant) {
        setError("A network error occurred. Please check your connection and try again.");
      }
    } finally {
      setIsDataLoading(false);
      inFlightRef.current = null;
      // A forced refresh either consumed a credit or was denied; in
      // either case the server-side counter changed and we want the
      // button label to reflect that immediately.
      if (force) {
        const isStillRelevant =
          activeTab === latestActiveTabRef.current &&
          (activeTab === "for-you" ||
            latestSearchKeywordRef.current.trim().toLowerCase() === searchKeyword.trim().toLowerCase());
        if (isStillRelevant) {
          fetchRefreshQuota();
        }
      }
    }
  }, [activeTab, activeResumeId, searchKeyword, fetchRefreshQuota, resolvedCityState]);

  useEffect(() => {
    if (!isResumesLoading) {
      fetchJobsData(false);
    }
  }, [fetchJobsData, isResumesLoading]);

  // Handle URL deep-linking for openJobId
  useEffect(() => {
    if (openJobId && !isDataLoading) {
      if (activeTab === "for-you") {
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
    const jobId = job.jobId || job._id;
    activeJobIdRef.current = jobId;
    
    // Open modal immediately with the current raw job details to keep the interface instant
    setSelectedJob(job);
    setSelectedMatchInfo(matchInfo);
    
    const looksRaw = !job.description.includes("##") && job.description.length >= 200;
    if (looksRaw) {
      setIsStructuring(true);
    } else {
      setIsStructuring(false);
    }
    
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
          
          // Only update selectedJob if this fetch is still for the currently active job
          if (activeJobIdRef.current === jobId) {
            setSelectedJob(structuredJob);
          }
          
          // Propagate structured details back to list to cache in memory
          if (activeTab === "for-you") {
            setMatches(prev => prev.map(m => {
              if (m.job.jobId === jobId || m.job._id === job._id) {
                return { ...m, job: structuredJob };
              }
              return m;
            }));
          } else {
            setAllJobs(prev => prev.map(j => {
              if (j.jobId === jobId || j._id === job._id) {
                return structuredJob;
              }
              return j;
            }));
          }
        }
      }
    } catch (err) {
      console.error("Failed to record job visit and retrieve structured description:", err);
    } finally {
      if (activeJobIdRef.current === jobId) {
        setIsStructuring(false);
      }
    }
  };

  // Filter jobs locally using only the sidebar controls. Text/location
  // search are no longer client-side concerns — Search has its own typed
  // keyword that drives a backend fetch, and For You has no text input.
  const filteredJobsList = useMemo(() => {
    const minSalary = minSalaryK !== null ? minSalaryK * 1000 : null;

    const passesAll = (j: Job): boolean => {
      if (!employmentMatches(j.employment_type, employmentTypes)) return false;
      
      const isHybrid = !!(j.remote_type?.toLowerCase().includes("hybrid") || j.location?.toLowerCase().includes("hybrid"));
      
      let jobWorkplaceType: "remote" | "hybrid" | "onsite" = "onsite";
      if (isHybrid) {
        jobWorkplaceType = "hybrid";
      } else if (j.remote) {
        jobWorkplaceType = "remote";
      }

      if (remoteFilters.size > 0 && !remoteFilters.has(jobWorkplaceType)) {
        return false;
      }

      if (minSalary !== null) {
        if (typeof j.salary_min !== "number" || j.salary_min < minSalary) return false;
      }

      // Location matching from a resolved ZIP code (matched on city name).
      if (resolvedCityState) {
        const jobLoc = (j.location || "").toLowerCase();
        if (!jobLoc.includes(resolvedCityState.city.toLowerCase())) return false;
      }

      // Country / state gates. Applied independently of the ZIP/profile block
      // above, so they compose as an AND with whatever else is selected.
      if (selectedCountry && !matchesCountry(j.location || "", selectedCountry)) {
        return false;
      }
      if (selectedCountry === "United States" && selectedState) {
        const st = US_STATES.find((s) => s.name === selectedState);
        if (st && !matchesState(j.location || "", st)) return false;
      }

      return true;
    };

    if (activeTab === "for-you") {
      return matches.filter((m) => m.job && passesAll(m.job));
    }
    return allJobs.filter(passesAll);
  }, [activeTab, matches, allJobs, employmentTypes, remoteFilters, minSalaryK, resolvedCityState, selectedCountry, selectedState]);

  // Reset pagination when search/filters/tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchKeyword, employmentTypes, remoteFilters, minSalaryK, zipCode, selectedCountry, selectedState]);

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
        {/* Active Profile Card. Only relevant on the For You tab — Search
            isn't keyed on the resume so showing the profile would imply
            it affects results when it doesn't. */}
        {/* Active Profile Banner - subtle layout */}
        {activeResume && activeTab === "for-you" && (
          <section className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-4.5 relative overflow-hidden mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/40 mt-0.5">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-[13px] font-extrabold text-slate-800 flex items-center gap-1.5 leading-snug">
                  Active Matching Profile: <span className="text-indigo-600 font-extrabold">{activeResume.title || "Untitled Resume"}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl font-medium leading-normal">
                  Matching jobs based on this profile's extracted skills and target title.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap px-3 py-1.5 bg-white border border-indigo-100/80 rounded-lg shadow-2xs hover:shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              Change Active Profile
            </button>
          </section>
        )}

        {/* Tab bar. Tabs sit on the LEFT as the primary navigation —
            they define the page's mode, so the user's eye should land on
            them first. Secondary actions (Refresh, mobile Filters toggle)
            sit on the right so they don't compete for visual hierarchy.
            Always visible regardless of resume count: a user without a
            resume can still try Search; clicking For You shows a "Upload
            a resume" empty state. */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-200/60 pb-5">
          {/* Primary: mode tabs - segmented control for maximum visibility */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 w-full sm:w-fit border border-slate-200/50 shadow-xs">
            <button
              onClick={() => setActiveTab("for-you")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[13px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "for-you"
                  ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeTab === 'for-you' ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
              For You
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[13px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "search"
                  ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <Compass className={`w-4 h-4 ${activeTab === 'search' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Search Roles
            </button>
          </div>

          {/* Secondary: actions */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={() => fetchJobsData(true)}
              disabled={isDataLoading || (refreshQuota !== null && refreshQuota.remaining === 0)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shadow-xs"
              title={
                refreshQuota === null
                  ? "Force refresh (bypass cache)"
                  : refreshQuota.remaining === 0
                  ? "Daily refresh limit reached. Resets at midnight UTC."
                  : `Pulls fresh listings from the source. ${refreshQuota.remaining} left today.`
              }
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDataLoading ? "animate-spin" : ""}`} />
              Refresh
              {/* Show explicit "X left" badge only when the user has spent
                  at least one credit. Hiding it when fresh keeps the
                  button visually quiet for the 99% of users who never hit
                  the cap. */}
              {refreshQuota !== null && refreshQuota.used > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                    refreshQuota.remaining === 0
                      ? "bg-slate-200 text-slate-500"
                      : "bg-indigo-50 text-indigo-700"
                  }`}
                >
                  {refreshQuota.remaining} left
                </span>
              )}
            </button>
            {/* Mobile filter toggle. Desktop has the panel always visible
                to the right of the listings, so we hide this on lg+. */}
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="jobs-filter-panel"
              className={`lg:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border whitespace-nowrap shadow-xs ${
                filtersOpen
                  ? "bg-slate-900 text-white border-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border-slate-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                    filtersOpen ? "bg-white/20 text-white" : "bg-indigo-600 text-white"
                  }`}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Main Job Listings Column */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Search tab's primary control. Bigger and styled like a real
                search bar so it reads as the page's main action when this
                tab is selected. Submit (Enter or button) sets searchKeyword,
                which the fetch effect picks up. */}
            {activeTab === "search" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = searchInput.trim();
                  if (!trimmed || trimmed === searchKeyword) return;
                  setSearchKeyword(trimmed);
                }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex items-center gap-2 mb-1"
              >
                <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search jobs by title, role, or technology…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 outline-none py-2 text-sm text-slate-900 font-medium bg-transparent"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearchKeyword("");
                      setAllJobs([]);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!searchInput.trim() || searchInput.trim() === searchKeyword}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Search
                </button>
              </form>
            )}

            {/* Search tab with nothing submitted yet → friendly empty prompt
                instead of a "no results" card. Skipped on the For You tab
                because that fetches automatically on mount. */}
            {activeTab === "search" && !searchKeyword && !isDataLoading ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-800 mb-1">Search for jobs</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type a role, skill, or keyword above. The filter sidebar still applies to the results.
                </p>
              </div>
            ) : error ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-in zoom-in duration-300" />
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  {activeTab === "for-you"
                    ? "Couldn't score your matches"
                    : "Couldn't load search results"}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                  {error}
                </p>
                <button
                  onClick={() => fetchJobsData(true)}
                  disabled={isDataLoading || (refreshQuota !== null && refreshQuota.remaining === 0)}
                  title={
                    refreshQuota !== null && refreshQuota.remaining === 0
                      ? "Daily refresh limit reached. Resets at midnight UTC."
                      : undefined
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDataLoading ? "animate-spin" : ""}`} />
                  {refreshQuota !== null && refreshQuota.remaining === 0
                    ? "Daily limit reached"
                    : "Try Again"}
                  {refreshQuota !== null && refreshQuota.remaining > 0 && refreshQuota.used > 0 && (
                    <span className="ml-1 opacity-80">({refreshQuota.remaining} left)</span>
                  )}
                </button>
              </div>
            ) : isDataLoading ? (
              <JobsLoadingState
                activeTab={activeTab}
                keyword={activeTab === "search" ? searchKeyword || null : activeKeyword}
              />
            ) : filteredJobsList.length === 0 ? (
              (() => {
                const sourceList = activeTab === "for-you" ? matches : allJobs;
                const sourceEmpty = sourceList.length === 0;
                const isFiltered = activeFilterCount > 0;

                // For You with no resume on file → a friendly upload CTA,
                // not the generic "couldn't score" error. The matcher needs
                // a resume to work; tell users that directly.
                if (activeTab === "for-you" && resumes.length === 0) {
                  return (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                      <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                      <h3 className="text-base font-bold text-slate-800 mb-1">
                        Upload a resume to unlock For You
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                        The For You feed matches jobs against your resume's skills and target title.
                        Add one to see personalized roles here.
                      </p>
                      <button
                        onClick={() => navigate("/dashboard/builder")}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Build a resume
                      </button>
                    </div>
                  );
                }

                // Source-empty + no filter → likely an AI/RapidAPI hiccup, not a real zero-result.
                if (sourceEmpty && !isFiltered) {
                  return (
                    <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                      <h3 className="text-base font-bold text-slate-800 mb-1">
                        {activeTab === "for-you"
                          ? "Couldn't score your matches"
                          : `No results for “${searchKeyword}”`}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                        {activeTab === "for-you"
                          ? "The AI matcher is temporarily unavailable. This usually clears in a few seconds."
                          : "Try a different keyword, or click Try Again to fetch fresh listings from the source."}
                      </p>
                      <button
                        onClick={() => fetchJobsData(true)}
                        disabled={isDataLoading || (refreshQuota !== null && refreshQuota.remaining === 0)}
                        title={
                          refreshQuota !== null && refreshQuota.remaining === 0
                            ? "Daily refresh limit reached. Resets at midnight UTC."
                            : undefined
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isDataLoading ? "animate-spin" : ""}`} />
                        {refreshQuota !== null && refreshQuota.remaining === 0
                          ? "Daily limit reached"
                          : "Try Again"}
                        {refreshQuota !== null && refreshQuota.remaining > 0 && refreshQuota.used > 0 && (
                          <span className="ml-1 opacity-80">({refreshQuota.remaining} left)</span>
                        )}
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
                const job: Job = activeTab === "for-you" ? (item as any).job : (item as any);
                if (!job) return null;
                const matchScore = activeTab === "for-you" ? (item as any).score : null;

                return (
                  <div 
                    key={job._id} 
                    onClick={() => handleOpenJob(job, activeTab === "for-you" ? {
                      score: (item as any).score,
                      reasoning: (item as any).reasoning,
                      strengths: (item as any).strengths,
                      gaps: (item as any).gaps
                    } : null)}
                    className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      <CompanyLogo
                        company={job.company}
                        logo={job.logo}
                        className="w-11 h-11"
                      />

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

          <div
            id="jobs-filter-panel"
            className={`w-full lg:w-64 shrink-0 lg:order-none ${
              filtersOpen ? "block order-first" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filter by
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Job Type */}
              <div className="border-b border-slate-100 pb-3 mb-3">
                <button
                  onClick={() => setJobTypeOpen(!jobTypeOpen)}
                  className="flex items-center justify-between w-full py-1 font-semibold text-sm text-slate-800 text-left cursor-pointer"
                >
                  <span>Job Type</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${jobTypeOpen ? 'rotate-180' : ''}`} />
                </button>
                {jobTypeOpen && (
                  <div className="pt-1.5 pb-1 space-y-2.5 animate-in fade-in duration-200">
                    {EMPLOYMENT_LABELS.map((label) => {
                      const checked = employmentTypes.has(label);
                      return (
                        <label
                          key={label}
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setEmploymentTypes((prev) => {
                                const next = new Set(prev);
                                if (checked) next.delete(label);
                                else next.add(label);
                                return next;
                              });
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Workplace Type */}
              <div className="border-b border-slate-100 pb-3 mb-3">
                <button
                  onClick={() => setLocationOpen(!locationOpen)}
                  className="flex items-center justify-between w-full py-1 font-semibold text-sm text-slate-800 text-left cursor-pointer"
                >
                  <span>Workplace Type</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${locationOpen ? 'rotate-180' : ''}`} />
                </button>
                {locationOpen && (
                  <div className="pt-1.5 pb-1 space-y-2.5 animate-in fade-in duration-200">
                    {([
                      { value: "remote", label: "Remote" },
                      { value: "hybrid", label: "Hybrid" },
                      { value: "onsite", label: "On-site" },
                    ] as const).map((opt) => {
                      const checked = remoteFilters.has(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setRemoteFilters((prev) => {
                                const next = new Set(prev);
                                if (checked) next.delete(opt.value);
                                else next.add(opt.value);
                                return next;
                              });
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Geographic Location */}
              <div className="border-b border-slate-100 pb-3 mb-3">
                <button
                  onClick={() => setGeoOpen(!geoOpen)}
                  className="flex items-center justify-between w-full py-1 font-semibold text-sm text-slate-800 text-left cursor-pointer"
                >
                  <span>Geographic Location</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${geoOpen ? 'rotate-180' : ''}`} />
                </button>
                {geoOpen && (
                  <div className="pt-2 pb-1 space-y-3.5 animate-in fade-in duration-200">
                    {/* Country select. Drives international filtering; when
                        United States is chosen, the State select appears. */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Country
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCountry}
                          onChange={(e) => {
                            setSelectedCountry(e.target.value);
                            // Drop any chosen state when leaving the US so a
                            // stale state filter can't silently exclude jobs.
                            if (e.target.value !== "United States") setSelectedState("");
                          }}
                          className="w-full appearance-none pl-2.5 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 bg-white outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 cursor-pointer"
                        >
                          <option value="">Any country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* State select — only meaningful for US listings. */}
                    {selectedCountry === "United States" && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          State
                        </label>
                        <div className="relative">
                          <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full appearance-none pl-2.5 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 bg-white outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 cursor-pointer"
                          >
                            <option value="">Any state</option>
                            {US_STATES.map((s) => (
                              <option key={s.abbr} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    )}

                    {/* ZIP Code Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Filter by ZIP Code
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="e.g. 90210"
                          value={zipCode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setZipCode(val);
                          }}
                          className="w-full pl-2.5 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
                        />
                        {isResolvingZip && (
                          <div className="absolute right-2.5 animate-spin h-3.5 w-3.5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                        )}
                        {!isResolvingZip && zipCode && (
                          <button
                            onClick={() => {
                              setZipCode("");
                              setResolvedCityState(null);
                            }}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {resolvedCityState && (
                        <p className="text-[10px] font-bold text-emerald-600 leading-tight">
                          Resolved: {resolvedCityState.city}, {resolvedCityState.state}
                        </p>
                      )}
                      {zipError && (
                        <p className="text-[10px] font-semibold text-rose-500 leading-tight">
                          {zipError}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Salary floor */}
              <div>
                <button
                  onClick={() => setSalaryOpen(!salaryOpen)}
                  className="flex items-center justify-between w-full py-1 font-semibold text-sm text-slate-800 text-left cursor-pointer"
                >
                  <span>Minimum salary</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${salaryOpen ? 'rotate-180' : ''}`} />
                </button>
                {salaryOpen && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={5}
                        placeholder="e.g. 80"
                        value={minSalaryK ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setMinSalaryK(v === "" ? null : Math.max(0, parseInt(v, 10) || 0));
                        }}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
                      />
                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">k / yr</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Jobs without a posted salary are hidden when this is set.
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile-only Done button — quickest way to dismiss the
                  filter panel after applying. On desktop the panel is
                  always docked, so the button has no purpose there. */}
              <button
                onClick={() => setFiltersOpen(false)}
                className="lg:hidden w-full mt-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Detail Modal overlay */}
      {selectedJob && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => {
            setSelectedJob(null);
            activeJobIdRef.current = null;
            setIsStructuring(false);
          }}
        >
          <div 
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex gap-4 items-center">
                <CompanyLogo
                  company={selectedJob.company}
                  logo={selectedJob.logo}
                  className="w-12 h-12"
                />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{selectedJob.title}</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    {selectedJob.company || "Unknown Company"} &bull; {selectedJob.location || "Anywhere"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedJob(null);
                  activeJobIdRef.current = null;
                  setIsStructuring(false);
                }}
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
              {isStructuring ? (
                <div className="space-y-6 animate-pulse">
                  {/* Skeleton lines */}
                  <div className="space-y-4">
                    {/* Header 1 placeholder */}
                    <div className="h-4 bg-slate-200/80 rounded-md w-1/3" />
                    {/* Paragraph placeholders */}
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded-md w-full" />
                      <div className="h-3 bg-slate-100 rounded-md w-5/6" />
                      <div className="h-3 bg-slate-100 rounded-md w-4/5" />
                    </div>
                    
                    {/* Header 2 placeholder */}
                    <div className="h-4 bg-slate-200/80 rounded-md w-1/4 pt-2" />
                    {/* List item placeholders */}
                    <div className="space-y-2.5 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <div className="h-3 bg-slate-100 rounded-md w-11/12" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <div className="h-3 bg-slate-100 rounded-md w-5/6" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <div className="h-3 bg-slate-100 rounded-md w-10/12" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}

            </div>

            {/* Apply & Optimize Button Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky bottom-0 z-20">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Posted {selectedJob.postedAt ? new Date(selectedJob.postedAt).toLocaleDateString() : "Recently"}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {tracked ? (
                  <span
                    title="Already in your tracker — manage it on the Applications page"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    Tracked
                  </span>
                ) : (
                  <button
                    onClick={track}
                    disabled={isTracking}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {isTracking ? "Tracking…" : "Track Job"}
                  </button>
                )}
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
