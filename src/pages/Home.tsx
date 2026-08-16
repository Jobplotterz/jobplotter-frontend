import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Briefcase, FileText, ScanSearch, Target, Puzzle, ArrowRight, Zap } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Job search lives behind auth (this hero is only ever seen logged-out,
  // since the effect above redirects authenticated users away) — route
  // straight to signup rather than pretending to run a live search here.
  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/signup");
  };
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 lg:pt-20 pb-24 sm:pb-28 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* Left: copy + search */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-departure text-[11px] mb-6">
              AI Resume Builder + AI Job Matching
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.9rem] font-extrabold tracking-tight text-slate-900 mb-5 leading-[1.06]">
              Build your resume.<br />
              Let AI find <span className="text-indigo-600">the fit.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Jobplotter is the intelligent way to navigate the modern job market. Plot your path to the perfect role with data-driven matches and ATS-ready resumes.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto lg:mx-0 bg-white rounded-xl shadow-[0_4px_24px_rgb(0,0,0,0.06)] p-1.5 flex flex-col sm:flex-row items-center border border-slate-100">
              <div className="flex-1 flex items-center px-3 py-2.5 w-full border-b sm:border-b-0 sm:border-r border-slate-200">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input type="text" placeholder="Job title or keyword" className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400" />
              </div>
              <div className="flex-1 flex items-center px-3 py-2.5 w-full">
                <MapPin className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input type="text" placeholder="Enter locations" className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400" />
              </div>
              <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors mt-1.5 sm:mt-0">
                Search
              </button>
            </form>

            <p className="mt-4 text-[13px] text-slate-500">
              Free to start — <span className="font-semibold text-slate-700">no credit card required</span>
            </p>

            {/* Stat + feature blurb */}
            <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-6">
              <div className="bg-indigo-50 rounded-2xl px-8 py-5 text-center shrink-0">
                <div className="font-departure text-3xl text-indigo-700">0–100</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-1.5 uppercase tracking-wide">Match score</div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-slate-900 mb-1">Matches that actually fit</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-2.5 max-w-xs">
                  Every role is scored against your real experience — not just keywords.
                </p>
                <Link to="/features" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Browse all features <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: product composition */}
          <div className="relative max-w-xl mx-auto w-full lg:max-w-none">
            {/* Dark panel */}
            <div className="relative bg-slate-900 rounded-[2rem] p-6 sm:p-8 pb-28 overflow-hidden shadow-2xl shadow-slate-900/20">
              {/* Glows + dot grid */}
              <div className="absolute -right-20 -top-20 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl" />
              <div className="absolute -left-16 bottom-0 w-56 h-56 bg-indigo-400/15 rounded-full blur-3xl" />
              <div
                className="absolute right-8 top-8 w-24 h-24 opacity-50"
                style={{ backgroundImage: "radial-gradient(circle, #818cf8 1.5px, transparent 1.5px)", backgroundSize: "10px 10px" }}
              />

              {/* Window chrome */}
              <div className="relative flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="font-departure text-[10px] text-slate-500 tracking-widest uppercase">Matching Engine</div>
              </div>

              {/* Chat exchange */}
              <div className="relative space-y-4">
                <div className="flex justify-end">
                  <div className="bg-white text-slate-800 text-[13px] leading-snug px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-lg">
                    Find remote frontend roles that actually fit my resume
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-[13px] leading-snug px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[85%]">
                    On it — scoring every open role against your experience…
                  </div>
                </div>
                <div className="pt-3 space-y-2.5">
                  <div className="h-3 bg-slate-700/60 rounded-full w-3/4 animate-pulse" />
                  <div className="h-3 bg-slate-700/60 rounded-full w-1/2 animate-pulse delay-150" />
                  <div className="h-3 bg-indigo-500/40 rounded-full w-2/3 animate-pulse delay-300" />
                </div>
              </div>
            </div>

            {/* Floating: new matches pill */}
            <div className="absolute -top-4 -left-2 sm:-left-5 bg-white rounded-full shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-slate-800">New matches found</span>
            </div>

            {/* Floating: top matches card */}
            <div className="absolute -bottom-10 left-3 right-3 sm:left-8 sm:right-auto sm:w-[370px] bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900">Your top matches</h4>
                <span className="font-departure text-[10px] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">LIVE</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">Frontend Engineer</div>
                    <div className="text-[11px] text-slate-400 truncate">Remote · Series B fintech</div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full shrink-0">94% match</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 truncate">Product Designer</div>
                    <div className="text-[11px] text-slate-400 truncate">Hybrid · AI startup</div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full shrink-0">89% match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources strip */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-10">
          <span className="font-departure text-[10px] uppercase tracking-widest text-slate-400 shrink-0">Aggregating roles from</span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-slate-400 font-bold text-sm sm:text-base">
            <span>LinkedIn</span>
            <span>Indeed</span>
            <span>Glassdoor</span>
            <span>ZipRecruiter</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3">How Jobplotter works</h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">From resume to offer, in three steps — curated for serious job seekers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full">Step 1</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">Build your resume</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Upload an existing resume or describe your career to our AI co-builder — either way, you'll have a polished, ATS-ready resume in minutes.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full">Step 2</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">Get matched with AI</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Every job gets a compatibility score based on your actual experience — with strengths and gaps explained, not just keyword matching.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-full">Step 3</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2 leading-snug">Track & apply faster</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Save jobs, track every application through each stage, and auto-fill applications right from the browser extension.</p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/signup" className="inline-block px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors uppercase tracking-wide text-xs">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: FileText,
              title: "AI Resume Builder",
              desc: "Build from scratch, upload an existing resume, or describe your career and let our AI co-builder draft it for you.",
              img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=60",
              alt: "Person typing a resume on a laptop"
            },
            {
              icon: ScanSearch,
              title: "Actionable AI Review",
              desc: "Get an ATS compatibility score plus one-click fixes for every suggestion — no more guessing what to change.",
              img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=60",
              alt: "Reviewing notes and documents next to a laptop"
            },
            {
              icon: Target,
              title: "AI Job Matching",
              desc: "Every job gets a real compatibility score based on your experience, with strengths and gaps explained.",
              img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=60",
              alt: "Two people shaking hands over a job offer"
            },
            {
              icon: Puzzle,
              title: "Browser Extension",
              desc: "See your match score and auto-fill applications directly on LinkedIn, Indeed, and Upwork.",
              img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=60",
              alt: "Laptop on a desk with a browser open"
            },
          ].map(({ icon: Icon, title, desc, img, alt }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={img}
                  alt={alt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
                <div className="absolute bottom-3 left-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center text-indigo-600 shadow-lg">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-slate-900 text-[15px] mb-2">{title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-5 sm:px-8 border-t border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-md mb-4 inline-block tracking-wide">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Frequently Asked<br className="hidden sm:block" /> Questions</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Find answers to the most common questions about Jobplotter, pricing, features, and more.</p>
          </div>
          <div className="lg:col-span-7">
            <Accordion multiple={false} className="w-full">
              <AccordionItem value="item-1" className="border-b border-slate-200 py-1">
                <AccordionTrigger className="text-[15px] font-semibold text-slate-900 hover:no-underline">Can I try Jobplotter for free?</AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-2">
                  Yes — our Free plan is free forever, no credit card required. Want unlimited AI tailoring? Pro includes a 7-day free trial.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b border-slate-200 py-1">
                <AccordionTrigger className="text-[15px] font-semibold text-slate-900 hover:no-underline">Can I cancel my subscription anytime?</AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-2">
                  Yes, you can cancel your subscription at any time from your account settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b border-slate-200 py-1">
                <AccordionTrigger className="text-[15px] font-semibold text-slate-900 hover:no-underline">What happens if I use up my daily AI operations?</AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-2">
                  Each plan includes a daily allowance for AI actions like resume review, tailoring, and the AI co-builder. It resets every day, or you can upgrade for a higher daily limit.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-b border-slate-200 py-1">
                <AccordionTrigger className="text-[15px] font-semibold text-slate-900 hover:no-underline">What payment methods do you accept?</AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-2">
                  We accept all major credit cards. Subscriptions are billed monthly and you can cancel anytime.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-indigo-50 rounded-3xl py-14 sm:py-16 px-6 sm:px-8 text-center">
          <span className="px-3.5 py-1.5 bg-white text-indigo-600 text-[11px] font-bold rounded-full mb-6 inline-block shadow-sm tracking-wide uppercase">Get Started Today</span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 mb-4 max-w-2xl mx-auto leading-tight">
            Plot your path to the perfect job with Jobplotter
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
            Build your resume, get AI-matched to real roles, and track every application — free to start, no credit card required.
          </p>
          <Link to="/signup" className="inline-block px-7 py-3.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
