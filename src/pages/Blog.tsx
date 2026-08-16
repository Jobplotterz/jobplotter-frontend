import { Link } from "react-router-dom";
import { PenLine, Linkedin, Twitter, Instagram, Facebook, ArrowRight } from "lucide-react";
import { MarketingShell, PageHero } from "../components/MarketingShell";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jobplotterapp/", icon: <Linkedin className="w-4 h-4" /> },
  { label: "Twitter / X", href: "https://x.com/jobplotterapp", icon: <Twitter className="w-4 h-4" /> },
  { label: "Instagram", href: "https://www.instagram.com/jobplotter/", icon: <Instagram className="w-4 h-4" /> },
  { label: "Facebook", href: "https://www.facebook.com/jobplotterapp", icon: <Facebook className="w-4 h-4" /> }
];

const upcomingTopics = [
  "How ATS systems actually parse your resume — from the engineers who reverse-engineered them",
  "Salary negotiation scripts that worked, word for word",
  "What match scores reveal about your job search strategy",
  "Beyond keywords: how AI match scoring reads your real experience"
];

export default function Blog() {
  return (
    <MarketingShell>
      <PageHero
        badge="Blog"
        title={
          <>
            The Jobplotter <span className="text-indigo-600">blog is coming soon.</span>
          </>
        }
        subtitle="Deep dives on job search strategy, resume science, and the data behind the modern hiring market."
      />

      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-5 sm:px-8">
        <div className="p-8 sm:p-12 rounded-3xl border border-slate-100 bg-slate-50 text-center mb-12">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <PenLine className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-3">We're writing the first posts now</h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Follow us on social to catch the launch — in the meantime, our Career Resources hub already covers
            interviews, salary, and ATS strategy.
          </p>
          <div className="flex items-center justify-center gap-3 mb-8">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            Explore Career Resources <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <h3 className="font-semibold text-slate-900 text-[11px] tracking-wider uppercase mb-5">
          On the editorial calendar
        </h3>
        <ul className="space-y-3">
          {upcomingTopics.map((topic) => (
            <li
              key={topic}
              className="flex items-start gap-3 p-5 rounded-2xl border border-slate-100 bg-white text-sm text-slate-600 leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              {topic}
            </li>
          ))}
        </ul>
      </section>
    </MarketingShell>
  );
}
