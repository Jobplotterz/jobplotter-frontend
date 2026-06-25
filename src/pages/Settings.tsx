import { useState, useEffect } from "react";
import { FileText, Check, Loader2, Clock, Settings as SettingsIcon, User, Key } from "lucide-react";

export function Settings() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resume" | "profile">("resume");

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/resumes/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
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

  const [profileName, setProfileName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileName(data.name || "");
        setUserEmail(data.email || "");
      }
    } catch (e) {
      console.error("Failed to fetch user profile:", e);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/auth/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileName,
          current_password: currentPassword || undefined,
          new_password: newPassword || undefined
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setProfileSuccessMsg("Profile updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setProfileErrorMsg(data.detail || "Failed to update profile. Try again.");
      }
    } catch (e) {
      console.error("Failed to update profile:", e);
      setProfileErrorMsg("Failed to update profile. Try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchUserProfile();
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
      <p className="text-sm text-slate-500 mb-6 ml-13">Manage your resume defaults and profile information.</p>

      {/* Tabs Control */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 mb-8 max-w-sm border border-slate-200/50">
        <button
          onClick={() => setActiveTab("resume")}
          className={`flex-grow py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === "resume"
              ? "bg-white text-indigo-600 shadow-sm font-extrabold"
              : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          Resume
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-grow py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            activeTab === "profile"
              ? "bg-white text-indigo-600 shadow-sm font-extrabold"
              : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
          }`}
        >
          Profile
        </button>
      </div>

      {activeTab === "resume" && (
        <section className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm animate-in fade-in duration-300">
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
              const updatedTime = resume.updatedAt || resume._creationTime;
              const updated = updatedTime
                ? new Date(updatedTime).toLocaleDateString()
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
      )}

      {activeTab === "profile" && (
        <section className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm animate-in fade-in duration-300">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-sans">Profile Settings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your account details and login password.
            </p>
          </div>
        </div>

        {isProfileLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileSuccessMsg && (
              <div className="px-3.5 py-2.5 rounded-xl bg-green-50 border border-green-100 text-xs font-bold text-green-700 animate-in fade-in duration-300">
                {profileSuccessMsg}
              </div>
            )}
            {profileErrorMsg && (
              <div className="px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-700 animate-in fade-in duration-300">
                {profileErrorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="text"
                disabled
                value={userEmail}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                title="Your email address cannot be changed."
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none font-medium"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-3.5 h-3.5 text-slate-400 font-bold" />
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Change Password</h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">Leave both fields blank if you do not want to change your password.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none font-medium"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                {isSavingProfile ? "Saving changes..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}
      </section>
      )}
    </div>
  );
}
