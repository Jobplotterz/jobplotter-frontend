import { Link } from "react-router-dom";
import { 
  Zap, 
  Target, 
  FileText, 
  Search, 
  BarChart3, 
  Globe2, 
  Rocket, 
  ShieldCheck, 
  Cpu,
  ArrowRight
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const features = [
  {
    title: "AI-Powered Matching",
    description: "Our proprietary vector search engine analyzes your unique skill set and matches you with roles where you'll actually thrive, not just the ones that hit a keyword.",
    icon: <Cpu className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "ATS-Ready Resume Builder",
    description: "Stop getting ghosted by automated filters. Our builder creates high-conversion, ATS-optimized resumes that highlight what recruiters actually care about.",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    title: "Unified Startup Stream",
    description: "We aggregate the best roles from Glassdoor, LinkedIn, and hidden startup boards into one clean, actionable feed. No more tab-hopping.",
    icon: <Globe2 className="w-6 h-6" />,
    color: "bg-green-50 text-green-600"
  },
  {
    title: "Real-time Application Tracking",
    description: "Visualize your entire pipeline. From 'Interested' to 'Offer Received', track every stage of your journey with built-in reminders and follow-up tools.",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Deep Startup Intel",
    description: "Get insights into funding rounds, team size, and growth metrics before you apply. Know exactly what kind of rocket ship you're joining.",
    icon: <Target className="w-6 h-6" />,
    color: "bg-red-50 text-red-600"
  },
  {
    title: "Fast-Track Applications",
    description: "Save hours with one-click applications for supported partners. Your profile and optimized resume are ready to go whenever you are.",
    icon: <Zap className="w-6 h-6" />,
    color: "bg-yellow-50 text-yellow-600"
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
            The intelligent way to <br />
            <span className="text-indigo-600">navigate the startup market.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            JobPlotter isn't just a job board. It's an end-to-end career engine built to help you discover, apply for, and win roles at high-growth companies.
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

      {/* Deep Dive: Vector Search */}
      <section className="py-20 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] mb-6 tracking-widest uppercase border border-indigo-500/30">
                Technology Spotlight
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Our Vector Matching <br />
                Engine is a Game Changer.
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Traditional job boards use basic keyword matching. We use neural embeddings to understand the semantic relationship between your experience and a job's requirements. This means we find roles that "fit" you perfectly, even if the keywords don't match 1:1.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-sm text-slate-300"><span className="text-white font-semibold">Sematic Understanding:</span> We know that "React Specialist" and "Frontend Architect" are cousins.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-sm text-slate-300"><span className="text-white font-semibold">Resume Parsing:</span> Our AI extracts every ounce of value from your PDF automatically.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full opacity-50" />
              <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Matching Engine v2.4</div>
                </div>
                <div className="space-y-6">
                  <div className="h-4 bg-slate-700/50 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-700/50 rounded-full w-full animate-pulse delay-75" />
                  <div className="h-4 bg-indigo-500/40 rounded-full w-1/2 animate-pulse delay-150" />
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="h-20 bg-slate-700/30 rounded-xl border border-slate-600/50 flex flex-col items-center justify-center">
                      <div className="text-indigo-400 font-bold text-xl">98%</div>
                      <div className="text-[9px] text-slate-500">Precision</div>
                    </div>
                    <div className="h-20 bg-slate-700/30 rounded-xl border border-slate-600/50 flex flex-col items-center justify-center">
                      <div className="text-green-400 font-bold text-xl">0.4s</div>
                      <div className="text-[9px] text-slate-500">Match Speed</div>
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
            Join 5,000+ engineers, designers, and managers finding their place in the startup ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1">
              Start Free Trial
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
