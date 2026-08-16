import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Lightbulb,
  DollarSign,
  MessagesSquare,
  ScanSearch,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";
import { MarketingShell, PageHero } from "../components/MarketingShell";

const sections = [
  { id: "career-advice", label: "Career Advice" },
  { id: "salary-guide", label: "Salary Guide" },
  { id: "interview-prep", label: "Interview Prep" },
  { id: "ats-tips", label: "ATS Tips" }
];

const careerTips = [
  {
    title: "Search in sprints, not marathons",
    body: "Set a weekly target — say 8 quality applications — and work in focused blocks. A tailored application to a well-matched role beats ten generic ones, every time."
  },
  {
    title: "Let match scores set your priorities",
    body: "Spend your best energy on the highest-fit roles first. Your Jobplotter match score is a prioritization signal: high scores get a tailored resume; medium scores get a quick pass."
  },
  {
    title: "Follow up like a professional",
    body: "A short, polite follow-up 5–7 business days after applying can pull your name out of the pile. Track every application so nothing slips through the cracks."
  },
  {
    title: "Keep your story consistent",
    body: "Your resume, LinkedIn, and interview answers should tell the same story with the same numbers. Recruiters cross-reference — inconsistencies read as red flags."
  },
  {
    title: "Quantify everything you can",
    body: "\"Improved performance\" is forgettable; \"cut page load time 40%\" sticks. Comb your history for numbers: users, revenue, time saved, team size, error rates."
  },
  {
    title: "Treat rejection as routing",
    body: "Most rejections are about fit and timing, not worth. Log them, look for patterns (stage, role type, seniority), adjust your targeting, and keep moving."
  }
];

const salarySteps = [
  {
    step: "1",
    title: "Research the real range",
    body: "Triangulate from multiple sources — levels.fyi, Glassdoor, LinkedIn Salary, and posted ranges in pay-transparency states. Anchor on the role, level, and location, not the company's first offer."
  },
  {
    step: "2",
    title: "Know your number before the call",
    body: "Decide your target, your happy point, and your walk-away before anyone asks. If pressed early, give a researched range and pivot back to fit: \"Based on market data for this role, I'm targeting X–Y.\""
  },
  {
    step: "3",
    title: "Evaluate total compensation",
    body: "Base salary is one line item. Equity, bonus, 401(k) match, healthcare, remote flexibility, and learning budget can swing real value by 20–40%. Compare offers on the whole package."
  },
  {
    step: "4",
    title: "Negotiate — kindly and once",
    body: "Most offers have room. Respond with enthusiasm, then a specific, justified ask: one counter with your research behind it. Companies rarely rescind for a professional negotiation."
  }
];

const interviewStages = [
  {
    stage: "Before",
    items: [
      "Re-read the job description and map each requirement to a story from your experience",
      "Research the company: product, funding stage, recent news, and who's interviewing you",
      "Prepare 5–6 STAR stories (Situation, Task, Action, Result) you can adapt to most questions",
      "Have 3 thoughtful questions ready — about the team, roadmap, and how success is measured"
    ]
  },
  {
    stage: "During",
    items: [
      "Answer with structure: headline first, then detail — don't make them dig for the point",
      "Use real numbers from your resume; interviewers probe whatever you claim",
      "It's fine to pause. \"Let me think about that for a second\" reads as thoughtful, not slow",
      "Close by asking about next steps and restating your interest"
    ]
  },
  {
    stage: "After",
    items: [
      "Send a short thank-you note within 24 hours referencing something specific you discussed",
      "Log the interview stage in your application tracker while it's fresh",
      "Note the questions you were asked — they'll repeat across companies",
      "No response after a week past their stated timeline? One polite nudge is appropriate"
    ]
  }
];

const atsDo = [
  "Use standard section headings: Experience, Education, Skills",
  "Mirror key terms from the job description where they're genuinely true of you",
  "Stick to clean, single-column layouts with standard fonts",
  "Submit PDF unless the posting asks for another format",
  "Spell out acronyms once: \"Search Engine Optimization (SEO)\"",
  "Keep dates in a consistent, simple format (e.g., Jan 2024 – Present)"
];

const atsDont = [
  "Put critical info in headers, footers, text boxes, or images",
  "Use tables or multi-column layouts that scramble parsing order",
  "Keyword-stuff — modern systems and recruiters both spot it instantly",
  "Rely on graphics, charts, or icons to carry information",
  "Use decorative fonts or unusual characters in section titles",
  "Send the same untailored resume to every single role"
];

export default function Resources() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.hash]);

  return (
    <MarketingShell>
      <PageHero
        badge="Career Resources"
        title={
          <>
            Everything you need to <br className="hidden sm:block" />
            <span className="text-indigo-600">run a winning search.</span>
          </>
        }
        subtitle="Practical, no-fluff guidance on job hunting, salary, interviews, and getting past the resume robots."
      />

      {/* Section nav */}
      <div className="sticky top-[57px] sm:top-[65px] z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex gap-2 sm:gap-6 overflow-x-auto py-3 scrollbar-none">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="whitespace-nowrap text-[13px] font-semibold text-slate-500 hover:text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Career Advice */}
      <section id="career-advice" className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8 scroll-mt-28">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Career Advice</h2>
        </div>
        <p className="text-slate-500 mb-10 max-w-2xl">
          The habits that separate a focused, effective search from months of spray-and-pray.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerTips.map((tip) => (
            <div
              key={tip.title}
              className="p-7 rounded-3xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
            >
              <h3 className="font-bold text-slate-900 mb-2.5">{tip.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Salary Guide */}
      <section id="salary-guide" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-100 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Salary Guide</h2>
          </div>
          <p className="text-slate-500 mb-10 max-w-2xl">
            How to figure out what you're worth — and actually get it — in four steps.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {salarySteps.map((s) => (
              <div key={s.step} className="p-7 sm:p-8 rounded-3xl border border-slate-100 bg-white">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-5">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2.5">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview Prep */}
      <section id="interview-prep" className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8 scroll-mt-28">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <MessagesSquare className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Interview Prep</h2>
        </div>
        <p className="text-slate-500 mb-10 max-w-2xl">
          A checklist for before, during, and after — so nothing is left to nerves.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {interviewStages.map((stage) => (
            <div key={stage.stage} className="p-7 rounded-3xl border border-slate-100 bg-white">
              <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] tracking-wider uppercase mb-5">
                {stage.stage}
              </div>
              <ul className="space-y-3.5">
                {stage.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ATS Tips */}
      <section id="ats-tips" className="py-16 sm:py-24 bg-slate-50 border-y border-slate-100 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <ScanSearch className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">ATS Tips</h2>
          </div>
          <p className="text-slate-500 mb-10 max-w-2xl">
            Most resumes are read by software before a human. Here's how to make sure yours survives the trip.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 sm:p-8 rounded-3xl border border-green-100 bg-white">
              <h3 className="font-bold text-green-700 mb-5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Do
              </h3>
              <ul className="space-y-3.5">
                {atsDo.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-7 sm:p-8 rounded-3xl border border-red-100 bg-white">
              <h3 className="font-bold text-red-600 mb-5 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Don't
              </h3>
              <ul className="space-y-3.5">
                {atsDont.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-5">
            Put it into practice.
          </h2>
          <p className="text-slate-500 mb-9 text-base sm:text-lg">
            Build an ATS-ready resume and let our matching engine find the roles worth your effort.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
