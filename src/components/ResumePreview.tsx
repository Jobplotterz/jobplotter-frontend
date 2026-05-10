import { ResumeData } from "../types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const { personalInfo, experience, education, skills } = data;

  return (
    <div className="w-full flex-1 min-h-full flex flex-col items-center py-10">
      <div id="resume-content" className="w-full max-w-[816px] bg-white shadow-2xl min-h-[1056px] flex-1 flex flex-col font-sans text-slate-900 border border-slate-200 mx-auto">
        {/* Header */}
        <header className="bg-slate-900 text-white px-8 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{personalInfo.fullName || "Your Name"}</h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium mb-4 sm:mb-5">{personalInfo.jobTitle || "Job Title"}</p>

          <div className="flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2 text-[11px] sm:text-[13px] text-slate-400">
            {personalInfo.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {personalInfo.location}
              </span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> {personalInfo.website}
              </span>
            )}
          </div>
        </header>

          <div className="px-8 sm:px-10 py-6 sm:py-8 flex-1 flex flex-col">
            {/* Summary */}
            {personalInfo.summary && (
              <section className="mb-6">
                <p className="text-[12px] sm:text-[14px] text-slate-600 leading-relaxed">
                  {personalInfo.summary}
                </p>
              </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-indigo-600 border-b border-slate-200 pb-2 mb-4">Experience</h2>
                <div className="space-y-6">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-1 gap-1 sm:gap-4">
                        <h3 className="font-bold text-[13px] sm:text-[15px] text-slate-900">{exp.position || "Position"}</h3>
                        <span className="text-[10px] sm:text-[12px] font-semibold text-slate-500 whitespace-nowrap">
                          {exp.startDate} {exp.startDate && exp.endDate && "—"} {exp.endDate}
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-[14px] text-slate-500 font-medium mb-2">{exp.company || "Company"}</p>
                      {exp.description && (
                        <div className="text-[12px] sm:text-[14px] text-slate-600 leading-relaxed">
                          {(() => {
                            const points = Array.isArray(exp.description) 
                              ? exp.description 
                              : exp.description.split(/(?:\. |; |\.[\n\r]|;[\n\r]|\.$|;$)/g).map(p => p.trim()).filter(p => p.length > 0);
                            
                            if (points.length > 1) {
                              return (
                                <ul className="list-disc list-outside ml-4 space-y-1.5">
                                  {points.map((point, i) => <li key={i}>{point}</li>)}
                                </ul>
                              );
                            }
                            return <p className="whitespace-pre-wrap">{exp.description}</p>;
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-indigo-600 border-b border-slate-200 pb-2 mb-4">Education</h2>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline mb-1 gap-1 sm:gap-4">
                        <h3 className="font-bold text-[13px] sm:text-[15px] text-slate-900">{edu.institution || "Institution"}</h3>
                        <span className="text-[10px] sm:text-[12px] font-semibold text-slate-500 whitespace-nowrap">
                          {edu.startDate} {edu.startDate && edu.endDate && "—"} {edu.endDate}
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-[14px] text-slate-500">{edu.degree || "Degree"}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <section className="mb-6">
                <h2 className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-indigo-600 border-b border-slate-200 pb-2 mb-4">Certifications</h2>
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className="font-bold text-[13px] sm:text-[14px] text-slate-900">{cert.name}</h3>
                        <span className="text-[10px] sm:text-[12px] font-semibold text-slate-500 whitespace-nowrap ml-4">{cert.date}</span>
                      </div>
                      <p className="text-[11px] sm:text-[13px] text-slate-500">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                <h2 className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-indigo-600 border-b border-slate-200 pb-2 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, index) => (
                    <span key={index} className="bg-slate-50 px-2.5 py-1 rounded-lg text-[11px] sm:text-[13px] text-slate-700 border border-slate-200 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
      </div>
    </div>
  );
}
