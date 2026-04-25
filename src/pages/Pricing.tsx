import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Start your search and build your first resume — no credit card needed.",
    price: "$0",
    period: "/forever",
    buttonText: "Get Started",
    buttonClass: "bg-slate-50 text-slate-900 hover:bg-slate-100",
    popular: false,
    features: [
      "1 active resume",
      "3 starter templates",
      "Unlimited job search & browsing",
      "Save up to 10 jobs",
      "Basic ATS compatibility check",
      "PDF export (with watermark)",
      "Community support"
    ]
  },
  {
    name: "Pro",
    badge: "MOST POPULAR",
    description: "Everything a serious job seeker needs to stand out and land interviews.",
    price: "$12",
    period: "/month",
    buttonText: "Start 7-Day Free Trial",
    buttonClass: "bg-white text-indigo-600 hover:bg-slate-50",
    popular: true,
    features: [
      "Unlimited resumes & versions",
      "All premium templates",
      "AI resume tailoring per job description",
      "Advanced ATS score & keyword insights",
      "AI cover letter generator",
      "Personalized job matches",
      "Unlimited application tracker",
      "PDF & DOCX exports (no watermark)",
      "Priority email support"
    ]
  },
  {
    name: "Premium",
    description: "For candidates who want expert review, coaching, and priority visibility.",
    price: "$29",
    period: "/month",
    buttonText: "Upgrade to Premium",
    buttonClass: "bg-indigo-600 text-white hover:bg-indigo-700",
    popular: false,
    features: [
      "Everything in Pro",
      "1-on-1 expert resume review",
      "AI-powered interview prep & mock questions",
      "LinkedIn profile optimization",
      "Priority visibility to recruiters",
      "Salary negotiation guidance",
      "Shareable custom resume link",
      "24/7 white-glove support"
    ]
  }
];

