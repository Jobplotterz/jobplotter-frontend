import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ResumeData } from "../types";
import { renderResumePdfPreviewBlob } from "./resumeTemplates";
import { RESUME_TEMPLATES, TemplateId, storeTemplate } from "./resumeTemplateMeta";

interface Props {
  data: ResumeData;
  templateId: TemplateId;
  onTemplateChange: (id: TemplateId) => void;
  showPicker?: boolean;
}

// WYSIWYG preview: renders the exact selected react-pdf template to a blob and
// shows it in an iframe, so the on-screen preview matches the download 1:1.
// Regeneration is debounced so typing doesn't rebuild the PDF on every keystroke.
export function ResumePdfPreview({ data, templateId, onTemplateChange, showPicker = true }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const genIdRef = useRef(0);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    const id = ++genIdRef.current;
    setLoading(true);
    setError(false);
    const timer = setTimeout(async () => {
      try {
        const blob = await renderResumePdfPreviewBlob(data, templateId);
        if (genIdRef.current !== id) return; // a newer render superseded this one
        const objectUrl = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = objectUrl;
        setUrl(objectUrl);
      } catch (e) {
        console.error("Resume preview render failed:", e);
        if (genIdRef.current === id) setError(true);
      } finally {
        if (genIdRef.current === id) setLoading(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [data, templateId]);

  // Revoke the last object URL on unmount.
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  const selectTemplate = (id: TemplateId) => {
    if (id === templateId) return;
    storeTemplate(id);
    onTemplateChange(id);
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-0">
      {showPicker && (
        <div className="shrink-0 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Template</span>
            {RESUME_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t.id)}
                title={t.description}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  templateId === t.id
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">Templates apply to the PDF download only — DOCX always uses one clean, ATS-friendly layout.</p>
        </div>
      )}

      <div className="relative flex-1 min-h-[400px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
        {url && (
          <iframe
            src={`${url}#toolbar=0&navpanes=0&view=FitH`}
            title="Resume preview"
            className="w-full h-full border-0 bg-white"
          />
        )}
        {(loading || !url) && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white shadow-md border border-slate-200">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-600">Generating preview…</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <span className="text-xs font-semibold text-rose-500">
              Couldn't render the preview. Your data is safe — try editing a field or switching templates.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumePdfPreview;
