import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function BackToHome() {
  return (
    <Link
      to="/"
      className="absolute top-5 left-5 sm:top-6 sm:left-8 inline-flex items-center gap-2 font-departure text-[13px] text-slate-500 hover:text-indigo-600 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to home
    </Link>
  );
}
