import { useState } from "react";
import { X, Loader2, Sparkles, ArrowLeft, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ResumeData } from "../types";

interface AiCoBuilderModalProps {
  onClose: () => void;
  onApply: (data: ResumeData) => void;
}

type Phase = "describe" | "loading-questions" | "questions" | "generating" | "preview";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Mirrors the 429/503/500 friendly-error mapping used in ResumeForm.tsx / Review.tsx.
async function messageForAiFailure(response: Response | null, fallback: string): Promise<string> {
  if (!response) return "We couldn't reach the AI. Check your connection and try again.";
  if (response.status === 503) return "The AI is briefly overloaded. Try again in a few seconds.";
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
        return "The AI hit a temporary hiccup. Try again in a moment.";
      }
    } catch {
      // ignore
    }
    return "Something went wrong on the AI side. Give it another try.";
  }
  return fallback;
}

function authHeaders() {
  const token = localStorage.getItem("jobplotter_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// The AI doesn't always honor the schema: a bullet-point `description` can come
// back as an array, `summary` as an array, a skill as an object, a date as a
// number. The builder/preview then call `.trim()`/`.split()` on those values and
// crash the whole page ("k.description.trim is not a function"). Coerce every
// field the UI treats as a string into an actual string before it's applied.
function str(v: any): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(str).filter(Boolean).join("\n");
  if (typeof v === "object") return str(v.text ?? v.description ?? v.value ?? v.name ?? "");
  return String(v);
}

// The AI may emit placeholder ids (e.g. "unique_id_1") that could collide as
// React keys once merged with the rest of the app's id scheme, so re-stamp them.
function normalizeResumeData(raw: any): ResumeData {
  const pi = raw.personalInfo || {};
  return {
    personalInfo: {
      fullName: str(pi.fullName),
      jobTitle: str(pi.jobTitle),
      email: str(pi.email),
      phone: str(pi.phone),
      location: str(pi.location),
      website: str(pi.website),
      summary: str(pi.summary),
    },
    experience: (Array.isArray(raw.experience) ? raw.experience : []).map((exp: any, i: number) => ({
      id: `${Date.now()}-exp-${i}`,
      company: str(exp?.company),
      position: str(exp?.position),
      startDate: str(exp?.startDate),
      endDate: str(exp?.endDate),
      description: str(exp?.description),
    })),
    education: (Array.isArray(raw.education) ? raw.education : []).map((edu: any, i: number) => ({
      id: `${Date.now()}-edu-${i}`,
      institution: str(edu?.institution),
      degree: str(edu?.degree),
      startDate: str(edu?.startDate),
      endDate: str(edu?.endDate),
    })),
    certifications: (Array.isArray(raw.certifications) ? raw.certifications : []).map((cert: any, i: number) => ({
      id: `${Date.now()}-cert-${i}`,
      name: str(cert?.name),
      issuer: str(cert?.issuer),
      date: str(cert?.date),
    })),
    skills: (Array.isArray(raw.skills) ? raw.skills : []).map(str).filter(Boolean),
  };
}

export function AiCoBuilderModal({ onClose, onApply }: AiCoBuilderModalProps) {
  const [phase, setPhase] = useState<Phase>("describe");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [generatedData, setGeneratedData] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!description.trim()) return;
    setError(null);
    setPhase("loading-questions");
    let response: Response | null = null;
    try {
      response = await fetch(`${API_URL}/resumes/ai-cobuilder/questions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ description })
      });
      if (!response.ok) throw new Error("Failed to get questions");
      const result = await response.json();
      const qs: string[] = result.questions || [];
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(""));
      setPhase("questions");
    } catch {
      setError(await messageForAiFailure(response, "We couldn't start the AI builder. Try again."));
      setPhase("describe");
    }
  };

  const generateResume = async () => {
    setError(null);
    setPhase("generating");
    let response: Response | null = null;
    try {
      const qa = questions.map((question, i) => ({ question, answer: answers[i] || "" }));
      response = await fetch(`${API_URL}/resumes/ai-cobuilder/generate`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ description, qa })
      });
      if (!response.ok) throw new Error("Failed to generate resume");
      const result = await response.json();
      setGeneratedData(normalizeResumeData(result.resumeData || {}));
      setPhase("preview");
    } catch {
      setError(await messageForAiFailure(response, "We couldn't generate your resume. Try again."));
      setPhase("questions");
    }
  };

  const handleApply = () => {
    if (!generatedData) return;
    onApply(generatedData);
    onClose();
  };

  const startOver = () => {
    setDescription("");
    setQuestions([]);
    setAnswers([]);
    setGeneratedData(null);
    setError(null);
    setPhase("describe");
  };

  const isLoading = phase === "loading-questions" || phase === "generating";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Build with AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {phase === "describe" && (
            <div className="space-y-5">
              <div>
                <p className="font-bold text-slate-900">Describe the resume you want</p>
                <p className="text-sm text-slate-500 mt-1">Tell us about your target role, background, and experience. The AI will ask a few follow-up questions, then draft your resume.</p>
              </div>
              <Textarea
                autoFocus
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. I want a resume for a mid-level frontend developer role. I've spent 3 years at a startup building React apps, and before that I worked in customer support..."
                className="h-36 text-[13px] border-slate-200 focus-visible:ring-indigo-500 resize-none"
              />
              <button
                onClick={fetchQuestions}
                disabled={!description.trim()}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                {phase === "loading-questions" ? "Thinking about what to ask..." : "Drafting your resume..."}
              </p>
            </div>
          )}

          {phase === "questions" && (
            <div className="space-y-5">
              <button onClick={() => setPhase("describe")} className="flex items-center gap-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              {questions.map((q, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-800">{q}</label>
                  <Textarea
                    value={answers[i] || ""}
                    onChange={e => setAnswers(prev => prev.map((a, idx) => idx === i ? e.target.value : a))}
                    className="h-16 text-[13px] border-slate-200 focus-visible:ring-indigo-500 resize-none"
                  />
                </div>
              ))}
              <button
                onClick={generateResume}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 cursor-pointer"
              >
                Generate Resume
              </button>
            </div>
          )}

          {phase === "preview" && generatedData && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="font-bold text-slate-900">{generatedData.personalInfo.fullName || "Your Resume"}</p>
                <p className="text-sm text-slate-600">{generatedData.personalInfo.jobTitle}</p>
                {generatedData.personalInfo.summary && (
                  <p className="text-[13px] text-slate-500">{generatedData.personalInfo.summary}</p>
                )}
                <div className="flex items-center gap-4 text-[12px] text-slate-500 font-medium pt-1">
                  <span>{generatedData.experience.length} experience {generatedData.experience.length === 1 ? "entry" : "entries"}</span>
                  <span>{generatedData.education.length} education {generatedData.education.length === 1 ? "entry" : "entries"}</span>
                </div>
                {generatedData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {generatedData.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-white text-slate-600 text-[11px] font-semibold rounded-full border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[12px] text-slate-400">Applying will replace your current resume draft in the builder.</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={startOver}
                  className="flex-1 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Start Over
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 cursor-pointer"
                >
                  Apply to Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
