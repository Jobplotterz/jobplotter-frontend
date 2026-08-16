import { Link } from "react-router-dom";
import { Compass, Cpu, HeartHandshake, ShieldCheck, ArrowRight } from "lucide-react";
import { MarketingShell, PageHero } from "../components/MarketingShell";

const values = [
  {
    title: "Signal over noise",
    description:
      "The job market is drowning in duplicate listings and keyword spam. We obsess over surfacing the roles that actually fit you, so every minute you spend searching counts.",
    icon: <Compass className="w-6 h-6" />,
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    title: "AI that works for you",
    description:
      "Our matching engine and resume tools exist to amplify your story, not replace it. You stay in control of every word that goes out with your name on it.",
    icon: <Cpu className="w-6 h-6" />,
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Candidates first",
    description:
      "We build for job seekers, not recruiters. Every feature is judged by one question: does this help someone land a role they'll love, faster?",
    icon: <HeartHandshake className="w-6 h-6" />,
    color: "bg-green-50 text-green-600"
  },
  {
    title: "Your data, respected",
    description:
      "Your resume and search history are yours. We use them to power your matches — never to sell you out. See our Privacy Policy for the details.",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "bg-purple-50 text-purple-600"
  }
];

export default function About() {
  return (
    <MarketingShell>
      <PageHero
        badge="About Jobplotter"
        title={
          <>
            We're plotting a smarter path <br className="hidden sm:block" />
            <span className="text-indigo-600">through the job market.</span>
          </>
        }
        subtitle="Jobplotter is an end-to-end career engine: AI-powered job matching, ATS-ready resumes, and application tracking in one place."
      />

      {/* Story */}
      <section className="py-16 sm:py-24 max-w-3xl mx-auto px-5 sm:px-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6">Why we built this</h2>
        <div className="space-y-5 text-slate-600 leading-relaxed">
          <p>
            Job searching is broken in a very specific way: the tools are built for volume, not for fit. You paste the
            same resume into dozens of portals, get filtered out by ATS software before a human ever reads it, and hear
            nothing back. It's demoralizing — and it wastes the most valuable thing you have during a search: momentum.
          </p>
          <p>
            Jobplotter started as a simple idea — what if one tool actually read your experience, scored roles by real
            fit instead of keyword overlap, and helped you ship a tailored, ATS-ready application in minutes instead of
            hours?
          </p>
          <p>
            Today that idea is a full platform: an AI matching engine that scores every job against your real
            experience, an AI resume builder and reviewer, and a tracker that keeps your whole pipeline in view. One
            clean workflow, from "interested" to "offer".
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-10 text-center">What we stand for</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-7 sm:p-8 rounded-3xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${value.color} rounded-2xl flex items-center justify-center mb-5`}>
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-5">Come plot your next move with us.</h2>
          <p className="text-slate-500 mb-9 text-base sm:text-lg">
            Start free, explore your matches, and see the difference a focused search makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:border-slate-300 transition-all hover:bg-slate-50"
            >
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
