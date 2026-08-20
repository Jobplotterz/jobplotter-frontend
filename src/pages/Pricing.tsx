import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Check, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const plans = [
  {
    id: "basic",
    name: "Basic",
    badge: "7-DAY FREE TRIAL",
    description: "Everything you need to build a resume and start matching — try it free for 7 days.",
    price: "$5",
    period: "/month",
    buttonText: "Start 7-Day Free Trial",
    buttonClass: "bg-slate-50 text-slate-900 hover:bg-slate-100",
    popular: false,
    features: [
      "Up to 3 resumes",
      "All resume templates",
      "15 AI resume actions/day",
      "AI resume review, optimize & tailor-for-job",
      "AI Co-Builder (build a resume from a description)",
      "Unlimited job search & AI match scores",
      "Save up to 50 jobs",
      "Application tracker (up to 25 active)",
      "DOCX export",
      "Browser extension — save jobs & match scores",
      "Email support"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    badge: "MOST POPULAR",
    description: "For serious job seekers who want unlimited room and the full extension.",
    price: "$12",
    period: "/month",
    buttonText: "Upgrade to Pro",
    buttonClass: "bg-white text-indigo-600 hover:bg-slate-50",
    popular: true,
    features: [
      "Everything in Basic, plus:",
      "Unlimited resumes",
      "40 AI resume actions/day",
      "Browser extension with autofill",
      "PDF export",
      "Unlimited saved jobs",
      "Unlimited application tracker",
      "Priority email support"
    ]
  },
  {
    id: "premium",
    name: "Premium",
    description: "For candidates running a high-volume search who want maximum AI throughput.",
    price: "$29",
    period: "/month",
    buttonText: "Upgrade to Premium",
    buttonClass: "bg-indigo-600 text-white hover:bg-indigo-700",
    popular: false,
    features: [
      "Everything in Pro, plus:",
      "120 AI resume actions/day",
      "Priority AI queue during high-demand periods",
      "Priority support"
    ]
  }
];

// Feature rows shown before a long card collapses behind "+N more features"
const FEATURE_PREVIEW_COUNT = 5;

const comparisonFeatures = [
  { name: "Active Resumes", starter: "Up to 3", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Resume Templates", starter: "All Templates", growth: "All Templates", enterprise: "All Templates" },
  { name: "AI Resume Actions/Day", starter: "15", growth: "40", enterprise: "120" },
  { name: "AI Resume Review, Optimize & Tailor-for-Job", starter: true, growth: true, enterprise: true },
  { name: "AI Co-Builder", starter: true, growth: true, enterprise: true },
  { name: "AI Job Matching & Match Scores", starter: "Unlimited", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Job Search & Browsing", starter: "Unlimited", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Saved Jobs", starter: "Up to 50", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Application Tracker", starter: "Up to 25", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Browser Extension", starter: "Save & match scores", growth: "Full autofill", enterprise: "Full autofill" },
  { name: "PDF Export", starter: false, growth: true, enterprise: true },
  { name: "DOCX Export", starter: true, growth: true, enterprise: true },
  { name: "Priority AI Queue", starter: false, growth: false, enterprise: true },
  { name: "Support", starter: "Email", growth: "Priority Email", enterprise: "Priority Email" }
];

export function Pricing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutCancelled = searchParams.get("checkout") === "cancelled";
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  const toggleExpanded = (planId: string) =>
    setExpandedPlans((prev) => ({ ...prev, [planId]: !prev[planId] }));

  const handlePlanClick = async (planId: string) => {
    if (!isAuthenticated) {
      // No way to check out before an account exists.
      navigate("/signup");
      return;
    }

    setCheckoutError(null);
    setLoadingPlan(planId);
    try {
      const token = localStorage.getItem("jobplotter_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/billing/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planId })
      });

      if (response.ok) {
        const result = await response.json();
        window.location.href = result.url;
        return;
      }

      let errorMsg = "Couldn't start checkout. Please try again.";
      try {
        const body = await response.clone().json();
        if (body?.detail) errorMsg = body.detail;
      } catch {
        // ignore
      }
      if (response.status === 503) errorMsg = "Billing is briefly unavailable. Please try again in a moment.";
      setCheckoutError(errorMsg);
    } catch {
      setCheckoutError("We couldn't reach the billing service. Check your connection and try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

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
          Choose the plan that fits where you are in your job search — from first application to final offer. Start with a 7-day free trial, upgrade anytime, cancel whenever.
        </p>
        {checkoutCancelled && (
          <p className="mt-5 text-[13px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 inline-block">
            Checkout cancelled — no charge was made.
          </p>
        )}
        {checkoutError && (
          <p className="mt-5 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 inline-block">
            {checkoutError}
          </p>
        )}
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => {
            const isExpanded = !!expandedPlans[plan.id];
            const hiddenCount = plan.features.length - FEATURE_PREVIEW_COUNT;
            const visibleFeatures = isExpanded ? plan.features : plan.features.slice(0, FEATURE_PREVIEW_COUNT);
            return (
            <div
              key={index}
              className={`flex flex-col rounded-2xl border ${plan.popular ? 'border-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-200 shadow-sm'} overflow-hidden bg-white`}
            >
              {/* Card Header */}
              <div className={`p-6 text-center ${plan.popular ? 'bg-indigo-600 text-white' : 'bg-white text-slate-900'}`}>
                <div className="flex justify-center items-center gap-2 mb-3">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {plan.badge && (
                    <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full ${plan.popular ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
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
                <button
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className={`w-full py-3 px-5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer ${plan.buttonClass}`}
                >
                  {loadingPlan === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  {plan.buttonText}
                </button>
              </div>

              {/* Card Features */}
              <div className="p-6 bg-white flex-1 flex flex-col">
                <ul className="space-y-3.5">
                  {visibleFeatures.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2.5">
                      <div className="shrink-0 w-4.5 h-4.5 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5" style={{ width: '18px', height: '18px' }}>
                        <Check className="w-2.5 h-2.5 text-indigo-600 stroke-3" />
                      </div>
                      <span className="text-[13px] text-slate-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                {hiddenCount > 0 && (
                  <button
                    onClick={() => toggleExpanded(plan.id)}
                    aria-expanded={isExpanded}
                    className="group/expand mt-auto pt-4 w-full cursor-pointer"
                  >
                    <span className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-semibold text-slate-400 border border-dashed border-slate-200 group-hover/expand:text-indigo-600 group-hover/expand:border-indigo-200 group-hover/expand:bg-indigo-50/60 transition-all">
                      {isExpanded ? (
                        <>
                          Show less
                          <ChevronUp className="w-3.5 h-3.5 group-hover/expand:-translate-y-0.5 transition-transform" />
                        </>
                      ) : (
                        <>
                          +{hiddenCount} more features
                          <ChevronDown className="w-3.5 h-3.5 group-hover/expand:translate-y-0.5 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>
            );
          })}
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
                  <div className="text-sm font-bold text-slate-900 mb-3">Basic</div>
                  <button
                    onClick={() => handlePlanClick("basic")}
                    disabled={loadingPlan === "basic"}
                    className="px-5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-900 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {loadingPlan === "basic" ? "Starting..." : "Start Free Trial"}
                  </button>
                </th>
                <th className="w-1/4 p-5 border-b border-slate-200 text-center bg-indigo-50/30">
                  <div className="text-sm font-bold text-slate-900 mb-3">Pro</div>
                  <button
                    onClick={() => handlePlanClick("pro")}
                    disabled={loadingPlan === "pro"}
                    className="px-5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {loadingPlan === "pro" ? "Starting..." : "Upgrade"}
                  </button>
                </th>
                <th className="w-1/4 p-5 border-b border-slate-200 text-center">
                  <div className="text-sm font-bold text-slate-900 mb-3">Premium</div>
                  <button
                    onClick={() => handlePlanClick("premium")}
                    disabled={loadingPlan === "premium"}
                    className="px-5 py-1.5 text-xs font-semibold bg-slate-50 text-slate-900 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {loadingPlan === "premium" ? "Starting..." : "Upgrade"}
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
          {["Basic", "Pro", "Premium"].map((planName) => (
            <div key={planName} className={`rounded-xl border p-5 ${planName === "Pro" ? "border-indigo-200 bg-indigo-50/20" : "border-slate-200 bg-white"}`}>
              <h3 className="font-bold text-base text-slate-900 mb-4">{planName}</h3>
              <div className="space-y-3">
                {comparisonFeatures.map((feature, index) => {
                  const value = planName === "Basic" ? feature.starter : planName === "Pro" ? feature.growth : feature.enterprise;
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
