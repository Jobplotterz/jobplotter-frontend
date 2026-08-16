import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export function PageHero({
  badge,
  title,
  subtitle
}: {
  badge: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="bg-slate-50 border-b border-slate-100 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs mb-6 tracking-wide uppercase">
          {badge}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
