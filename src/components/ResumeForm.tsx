import { useState, useEffect } from "react";
import { ResumeData } from "../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, User, Briefcase, GraduationCap, Wrench, Award, Sparkles, Loader2 } from "lucide-react";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

function AiRewriteButton({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title="Improve with AI"
      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
      {loading ? "Improving..." : "Improve"}
    </button>
  );
}

export function ResumeForm({ data, onChange }: ResumeFormProps) {
  const [skillsInput, setSkillsInput] = useState(data.skills.join(", "));
  const [aiError, setAiError] = useState<string | null>(null);
  const [improvingSummary, setImprovingSummary] = useState(false);
  const [summaryUndo, setSummaryUndo] = useState<string | null>(null);
  const [improvingExpId, setImprovingExpId] = useState<string | null>(null);
  const [expUndo, setExpUndo] = useState<Record<string, string>>({});

  // Sync internal skills input when data.skills changes externally
  useEffect(() => {
    const currentListString = data.skills.join(", ");
    const normalizedInput = skillsInput.split(",").map(s => s.trim()).filter(Boolean).join(", ");
    if (currentListString !== normalizedInput) {
      setSkillsInput(currentListString);
    }
  }, [data.skills]);

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const updateExperience = (id: string, field: keyof ResumeData['experience'][0], value: string) => {
    onChange({
      ...data,
      experience: data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        { id: Date.now().toString(), company: "", position: "", startDate: "", endDate: "", description: "" }
      ]
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter(exp => exp.id !== id)
    });
  };

  const updateEducation = (id: string, field: keyof ResumeData['education'][0], value: string) => {
    onChange({
      ...data,
      education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...data.education,
        { id: Date.now().toString(), institution: "", degree: "", startDate: "", endDate: "" }
      ]
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter(edu => edu.id !== id)
    });
  };

  const updateCertification = (id: string, field: keyof ResumeData['certifications'][0], value: string) => {
    onChange({
      ...data,
      certifications: data.certifications.map(cert => cert.id === id ? { ...cert, [field]: value } : cert)
    });
  };

  const addCertification = () => {
    onChange({
      ...data,
      certifications: [
        ...data.certifications,
        { id: Date.now().toString(), name: "", issuer: "", date: "" }
      ]
    });
  };

  const removeCertification = (id: string) => {
    onChange({
      ...data,
      certifications: data.certifications.filter(cert => cert.id !== id)
    });
  };

  const updateSkills = (value: string) => {
    setSkillsInput(value);
    onChange({
      ...data,
      skills: value.split(",").map(s => s.trim()).filter(Boolean)
    });
  };

  // Maps a failed /improve-field response to a human-friendly message,
  // mirroring the 429/503/500 handling used for the whole-resume AI actions in Review.tsx.
  const messageForImproveFailure = async (response: Response | null, fallback: string) => {
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
  };

  const improveText = async (fieldType: "summary" | "experience", text: string, context: Record<string, string>): Promise<string | null> => {
    setAiError(null);
    let response: Response | null = null;
    try {
      const token = localStorage.getItem("jobplotter_token");
      response = await fetch(`${API_URL}/resumes/improve-field`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fieldType, text, context })
      });
      if (response.ok) {
        const result = await response.json();
        return result.improvedText as string;
      }
      throw new Error("Failed to improve text");
    } catch {
      setAiError(await messageForImproveFailure(response, "We couldn't improve this text. Try again."));
      return null;
    }
  };

  const handleImproveSummary = async () => {
    const text = data.personalInfo.summary;
    if (!text.trim() || improvingSummary) return;
    setImprovingSummary(true);
    const improved = await improveText("summary", text, { jobTitle: data.personalInfo.jobTitle });
    setImprovingSummary(false);
    if (improved) {
      setSummaryUndo(text);
      updatePersonalInfo("summary", improved);
    }
  };

  const undoSummary = () => {
    if (summaryUndo !== null) {
      updatePersonalInfo("summary", summaryUndo);
      setSummaryUndo(null);
    }
  };

  const handleImproveExperience = async (exp: ResumeData['experience'][0]) => {
    const text = exp.description;
    if (!text.trim() || improvingExpId) return;
    setImprovingExpId(exp.id);
    const improved = await improveText("experience", text, { position: exp.position, company: exp.company });
    setImprovingExpId(null);
    if (improved) {
      setExpUndo(prev => ({ ...prev, [exp.id]: text }));
      updateExperience(exp.id, "description", improved);
    }
  };

  const undoExperience = (id: string) => {
    const prevText = expUndo[id];
    if (prevText !== undefined) {
      updateExperience(id, "description", prevText);
      setExpUndo(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  return (
    <div className="p-5 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-0.5">Resume Builder</h1>
        <p className="text-[13px] text-slate-500">Fill in your details to generate your resume.</p>
      </div>

      {aiError && (
        <div className="flex items-start justify-between gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-[12px] text-red-600">
          <span>{aiError}</span>
          <button type="button" onClick={() => setAiError(null)} className="text-red-400 hover:text-red-600 cursor-pointer shrink-0">✕</button>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["personal", "experience", "education", "skills"]} className="w-full space-y-3">

        {/* Personal Info */}
        <AccordionItem value="personal" className="border border-slate-200 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-3.5 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Personal Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Full Name</Label>
                <Input id="fullName" value={data.personalInfo.fullName} onChange={e => updatePersonalInfo("fullName", e.target.value)} placeholder="Jane Doe" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="jobTitle" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Job Title</Label>
                <Input id="jobTitle" value={data.personalInfo.jobTitle} onChange={e => updatePersonalInfo("jobTitle", e.target.value)} placeholder="Software Engineer" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</Label>
                <Input id="email" type="email" value={data.personalInfo.email} onChange={e => updatePersonalInfo("email", e.target.value)} placeholder="jane@example.com" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phone</Label>
                <Input id="phone" value={data.personalInfo.phone} onChange={e => updatePersonalInfo("phone", e.target.value)} placeholder="(555) 123-4567" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Location</Label>
                <Input id="location" value={data.personalInfo.location} onChange={e => updatePersonalInfo("location", e.target.value)} placeholder="San Francisco, CA" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Website / LinkedIn</Label>
                <Input id="website" value={data.personalInfo.website} onChange={e => updatePersonalInfo("website", e.target.value)} placeholder="linkedin.com/in/janedoe" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Professional Summary</Label>
                <div className="flex items-center gap-2">
                  {summaryUndo !== null && (
                    <button type="button" onClick={undoSummary} className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">Undo</button>
                  )}
                  <AiRewriteButton onClick={handleImproveSummary} loading={improvingSummary} disabled={!data.personalInfo.summary.trim()} />
                </div>
              </div>
              <Textarea id="summary" value={data.personalInfo.summary} onChange={e => { updatePersonalInfo("summary", e.target.value); setSummaryUndo(null); }} placeholder="Brief overview of your career and skills..." className="h-20 text-[13px] border-slate-200 focus-visible:ring-indigo-500 resize-none" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Experience */}
        <AccordionItem value="experience" className="border border-slate-200 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-3.5 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Experience</span>
              {data.experience.length > 0 && (
                <span className="ml-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{data.experience.length}</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="p-3.5 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Position {index + 1}</span>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 h-6 w-6" onClick={() => removeExperience(exp.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Company</Label>
                    <Input value={exp.company} onChange={e => updateExperience(exp.id, "company", e.target.value)} placeholder="Company Name" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Position</Label>
                    <Input value={exp.position} onChange={e => updateExperience(exp.id, "position", e.target.value)} placeholder="Job Title" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start Date</Label>
                    <Input value={exp.startDate} onChange={e => updateExperience(exp.id, "startDate", e.target.value)} placeholder="Jan 2020" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">End Date</Label>
                    <Input value={exp.endDate} onChange={e => updateExperience(exp.id, "endDate", e.target.value)} placeholder="Present" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</Label>
                    <div className="flex items-center gap-2">
                      {expUndo[exp.id] !== undefined && (
                        <button type="button" onClick={() => undoExperience(exp.id)} className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">Undo</button>
                      )}
                      <AiRewriteButton onClick={() => handleImproveExperience(exp)} loading={improvingExpId === exp.id} disabled={!exp.description.trim()} />
                    </div>
                  </div>
                  <Textarea value={exp.description} onChange={e => { updateExperience(exp.id, "description", e.target.value); setExpUndo(prev => { if (!(exp.id in prev)) return prev; const next = { ...prev }; delete next[exp.id]; return next; }); }} placeholder="Describe your responsibilities and achievements..." className="h-20 text-[13px] border-slate-200 focus-visible:ring-indigo-500 resize-none" />
                </div>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-lg text-[13px] font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </AccordionContent>
        </AccordionItem>

        {/* Education */}
        <AccordionItem value="education" className="border border-slate-200 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-3.5 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center">
                < GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Education</span>
              {data.education.length > 0 && (
                <span className="ml-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{data.education.length}</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            {data.education.map((edu, index) => (
              <div key={edu.id} className="p-3.5 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Education {index + 1}</span>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 h-6 w-6" onClick={() => removeEducation(edu.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Institution</Label>
                    <Input value={edu.institution} onChange={e => updateEducation(edu.id, "institution", e.target.value)} placeholder="University Name" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Degree</Label>
                    <Input value={edu.degree} onChange={e => updateEducation(edu.id, "degree", e.target.value)} placeholder="B.S. Computer Science" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start Date</Label>
                    <Input value={edu.startDate} onChange={e => updateEducation(edu.id, "startDate", e.target.value)} placeholder="Aug 2014" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">End Date</Label>
                    <Input value={edu.endDate} onChange={e => updateEducation(edu.id, "endDate", e.target.value)} placeholder="May 2018" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-lg text-[13px] font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </AccordionContent>
        </AccordionItem>

        {/* Certifications */}
        <AccordionItem value="certifications" className="border border-slate-200 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-3.5 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Certifications</span>
              {data.certifications && data.certifications.length > 0 && (
                <span className="ml-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{data.certifications.length}</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            {data.certifications?.map((cert, index) => (
              <div key={cert.id} className="p-3.5 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Certification {index + 1}</span>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 h-6 w-6" onClick={() => removeCertification(cert.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Certification Name</Label>
                    <Input value={cert.name} onChange={e => updateCertification(cert.id, "name", e.target.value)} placeholder="AWS Certified Solutions Architect" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Issuer</Label>
                    <Input value={cert.issuer} onChange={e => updateCertification(cert.id, "issuer", e.target.value)} placeholder="Amazon Web Services" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</Label>
                    <Input value={cert.date} onChange={e => updateCertification(cert.id, "date", e.target.value)} placeholder="2023" className="h-9 text-[13px] border-slate-200 focus-visible:ring-indigo-500" />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addCertification}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-lg text-[13px] font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
          </AccordionContent>
        </AccordionItem>

        {/* Skills */}
        <AccordionItem value="skills" className="border border-slate-200 rounded-xl px-4 bg-white">
          <AccordionTrigger className="py-3.5 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Skills</span>
              {data.skills.length > 0 && (
                <span className="ml-1 text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{data.skills.length}</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Skills (comma separated)</Label>
              <Textarea
                value={skillsInput}
                onChange={e => updateSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, Figma..."
                className="h-20 text-[13px] border-slate-200 focus-visible:ring-indigo-500 resize-none"
              />
            </div>
            {data.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {data.skills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] font-semibold rounded-full border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