const comparisonFeatures = [
  { name: "Active Resumes", starter: "1", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Resume Templates", starter: "3 Starter", growth: "All Premium", enterprise: "All Premium + Exclusive" },
  { name: "AI Resume Tailoring", starter: false, growth: true, enterprise: true },
  { name: "ATS Compatibility Score", starter: "Basic", growth: "Advanced", enterprise: "Advanced + Recruiter Insights" },
  { name: "Cover Letter Generator", starter: false, growth: true, enterprise: true },
  { name: "Job Search & Browsing", starter: "Unlimited", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Personalized Job Matches", starter: false, growth: true, enterprise: true },
  { name: "Saved Jobs", starter: "10", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Application Tracker", starter: "Up to 5", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Export Formats", starter: "PDF (watermarked)", growth: "PDF & DOCX", enterprise: "PDF, DOCX & Shareable Link" },
  { name: "Salary Insights", starter: false, growth: true, enterprise: true },
  { name: "Expert Resume Review", starter: false, growth: false, enterprise: true },
  { name: "Interview Prep & Mock Questions", starter: false, growth: false, enterprise: true },
  { name: "LinkedIn Profile Optimization", starter: false, growth: false, enterprise: true },
  { name: "Priority Recruiter Visibility", starter: false, growth: false, enterprise: true },
  { name: "Support", starter: "Community", growth: "Priority Email", enterprise: "24/7 White-Glove" }
];

export function Pricing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="relative">
        <Navbar />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-linear-to-br from-indigo-50/50 via-white to-purple-50/30 z-0 pointer-events-none" />
      </div>

      {/* Header Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-12 text-center">
        <div className="inline-flex items-center justify-center px-2.5 py-1 mb-5 text-[11px] font-bold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full">
          Pricing
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 mb-4 tracking-tight leading-tight">
          Plans built for your next career.
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl mx-auto">
          Choose the plan that fits where you are in your job search — from first application to final offer. Start free, upgrade anytime, cancel whenever.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col rounded-2xl border ${plan.popular ? 'border-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-200 shadow-sm'} overflow-hidden bg-white`}
            >
              {/* Card Header */}
              <div className={`p-6 text-center ${plan.popular ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900'}`}>
                <div className="flex justify-center items-center gap-2 mb-3">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {plan.badge && (
                    <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-white/20 text-white rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className={`text-[13px] mb-6 px-2 ${plan.popular ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {plan.description}
                </p>
                <div className="mb-6 flex items-baseline justify-center gap-0.5">
                  <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                  {plan.period && <span className={`text-[13px] font-medium ${plan.popular ? 'text-indigo-100' : 'text-slate-500'}`}>{plan.period}</span>}
                </div>
                <button className={`w-full py-3 px-5 rounded-lg text-sm font-semibold transition-colors ${plan.buttonClass}`}>
                  {plan.buttonText}
                </button>
              </div>

              {/* Card Features */}
              <div className="p-6 bg-white flex-1">
                <ul className="space-y-3.5">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2.5">
                      <div className="shrink-0 w-4.5 h-4.5 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5" style={{ width: '18px', height: '18px' }}>
                        <Check className="w-2.5 h-2.5 text-indigo-600 stroke-3" />
                      </div>
                      <span className="text-[13px] text-slate-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 sm:pb-28">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-2.5 py-1 mb-5 text-[11px] font-bold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full">
            Plan Comparison
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Compare Our Plans
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            Find the perfect plan that fits your job search. Whether you're just starting out or accelerating your career, Jobplotter has you covered.
          </p>
        </div>

        {/* Mobile: Stack cards; Desktop: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="w-1/4 p-5 border-b border-slate-200 bg-white sticky left-0 z-10">
                  <span className="text-base font-bold text-slate-900">Features</span>
                </th>
                <th className="w-1/4 p-5 border-b border-slate-200 text-center">
                  <div className="text-sm font-bold text-slate-900 mb-3">Free</div>
                  <button className="px-5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-900 rounded-full hover:bg-slate-100 transition-colors">
                    Get Started
                  </button>
                </th>
                <th className="w-1/4 p-5 border-b border-slate-200 text-center bg-indigo-50/30">
                  <div className="text-sm font-bold text-slate-900 mb-3">Pro</div>
                  <button className="px-5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                    Start Free Trial
                  </button>
                </th>
                <th className="w-1/4 p-5 border-b border-slate-200 text-center">
                  <div className="text-sm font-bold text-slate-900 mb-3">Premium</div>
                  <button className="px-5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-900 rounded-full hover:bg-slate-100 transition-colors">
                    Upgrade
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 border-b border-slate-100 text-[13px] font-medium text-slate-900 bg-white group-hover:bg-slate-50/50 sticky left-0 z-10">
                    {feature.name}
                  </td>
                  <td className="p-4 border-b border-slate-100 text-center text-slate-500 text-[13px]">
                    {typeof feature.starter === 'boolean' ? (
                      feature.starter ? <Check className="w-4 h-4 text-indigo-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />
                    ) : feature.starter}
                  </td>
                  <td className="p-4 border-b border-slate-100 text-center text-slate-500 text-[13px] bg-indigo-50/30 group-hover:bg-indigo-50/50">
                    {typeof feature.growth === 'boolean' ? (
                      feature.growth ? <Check className="w-4 h-4 text-indigo-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />
                    ) : feature.growth}
                  </td>
                  <td className="p-4 border-b border-slate-100 text-center text-slate-500 text-[13px]">
                    {typeof feature.enterprise === 'boolean' ? (
                      feature.enterprise ? <Check className="w-4 h-4 text-indigo-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />
                    ) : feature.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile comparison: stacked cards */}
        <div className="md:hidden space-y-6">
          {["Free", "Pro", "Premium"].map((planName) => (
            <div key={planName} className={`rounded-xl border p-5 ${planName === "Pro" ? "border-indigo-200 bg-indigo-50/20" : "border-slate-200 bg-white"}`}>
              <h3 className="font-bold text-base text-slate-900 mb-4">{planName}</h3>
              <div className="space-y-3">
                {comparisonFeatures.map((feature, index) => {
                  const value = planName === "Free" ? feature.starter : planName === "Pro" ? feature.growth : feature.enterprise;
                  return (
                    <div key={index} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-[13px] font-medium text-slate-700">{feature.name}</span>
                      <span className="text-[13px] text-slate-500 text-right ml-3">
                        {typeof value === 'boolean' ? (
                          value ? <Check className="w-4 h-4 text-indigo-600" /> : <X className="w-4 h-4 text-slate-300" />
                        ) : value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
