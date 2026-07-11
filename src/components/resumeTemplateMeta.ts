// Lightweight template metadata + persistence — deliberately free of any
// @react-pdf/renderer imports so pages can read the selected template (and
// render the picker) without pulling the heavy PDF renderer into the initial
// bundle. The actual template components + PDF generation live in the
// (lazily-loaded) resumeTemplates.tsx.

export type TemplateId = "modern" | "classic" | "minimal" | "sidebar";

export const RESUME_TEMPLATES: { id: TemplateId; label: string; description: string }[] = [
  { id: "modern", label: "Modern", description: "Dark header, skill pills" },
  { id: "classic", label: "Classic", description: "Serif, centered, ATS-safe" },
  { id: "minimal", label: "Minimal", description: "Airy, single accent color" },
  { id: "sidebar", label: "Two-Column", description: "Dark sidebar for contact + skills" },
];

export const DEFAULT_TEMPLATE: TemplateId = "modern";
const TEMPLATE_STORAGE_KEY = "jobplotter_resume_template";

export function getStoredTemplate(): TemplateId {
  try {
    const v = localStorage.getItem(TEMPLATE_STORAGE_KEY) as TemplateId | null;
    if (v && RESUME_TEMPLATES.some((t) => t.id === v)) return v;
  } catch {
    /* ignore */
  }
  return DEFAULT_TEMPLATE;
}

export function storeTemplate(id: TemplateId) {
  try {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
