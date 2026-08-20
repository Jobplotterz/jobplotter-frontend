import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Rocket, FileText, Search, CreditCard } from "lucide-react";
import { MarketingShell, PageHero } from "../components/MarketingShell";

const faqSections = [
  {
    title: "Getting Started",
    icon: <Rocket className="w-5 h-5" />,
    color: "bg-indigo-50 text-indigo-600",
    faqs: [
      {
        q: "What is Jobplotter?",
        a: "Jobplotter is an all-in-one career platform: an AI matching engine that scores jobs against your profile, an ATS-ready resume builder and reviewer, and an application tracker that keeps your whole search organized in one place."
      },
      {
        q: "How do I get started?",
        a: "Create an account and start your 7-day free trial on the Basic plan, then either upload an existing resume or build one from scratch in the Resume Builder. Once your profile has a resume, the Jobs page scores openings against your experience so you can prioritize the best-fit matches."
      },
      {
        q: "How much does Jobplotter cost?",
        a: "Every plan starts with a 7-day free trial on Basic ($5/mo), which includes resume building, AI review and matching, application tracking, and DOCX export. Pro ($12/mo) adds unlimited resumes, more daily AI actions, extension autofill, and PDF export; Premium ($29/mo) raises the daily AI limit further. See the Pricing page for a full comparison."
      }
    ]
  },
  {
    title: "Resumes & AI Tools",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-600",
    faqs: [
      {
        q: "What makes a resume 'ATS-ready'?",
        a: "Applicant Tracking Systems parse your resume before a human sees it. Our templates use clean layouts, standard section headings, and machine-readable formatting so your content survives parsing intact — and our AI review flags anything likely to trip a filter."
      },
      {
        q: "What are AI resume actions?",
        a: "Any time the AI works on your resume — a review, an optimization pass, tailoring it for a specific job, or a Co-Builder generation — that counts as one action. Each plan includes a daily allowance."
      },
      {
        q: "Can I export my resume as a PDF?",
        a: "PDF export is available on the Pro and Premium plans. Every plan, including Basic, can export a DOCX."
      },
      {
        q: "What is the AI Co-Builder?",
        a: "Describe your experience in plain language and the Co-Builder drafts a structured, professional resume from it — which you can then edit, restyle, and tailor for specific roles."
      }
    ]
  },
  {
    title: "Jobs & Matching",
    icon: <Search className="w-5 h-5" />,
    color: "bg-green-50 text-green-600",
    faqs: [
      {
        q: "How does job matching work?",
        a: "We shortlist roles that are relevant to your resume, then our AI reads each one against your actual experience and scores the fit — explaining the strengths and gaps behind the score. Because it reads for meaning rather than counting keywords, a 'Frontend Architect' role can match a 'React Specialist' resume even without identical wording."
      },
      {
        q: "What does the match score mean?",
        a: "The score estimates how well your profile aligns with the role's requirements. It's a prioritization signal, not a verdict — a lower-scored job you're excited about is still worth applying to."
      },
      {
        q: "How do I track my applications?",
        a: "When you hit 'Apply' on a job, it's added to your Applications tracker automatically. You can update each application's stage — from applied through interviewing to offer — and keep your whole pipeline in view."
      }
    ]
  },
  {
    title: "Account & Billing",
    icon: <CreditCard className="w-5 h-5" />,
    color: "bg-purple-50 text-purple-600",
    faqs: [
      {
        q: "How do I upgrade, downgrade, or cancel?",
        a: "You can change your plan any time from Settings inside your dashboard. Cancelling stops future billing; you keep paid features until the end of the current billing period."
      },
      {
        q: "How do I reset my password?",
        a: "Use the 'Forgot password' link on the login page and we'll email you a secure reset link. If you signed up with Google, just continue with Google — there's no separate password."
      },
      {
        q: "How is my data handled?",
        a: "Your resume and activity are used to power your own matches and tools — never sold. The full details are in our Privacy Policy."
      }
    ]
  }
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-900 text-sm sm:text-[15px]">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-5 text-sm text-slate-500 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function Help() {
  return (
    <MarketingShell>
      <PageHero
        badge="Help Center"
        title={
          <>
            How can we <span className="text-indigo-600">help?</span>
          </>
        }
        subtitle="Answers to the most common questions about matching, resumes, AI tools, and your account."
      />

      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-5 sm:px-8">
        <div className="space-y-12">
          {faqSections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 ${section.color} rounded-xl flex items-center justify-center`}>
                  {section.icon}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.faqs.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still stuck */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-slate-900 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Still need a hand?</h3>
          <p className="text-slate-400 text-sm sm:text-base mb-7 max-w-md mx-auto">
            Can't find what you're looking for? Send us a message and a real human will get back to you.
          </p>
          <Link
            to="/contact"
            className="inline-flex px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
