import { Link } from "react-router-dom";
import { MarketingShell, PageHero } from "../components/MarketingShell";

const LAST_UPDATED = "August 14, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-extrabold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3 text-[15px] text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <MarketingShell>
      <PageHero
        badge="Legal"
        title={
          <>
            Privacy <span className="text-indigo-600">Policy</span>
          </>
        }
        subtitle={`Last updated: ${LAST_UPDATED}`}
      />

      <div className="py-16 sm:py-20 max-w-3xl mx-auto px-5 sm:px-8">
        <Section title="Overview">
          <p>
            Jobplotter ("we", "us") provides an AI-powered career platform: job matching, resume building and review,
            and application tracking. This policy explains what information we collect, how we use it, and the choices
            you have. The short version: your data powers <em>your</em> experience — we don't sell it.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>
            <strong className="text-slate-900">Account information.</strong> Your name, email address, and password (stored
            hashed), or your Google account identifier if you sign in with Google.
          </p>
          <p>
            <strong className="text-slate-900">Profile and resume content.</strong> Resumes you upload or build, and the
            work history, skills, and education they contain. This is the core data used to match you with jobs and
            power the AI resume tools.
          </p>
          <p>
            <strong className="text-slate-900">Usage information.</strong> Jobs you view, save, and apply to, application
            stages you track, and how you interact with features — used to improve your matches and the product.
          </p>
          <p>
            <strong className="text-slate-900">Payment information.</strong> If you subscribe to a paid plan, payment is
            handled by our payment processor. We never store your full card details on our servers.
          </p>
        </Section>

        <Section title="How we use your information">
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Match you with relevant job opportunities and calculate match scores</li>
            <li>Provide AI features such as resume review, optimization, tailoring, and the Co-Builder</li>
            <li>Operate your account, subscriptions, and application tracker</li>
            <li>Send service communications (verification, password resets, billing notices)</li>
            <li>Improve the reliability, safety, and quality of the platform</li>
          </ul>
          <p>
            When you use AI features, the relevant resume or job content is processed by our AI service providers to
            generate the result you requested. We do not sell your personal information, and we do not share your
            resume with employers or recruiters unless you explicitly submit it yourself.
          </p>
        </Section>

        <Section title="Cookies and similar technologies">
          <p>
            We use cookies and local storage to keep you signed in, remember preferences, and understand aggregate
            product usage. You can control cookies through your browser settings; disabling essential cookies may
            prevent parts of the service from working.
          </p>
        </Section>

        <Section title="How we share information">
          <p>We share information only with:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-slate-900">Service providers</strong> that help us operate (hosting, AI processing,
              payments, email delivery), bound to use it only on our behalf
            </li>
            <li>
              <strong className="text-slate-900">Legal authorities</strong> when required by law or to protect the rights
              and safety of our users and platform
            </li>
            <li>
              <strong className="text-slate-900">A successor entity</strong> in the event of a merger or acquisition, with
              notice to you
            </li>
          </ul>
        </Section>

        <Section title="Data security and retention">
          <p>
            We use industry-standard safeguards — encryption in transit, hashed credentials, and access controls — to
            protect your data. We retain your information while your account is active; if you delete your account, we
            delete or anonymize your personal data except where retention is required by law.
          </p>
        </Section>

        <Section title="Your rights and choices">
          <p>
            You can access and update your profile and resumes at any time from your dashboard. Depending on where you
            live, you may also have rights to request a copy of your data, correct it, delete it, or restrict its
            processing. To exercise any of these, <Link to="/contact" className="text-indigo-600 font-semibold hover:underline">contact us</Link> and
            we'll respond as required by applicable law.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Jobplotter is not directed to children under 16, and we do not knowingly collect personal information from
            them. If you believe a child has provided us information, contact us and we will delete it.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy as the product evolves. Material changes will be announced in the app or by
            email, and the "Last updated" date above always reflects the current version.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about privacy? Reach us through the{" "}
            <Link to="/contact" className="text-indigo-600 font-semibold hover:underline">contact page</Link>.
          </p>
        </Section>
      </div>
    </MarketingShell>
  );
}
