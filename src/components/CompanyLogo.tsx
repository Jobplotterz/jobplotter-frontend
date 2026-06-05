import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

/**
 * Cascade:
 *   1. `logo` URL — only if it actually loads.
 *   2. First letter of the company name in a coloured tile.
 *   3. Building icon (only if there's no company name either).
 *
 * Earlier versions tried Clearbit as a middle step. That was removed
 * because (a) Clearbit 404s introduce a visible broken-image flash while
 * the fetch is in flight, and (b) it sometimes returns 200 OK with an
 * empty placeholder image, which never triggers onError. Going straight
 * from logo → letter avoids both failure modes.
 */
export function CompanyLogo({
  company,
  logo,
  className = "w-10 h-10",
  rounded = "rounded-xl",
}: {
  company?: string | null;
  logo?: string | null;
  className?: string;
  rounded?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  // Reset failure state when the prop changes — important when this
  // component is reused across rows in a list and one row's broken image
  // shouldn't suppress the next row's working image.
  useEffect(() => {
    setImgFailed(false);
  }, [logo]);

  const initial = company?.trim().charAt(0).toUpperCase() || "";
  const showLogo = !!logo && !imgFailed;
  const showInitial = !showLogo && !!initial;

  if (showLogo) {
    return (
      <div
        className={`${className} ${rounded} bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden`}
      >
        <img
          src={logo!}
          alt={company || "Logo"}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  if (showInitial) {
    return (
      <div
        className={`${className} ${rounded} bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 font-bold`}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={`${className} ${rounded} bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0`}
    >
      <Building2 className="w-1/2 h-1/2 text-slate-400" />
    </div>
  );
}
