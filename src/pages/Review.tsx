import { Navbar } from "../components/Navbar";
import { AlertCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useResumeData } from "../types";
import { ResumePreview } from "../components/ResumePreview";

export function Review() {
  const [resumeData] = useResumeData();

  return (
    <div className="h-screen flex flex-col bg-white font-sans text-slate-900 overflow-hidden">
      <Navbar />

      {/* Main Content - stacks on mobile */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/50">
        {/* Left Pane: Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center order-2 lg:order-1">
          <ResumePreview data={resumeData} />
        </div>

        {/* Right Pane: Review Panel */}
        <div className="w-full lg:w-[420px] xl:w-[460px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 overflow-y-auto shrink-0 order-1 lg:order-2 max-h-[50vh] lg:max-h-none">
          <div className="p-4 sm:p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Resume Review</h2>

            {/* Overall Score Card */}
            <div className="border border-slate-200 rounded-xl p-4 sm:p-5 mb-5">
              <div className="flex items-center gap-4 sm:gap-5 mb-6">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-red-500" strokeWidth="4" strokeDasharray="15, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-xl font-bold text-slate-900">15</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Overall Score</h3>
                  <p className="text-xs text-slate-500">Based on ATS compatibility, content, structure, and more.</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Tone & Style", score: 25 },
                  { label: "Content", score: 10 },
                  { label: "Structure", score: 30 },
                  { label: "Skills", score: 5 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded">Needs Work</span>
                    </div>
                    <span className="text-[13px] font-bold text-slate-900">{item.score}<span className="text-slate-400 font-medium">/100</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Score Section */}
            <div className="bg-red-50/30 border border-red-100 rounded-xl p-4 sm:p-5 mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-bold text-slate-900">ATS Score</h3>
                <span className="px-1.5 py-0.5 text-[11px] font-bold bg-red-100 text-red-700 rounded-full">20/100</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Needs Improvement</p>

              <div className="space-y-1.5">
                {[
                  "Add relevant technical keywords like JavaScript, React, HTML, CSS, Git, and other frontend technologies",
                  "Include programming languages and frameworks in a dedicated technical skills section",
                  "Use standard section headers like 'Technical Skills', 'Projects', 'Professional Experience'",
                  "Format dates consistently and use standard date formats (MM/YYYY)"
                ].map((text, i) => (
                  <div key={i} className="flex gap-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Accordion */}
            <Accordion type="multiple" defaultValue={["content"]} className="w-full space-y-3">
              <AccordionItem value="tone" className="border border-slate-200 rounded-xl px-3 bg-white">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Tone & Style</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded">Needs Work</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <p className="text-xs text-slate-500">Suggestions for tone and style will appear here.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="content" className="border border-slate-200 rounded-xl px-3 bg-white">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Content</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded">Needs Work</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 space-y-2">
                  {[
                    { title: "Completely irrelevant work experience", desc: "All listed experience is in healthcare/caregiving with no connection to software development. Either add relevant technical projects, internships, or reframe existing experience to highlight transferable skills like problem-solving and attention to detail." },
                    { title: "Missing technical projects", desc: "Frontend engineer roles require demonstrable coding experience. Add a projects section showcasing web applications, GitHub repositories, or coding bootcamp projects with specific technologies used." },
                    { title: "Outdated and irrelevant education", desc: "A 1998 BA from Nigeria with no field specified doesn't support a frontend engineering application. Add relevant certifications, coding bootcamps, online courses, or self-taught programming education." },
                    { title: "No quantifiable achievements", desc: "Include metrics and specific accomplishments like 'Built responsive web application serving 1000+ users' or 'Improved page load time by 40%' to demonstrate impact." },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-2 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 mb-0.5">{item.title}</h4>
                        <p className="text-xs text-amber-800 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="structure" className="border border-slate-200 rounded-xl px-3 bg-white">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Structure</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded">Needs Work</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <p className="text-xs text-slate-500">Suggestions for structure will appear here.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="skills" className="border border-slate-200 rounded-xl px-3 bg-white">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Skills</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-600 rounded">Needs Work</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <p className="text-xs text-slate-500">Suggestions for skills will appear here.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
