import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Layout, MessageSquare, CreditCard, ShoppingBag, Briefcase, Globe, FileText, ScanSearch, Target, Puzzle } from "lucide-react";
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
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-28 text-center">
        {/* Floating Icons - hidden on mobile for clean look */}
        <div className="hidden lg:block">
          <div className="absolute top-10 left-20 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-blue-500 animate-bounce" style={{ animationDuration: '3s' }}><Layout className="w-5 h-5" /></div>
          <div className="absolute top-1/2 left-10 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-green-500 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}><MessageSquare className="w-5 h-5" /></div>
          <div className="absolute bottom-24 left-28 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-blue-800 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}><CreditCard className="w-5 h-5" /></div>
          <div className="absolute top-10 right-28 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-red-500 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.2s' }}><Globe className="w-5 h-5" /></div>
          <div className="absolute top-1/2 right-10 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-red-600 animate-bounce" style={{ animationDuration: '4.1s', animationDelay: '1.2s' }}><Briefcase className="w-5 h-5" /></div>
          <div className="absolute bottom-24 right-36 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-green-600 animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '0.8s' }}><ShoppingBag className="w-5 h-5" /></div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-medium text-xs mb-6">
          AI Resume Builder + AI Job Matching
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-slate-900 mb-5 max-w-3xl mx-auto leading-[1.1]">
          Build your resume.<br className="hidden sm:block" /> Let AI find the fit.
        </h1>

        <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Jobplotter is the intelligent way to navigate the modern job market. Plot your path to the perfect role with data-driven matches and ATS-ready resumes.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto bg-white rounded-xl shadow-[0_4px_24px_rgb(0,0,0,0.06)] p-1.5 flex flex-col sm:flex-row items-center border border-slate-100">
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

        <p className="mt-6 text-[13px] text-slate-500">
          Free to start — <span className="font-semibold text-slate-700">no credit card required</span>
        </p>
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
            { icon: FileText, title: "AI Resume Builder", desc: "Build from scratch, upload an existing resume, or describe your career and let our AI co-builder draft it for you." },
            { icon: ScanSearch, title: "Actionable AI Review", desc: "Get an ATS compatibility score plus one-click fixes for every suggestion — no more guessing what to change." },
            { icon: Target, title: "AI Job Matching", desc: "Every job gets a real compatibility score based on your experience, with strengths and gaps explained." },
            { icon: Puzzle, title: "Browser Extension", desc: "See your match score and auto-fill applications directly on LinkedIn and Indeed." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-50 p-8 rounded-2xl text-center hover:bg-slate-100 transition-colors">
              <div className="w-14 h-14 bg-indigo-500 rounded-full mx-auto mb-5 flex items-center justify-center text-white">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-[15px] mb-2">{title}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed">
                {desc}
              </p>
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
            <Accordion type="single" collapsible className="w-full">
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
