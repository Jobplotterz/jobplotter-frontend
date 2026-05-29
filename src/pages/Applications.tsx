import { useState, useEffect, useMemo } from "react";
import {
  Briefcase, Building2, Clock, Loader2, Trash2, ChevronDown,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

export function Applications() {
  const { logout } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const res = await fetch(`${API_URL}/applications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
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
            const updated = new Date(app.updatedAt).toLocaleDateString(undefined, {
              month: "short", day: "numeric",
            });
            return (
              <div
                key={app._id}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                  {job?.logo ? (
                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-5 h-5 text-slate-400" />
                  )}
                </div>

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
                <div className="relative shrink-0">
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
                  onClick={() => handleRemove(app._id)}
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
    </div>
  );
}
