import { Link } from "react-router-dom";
import {
  Target,
  FileText,
  ScanSearch,
  Search,
  LayoutList,
  Puzzle,
  Rocket,
  CheckCircle2
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const features = [
  {
    title: "AI Resume Builder",
    description: "Build from scratch, upload an existing resume, or describe your career and let the AI Co-Builder draft it for you. Pick from multiple templates and export a clean PDF.",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    title: "Actionable AI Review",
    description: "Get an ATS compatibility score plus specific, one-click fixes for each suggestion — so you know exactly what to change instead of guessing.",
    icon: <ScanSearch className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "AI Job Matching",
    description: "Our AI reads your resume and scores each role against your real experience — with the strengths and gaps behind every score spelled out, not just a keyword count.",
    icon: <Target className="w-6 h-6" />,
    color: "bg-green-50 text-green-600"
  },
  {
    title: "Job Search & Save",
    description: "Search real openings aggregated from major job boards, filter by location or remote, and save the ones worth pursuing to come back to later.",
    icon: <Search className="w-6 h-6" />,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Application Tracker",
    description: "Keep your whole pipeline in one view. Move each application through its stages — from applied to interviewing to offer — so nothing slips through the cracks.",
    icon: <LayoutList className="w-6 h-6" />,
    color: "bg-amber-50 text-amber-600"
  },
  {
    title: "Browser Extension",
    description: "See your match score right on the job posting and autofill applications on LinkedIn, Indeed, and Upwork — without leaving the page you're on.",
    icon: <Puzzle className="w-6 h-6" />,
    color: "bg-red-50 text-red-600"
  }
];

const matchingSteps = [
  {
    title: "Shortlist by relevance",
    body: "We scan real openings and pull a focused pool of candidates that line up with the roles, skills, and keywords in your resume — so the AI spends its effort on jobs that are actually plausible."
  },
  {
    title: "Score against your experience",
    body: "Our AI reads each shortlisted role against your actual background and rates the fit. Because it reads for meaning, a 'Frontend Architect' posting can still match a 'React Specialist' resume even without identical wording."
  },
  {
    title: "Explain the score",
    body: "Every match comes with its reasoning: the strengths that make you a fit and the gaps worth addressing — so the score is a decision you can act on, not a black box."
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-slate-50 border-b border-slate-100 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs mb-6 tracking-wide uppercase">
            Platform Capabilities
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Everything you need to <br />
            <span className="text-indigo-600">build, match, and apply.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Jobplotter brings your resume, your matches, and your applications into one workflow — with AI helping at every step, from first draft to final offer.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-20 sm:py-32 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-8 rounded-3xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Dive: How matching works */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] mb-6 tracking-widest uppercase border border-indigo-500/30">
                How Matching Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Matches based on your <br />
                experience — not keywords.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Traditional job boards rank by keyword overlap. Jobplotter shortlists roles that are plausibly relevant, then has AI read each one against your actual experience and score the fit — with the reasoning attached.
              </p>
              <div className="space-y-5">
                {matchingSteps.map((step, i) => (
                  <div key={step.title} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-300 font-bold text-xs">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <span className="text-white font-semibold">{step.title}:</span> {step.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-50" />
              <div className="relative rounded-2xl border border-slate-700 bg-slate-800/60 shadow-2xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-departure text-[10px] text-slate-400 tracking-widest uppercase">Match Result</span>
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-1 rounded-full">92% match</span>
                </div>
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white">Senior Frontend Engineer</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Remote · Product company</div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-300 mb-2">Strengths</div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-[13px] text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        5+ years of React matches the core requirement
                      </div>
                      <div className="flex items-start gap-2 text-[13px] text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        Design-system work maps to their component library
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-amber-300 mb-2">Gaps</div>
                    <div className="flex items-start gap-2 text-[13px] text-slate-300">
                      <span className="w-4 h-4 rounded-full border border-amber-400/60 shrink-0 mt-0.5" />
                      No mention of GraphQL — worth adding if you have it
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8">
            <Rocket className="w-10 h-10" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            Ready to plot your next career move?
          </h2>
          <p className="text-slate-500 mb-10 text-lg">
            Build an ATS-ready resume, see how you match real roles, and track every application — free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1">
              Get Started Free
            </Link>
            <Link to="/pricing" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:border-slate-300 transition-all hover:bg-slate-50">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
