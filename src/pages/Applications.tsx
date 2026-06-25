import { useState, useEffect, useMemo } from "react";
import {
  Briefcase, Clock, Loader2, Trash2, ChevronDown,
  ClipboardList, X, ExternalLink,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CompanyLogo } from "../components/CompanyLogo";

type Status = "saved" | "applied" | "interviewing" | "offer" | "rejected";

const STATUS_ORDER: Status[] = ["saved", "applied", "interviewing", "offer", "rejected"];

const STATUS_LABEL: Record<Status, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

const STATUS_CHIP: Record<Status, string> = {
  saved: "bg-slate-100 text-slate-700 border-slate-200",
  applied: "bg-indigo-50 text-indigo-700 border-indigo-200",
  interviewing: "bg-amber-50 text-amber-700 border-amber-200",
  offer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

interface Application {
  _id: string;
  jobId: string;
  status: Status;
  savedAt: string;
  appliedAt?: string;
  updatedAt: string;
  job: any;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const getCurrencySymbol = (currencyCode?: string, location?: string): string => {
  if (currencyCode) {
    const code = currencyCode.toUpperCase();
    if (code === 'USD' || code === 'CAD' || code === 'AUD' || code === 'NZD' || code === 'SGD' || code === '$') return '$';
    if (code === 'GBP' || code === '£') return '£';
    if (code === 'EUR' || code === '€') return '€';
    if (code === 'INR' || code === '₹') return '₹';
    if (code === 'JPY' || code === '¥') return '¥';
    if (['$', '£', '€', '₹', '¥'].includes(currencyCode)) return currencyCode;
  }
  
  if (location) {
    const loc = location.toLowerCase();
    if (loc.includes('united kingdom') || loc.includes('uk') || loc.includes('london') || loc.includes('gbp')) return '£';
    if (loc.includes('germany') || loc.includes('france') || loc.includes('europe') || loc.includes('spain') || loc.includes('italy') || loc.includes('netherlands') || loc.includes('eur')) return '€';
    if (loc.includes('india') || loc.includes('inr')) return '₹';
    if (loc.includes('japan') || loc.includes('jpy')) return '¥';
    if (loc.includes('canada') || loc.includes('australia') || loc.includes('singapore')) return '$';
  }

  try {
    const locale = navigator.language;
    if (locale.includes('GB') || locale.includes('en-GB')) return '£';
    if (locale.includes('FR') || locale.includes('DE') || locale.includes('IT') || locale.includes('NL') || locale.includes('ES')) return '€';
    if (locale.includes('IN')) return '₹';
    if (locale.includes('JP')) return '¥';
  } catch (e) {}

  return '$';
};

export function Applications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  // Only saved-status rows open this; other statuses (applied, etc.) stay
  // display-only because the user has already moved past "save then apply".
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const fetchApps = async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const res = await fetch(`${API_URL}/applications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApps(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const counts = useMemo(() => {
    const c: Record<Status | "all", number> = {
      all: apps.length,
      saved: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0,
    };
    for (const a of apps) c[a.status]++;
    return c;
  }, [apps]);

  const visibleApps = useMemo(() => {
    if (statusFilter === "all") return apps;
    return apps.filter((a) => a.status === statusFilter);
  }, [apps, statusFilter]);

  const handleStatusChange = async (appId: string, status: Status) => {
    setPendingId(appId);
    // Optimistic update.
    setApps((prev) =>
      prev.map((a) => (a._id === appId ? { ...a, status, updatedAt: new Date().toISOString() } : a))
    );
    try {
      const token = localStorage.getItem("jobplotter_token");
      const res = await fetch(`${API_URL}/applications/${appId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        // Revert on failure.
        await fetchApps();
      }
    } catch (err) {
      console.error("Status update failed:", err);
      await fetchApps();
    } finally {
      setPendingId(null);
    }
  };

  const handleRemove = async (appId: string) => {
    if (!confirm("Remove this job from your tracker?")) return;
    setPendingId(appId);
    const prev = apps;
    setApps((p) => p.filter((a) => a._id !== appId));
    try {
      const token = localStorage.getItem("jobplotter_token");
      const res = await fetch(`${API_URL}/applications/${appId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setApps(prev);
      }
    } catch (err) {
      console.error("Remove failed:", err);
      setApps(prev);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 py-8 font-sans text-slate-900">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          <ClipboardList className="w-5 h-5" />
        </div>
        <h1 className="text-2xl sm:text-[1.75rem] font-extrabold">Applications</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6 ml-13">
        Jobs you've saved or applied to. Update the status as you progress.
      </p>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {(["all", ...STATUS_ORDER] as const).map((key) => {
          const active = statusFilter === key;
          const label = key === "all" ? "All" : STATUS_LABEL[key];
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : visibleApps.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {apps.length === 0 ? "No tracked applications yet" : `No ${STATUS_LABEL[statusFilter as Status].toLowerCase()} applications`}
          </h3>
          <p className="text-xs text-slate-500">
            {apps.length === 0
              ? "Click \"Track Job\" on any job in the Jobs page to start tracking."
              : "Try a different filter, or track more jobs from the Jobs page."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleApps.map((app) => {
            const job = app.job;
            const isPending = pendingId === app._id;
            const isSaved = app.status === "saved";
            const updated = new Date(app.updatedAt).toLocaleDateString(undefined, {
              month: "short", day: "numeric",
            });
            return (
              <div
                key={app._id}
                onClick={isSaved && job ? () => setSelectedJob(job) : undefined}
                className={`flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all ${
                  isSaved && job ? "hover:shadow-md hover:border-indigo-200 cursor-pointer" : ""
                }`}
              >
                <CompanyLogo company={job?.company} logo={job?.logo} className="w-10 h-10" />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {job?.title || "Untitled role"}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 truncate">
                    {job?.company || "Unknown Company"} &bull; {job?.location || "Anywhere"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {updated}</span>
                  </div>
                </div>

                {/* Status dropdown */}
                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.status}
                    disabled={isPending}
                    onChange={(e) => handleStatusChange(app._id, e.target.value as Status)}
                    className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-bold border cursor-pointer outline-none transition-colors disabled:opacity-60 ${STATUS_CHIP[app.status]}`}
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(app._id); }}
                  disabled={isPending}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  title="Remove from tracker"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selectedJob && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="flex gap-4 items-center min-w-0">
                <CompanyLogo
                  company={selectedJob.company}
                  logo={selectedJob.logo}
                  className="w-12 h-12"
                />
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">{selectedJob.title}</h2>
                  <p className="text-xs font-semibold text-slate-500 truncate">
                    {selectedJob.company || "Unknown Company"} &bull; {selectedJob.location || "Anywhere"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
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
                    Salary: {getCurrencySymbol(selectedJob.salary_currency, selectedJob.location)}{Math.round(selectedJob.salary_min / 1000)}k - {selectedJob.salary_max ? `${Math.round(selectedJob.salary_max / 1000)}k` : "Open"}
                  </span>
                )}
              </div>

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

            {/* Footer with Apply CTA */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky bottom-0 z-20">
              <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Posted {selectedJob.postedAt ? new Date(selectedJob.postedAt).toLocaleDateString() : "Recently"}</span>
              </div>
              {selectedJob.url ? (
                <a
                  href={selectedJob.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  Apply on Company Site
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs font-semibold text-slate-400 italic">
                  Apply link not available
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
