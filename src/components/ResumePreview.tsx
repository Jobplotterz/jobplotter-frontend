import { ResumeData } from "../types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="w-full max-w-[800px] bg-white shadow-sm min-h-[1056px] flex flex-col font-sans text-slate-900 border border-slate-200">

      {/* Header */}
      <header className="bg-slate-900 text-white px-10 pt-10 pb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">{personalInfo.fullName || "Your Name"}</h1>
        <p className="text-base text-slate-300 font-medium mb-5">{personalInfo.jobTitle || "Job Title"}</p>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-slate-400">
          {personalInfo.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> {personalInfo.website}
            </span>
          )}
        </div>
      </header>

      <div className="px-10 py-8 flex-1 flex flex-col">
        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-7">
            <p className="text-[13px] text-slate-600 leading-relaxed">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-7">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600 border-b border-slate-200 pb-2 mb-4">Experience</h2>
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-0.5 gap-4">
                    <h3 className="font-bold text-sm text-slate-900">{exp.position || "Position"}</h3>
                    <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                      {exp.startDate} {exp.startDate && exp.endDate && "—"} {exp.endDate}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium mb-1.5">{exp.company || "Company"}</p>
                  {exp.description && (
                    <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-7">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600 border-b border-slate-200 pb-2 mb-4">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-0.5 gap-4">
                    <h3 className="font-bold text-sm text-slate-900">{edu.institution || "Institution"}</h3>
                    <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                      {edu.startDate} {edu.startDate && edu.endDate && "—"} {edu.endDate}
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500">{edu.degree || "Degree"}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600 border-b border-slate-200 pb-2 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <span key={index} className="bg-slate-50 px-2.5 py-1 rounded-md text-[13px] text-slate-700 border border-slate-200 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
