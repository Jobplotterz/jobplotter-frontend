import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

interface BillingStatus {
  plan: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: number | null;
}

// A user has access iff they're on a real plan. The webhook writes plan="free"
// when a subscription is canceled/deleted, so this stays in lockstep with the
// backend's capacity checks (which grant nothing to "free").
function hasActivePlan(b: BillingStatus | null): boolean {
  return !!b?.plan && b.plan !== "free";
}

async function fetchBillingStatus(): Promise<BillingStatus | null> {
  try {
    const token = localStorage.getItem("jobplotter_token");
    const res = await fetch(`${API_URL}/billing/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as BillingStatus;
  } catch {
    return null;
  }
}

const paywallPlans = [
  {
    id: "basic",
    name: "Basic",
    price: "$5",
    tagline: "7-day free trial",
    cta: "Start 7-day free trial",
    highlight: true,
    features: ["3 resumes", "15 AI actions/day", "AI matching & tracker", "Save up to 50 jobs"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    tagline: "Most popular",
    cta: "Get Pro",
    highlight: false,
    features: ["Unlimited resumes", "40 AI actions/day", "Extension autofill", "DOCX export"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29",
    tagline: "Max throughput",
    cta: "Get Premium",
    highlight: false,
    features: ["Everything in Pro", "120 AI actions/day", "Priority AI queue", "Priority support"],
  },
];

function Paywall({ finalizing }: { finalizing: boolean }) {
  const { logout, user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params] = useSearchParams();
  const cancelled = params.get("checkout") === "cancelled";

  const startCheckout = async (plan: string) => {
    setError(null);
    setLoadingPlan(plan);
    try {
      const token = localStorage.getItem("jobplotter_token");
      const res = await fetch(`${API_URL}/billing/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
        return;
      }
      let msg = "Couldn't start checkout. Please try again.";
      try {
        const body = await res.clone().json();
        if (body?.detail) msg = body.detail;
      } catch {
        /* ignore */
      }
      if (res.status === 503) msg = "Billing is briefly unavailable. Please try again in a moment.";
      setError(msg);
    } catch {
      setError("We couldn't reach the billing service. Check your connection and try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (finalizing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-5" />
        <h1 className="text-xl font-bold text-slate-900 mb-1.5">Finalizing your subscription…</h1>
        <p className="text-sm text-slate-500">This only takes a moment — hang tight.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-slate-100 bg-white">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon-black.png" alt="Jobplotter" className="w-7 h-7 object-contain" />
          <span className="font-bold text-slate-900">Jobplotter</span>
        </Link>
        <button
          onClick={logout}
          className="text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Log out
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 py-12 sm:py-16">
        <div className="max-w-3xl w-full text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[11px] uppercase tracking-wide mb-5">
            <Sparkles className="w-3.5 h-3.5" /> Choose a plan to get started
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            {user?.name ? `Welcome, ${user.name.split(" ")[0]}.` : "Welcome to Jobplotter."}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Jobplotter is a paid product — start with a <span className="font-semibold text-slate-700">7-day free trial</span> on
            Basic. Build a resume, run AI matching, and track applications before you're charged. Cancel anytime.
          </p>
          {cancelled && (
            <p className="mt-5 text-[13px] text-slate-500 bg-white border border-slate-200 rounded-lg px-4 py-2.5 inline-block">
              Checkout cancelled — no charge was made.
            </p>
          )}
          {error && (
            <p className="mt-5 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 inline-block">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl">
          {paywallPlans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-white p-6 ${
                plan.highlight ? "border-indigo-600 shadow-xl shadow-indigo-100" : "border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full ${
                    plan.highlight ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {plan.tagline}
                </span>
              </div>
              <div className="mb-4 flex items-baseline gap-0.5">
                <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-[13px] font-medium text-slate-500">/mo</span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-slate-600">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => startCheckout(plan.id)}
                disabled={!!loadingPlan}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {loadingPlan === plan.id && <Loader2 className="w-4 h-4 animate-spin" />}
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <Link to="/pricing" className="mt-8 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          Compare plans in detail →
        </Link>
      </main>
    </div>
  );
}

/**
 * Gates the dashboard behind an active subscription (Jobplotter is paid-only).
 * Unsubscribed users see the Paywall instead of the app. After a successful
 * checkout, Stripe redirects back with `?checkout=success` before the webhook
 * may have written the new plan — so we briefly poll billing status to avoid
 * bouncing a just-paid user back to the paywall.
 */
export function PaywallGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "allowed" | "blocked" | "finalizing">("loading");
  const [params] = useSearchParams();
  const justCheckedOut = params.get("checkout") === "success";
  const cancelled = useRef(false);

  const evaluate = useCallback(async () => {
    const status = await fetchBillingStatus();
    return hasActivePlan(status);
  }, []);

  useEffect(() => {
    cancelled.current = false;

    (async () => {
      if (await evaluate()) {
        if (!cancelled.current) setPhase("allowed");
        return;
      }
      // Not subscribed. If we just returned from checkout, the webhook may lag —
      // poll for a few seconds before falling back to the paywall.
      if (justCheckedOut) {
        if (!cancelled.current) setPhase("finalizing");
        for (let i = 0; i < 8 && !cancelled.current; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          if (cancelled.current) return;
          if (await evaluate()) {
            if (!cancelled.current) setPhase("allowed");
            return;
          }
        }
      }
      if (!cancelled.current) setPhase("blocked");
    })();

    return () => {
      cancelled.current = true;
    };
  }, [evaluate, justCheckedOut]);

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }
  if (phase === "allowed") return <>{children}</>;
  return <Paywall finalizing={phase === "finalizing"} />;
}
