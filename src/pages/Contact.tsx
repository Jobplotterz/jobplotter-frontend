import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, LifeBuoy, Linkedin, Twitter, Instagram, Facebook, Send } from "lucide-react";
import { MarketingShell, PageHero } from "../components/MarketingShell";

const SUPPORT_EMAIL = "support@jobplotter.com";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jobplotterapp/", icon: <Linkedin className="w-4 h-4" /> },
  { label: "Twitter / X", href: "https://x.com/jobplotterapp", icon: <Twitter className="w-4 h-4" /> },
  { label: "Instagram", href: "https://www.instagram.com/jobplotter/", icon: <Instagram className="w-4 h-4" /> },
  { label: "Facebook", href: "https://www.facebook.com/jobplotterapp", icon: <Facebook className="w-4 h-4" /> }
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General question");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[${topic}] Message from ${name || "Jobplotter user"}`);
    const body = encodeURIComponent(`${message}\n\n—\nFrom: ${name}\nReply to: ${email}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-colors";

  return (
    <MarketingShell>
      <PageHero
        badge="Contact"
        title={
          <>
            We'd love to <span className="text-indigo-600">hear from you.</span>
          </>
        }
        subtitle="Questions, feedback, partnership ideas, or just stuck on something — send us a note and we'll get back to you."
      />

      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 p-6 sm:p-10 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="contact-topic" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Topic
              </label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={inputClass}
              >
                <option>General question</option>
                <option>Account & billing</option>
                <option>Bug report</option>
                <option>Feature request</option>
                <option>Partnerships & press</option>
              </select>
            </div>

            <div className="mb-7">
              <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind…"
                className={`${inputClass} resize-y`}
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
            <p className="text-xs text-slate-400 mt-4">
              This opens your email app with the message pre-filled, addressed to {SUPPORT_EMAIL}.
            </p>
          </form>

          {/* Other channels */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl border border-slate-100 bg-slate-50">
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5">Email us directly</h3>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-indigo-600 font-semibold hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl border border-slate-100 bg-slate-50">
              <div className="w-11 h-11 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5">Looking for quick answers?</h3>
              <p className="text-sm text-slate-500 mb-3">
                Most common questions are covered in our Help Center.
              </p>
              <Link to="/help" className="text-sm text-indigo-600 font-semibold hover:underline">
                Visit the Help Center →
              </Link>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl border border-slate-100 bg-slate-50">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-3">Follow along</h3>
              <div className="flex flex-col gap-2.5">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      {social.icon}
                    </span>
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
