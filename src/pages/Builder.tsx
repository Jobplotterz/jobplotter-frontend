import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, Download, ScanSearch } from "lucide-react";
import { ResumeData, initialResumeData } from "../types";
import { ResumeForm } from "../components/ResumeForm";
import { ResumePreview } from "../components/ResumePreview";
import { Navbar } from "../components/Navbar";

export function Builder() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-white font-sans text-slate-900 overflow-hidden">
      <Navbar />

      {/* Mobile toggle tabs */}
      <div className="lg:hidden flex items-center border-b border-slate-200 bg-white">
        <button
          onClick={() => setShowPreview(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold transition-colors ${!showPreview ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileText className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold transition-colors ${showPreview ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
      </div>

      {/* Main split layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Form */}
        <div className={`${showPreview ? 'hidden' : 'flex flex-col'} lg:flex lg:flex-col w-full lg:w-1/2 h-full border-r border-slate-200 bg-white overflow-hidden`}>
          <div className="flex-1 overflow-y-auto">
            <ResumeForm data={resumeData} onChange={setResumeData} />
          </div>
          <div className="shrink-0 px-5 sm:px-6 lg:px-8 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400 hidden sm:block">Changes auto-save to preview</p>
            <div className="flex items-center gap-2 ml-auto">
              <Link to="/review" className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <ScanSearch className="w-3.5 h-3.5" /> ATS Review
              </Link>
              <button className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Preview */}
        <div className={`${showPreview ? 'flex' : 'hidden'} lg:flex w-full lg:w-1/2 h-full bg-slate-50 overflow-y-auto p-4 sm:p-6 lg:p-8 justify-center`}>
          <ResumePreview data={resumeData} />
        </div>
      </div>
    </div>
  );
}
