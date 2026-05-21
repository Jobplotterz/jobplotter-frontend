import { useState, useEffect } from "react";
import { FileText, Check, Loader2, Clock, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Settings() {
  const { logout } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (e) {
      console.error("Failed to fetch resumes:", e);
      setError("Couldn't load your resumes. Try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSetDefault = async (resumeId: string) => {
    if (savingId) return;
    setSavingId(resumeId);
    setError(null);
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/set-default`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId })
      });
      if (response.ok) {
        // Optimistically update local state so the UI reflects the change instantly.
        setResumes(prev => prev.map(r => ({ ...r, isDefault: r._id === resumeId })));
      } else {
        setError("Couldn't update your default resume. Try again.");
      }
    } catch (e) {
      console.error("Failed to set default resume:", e);
      setError("Couldn't update your default resume. Try again.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-5 sm:px-8 py-8 font-sans text-slate-900">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <h1 className="text-2xl sm:text-[1.75rem] font-extrabold">Settings</h1>
      </div>
      <p className="text-sm text-slate-500 mb-8 ml-13">Manage how JobPlotter uses your resumes.</p>

      <section className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900">Default Resume</h2>
          <p className="text-xs text-slate-500 mt-1">
            The default resume is what we match jobs against on the Jobs page and open by default in the Builder. You can have many resumes saved &mdash; only one is the default at a time.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No resumes yet</p>
            <p className="text-xs text-slate-500 mt-1">Upload or build one to set it as your default.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {resumes.map((resume) => {
              const rid = resume._id || resume.id;
              const isDefault = !!resume.isDefault;
              const isSaving = savingId === rid;
              const updated = resume._creationTime
                ? new Date(resume._creationTime).toLocaleDateString()
                : null;

              return (
                <div
                  key={rid}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-colors ${
                    isDefault
                      ? "border-indigo-200 bg-indigo-50/40"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDefault ? "bg-indigo-100 text-indigo-600" : "bg-slate-50 text-slate-500"}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{resume.title || "Untitled Resume"}</p>
                      {isDefault && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-wider">
                          <Check className="w-2.5 h-2.5" />
                          Default
                        </span>
                      )}
                    </div>
                    {updated && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Updated {updated}</span>
                      </div>
                    )}
                  </div>
                  {isDefault ? (
                    <span className="shrink-0 text-[11px] font-semibold text-slate-400">Active</span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(rid)}
                      disabled={!!savingId}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      {isSaving ? "Saving..." : "Set as default"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
