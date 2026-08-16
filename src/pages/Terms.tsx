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

export default function Terms() {
  return (
    <MarketingShell>
      <PageHero
        badge="Legal"
        title={
          <>
            Terms of <span className="text-indigo-600">Service</span>
          </>
        }
        subtitle={`Last updated: ${LAST_UPDATED}`}
      />

      <div className="py-16 sm:py-20 max-w-3xl mx-auto px-5 sm:px-8">
        <Section title="1. Agreement">
          <p>
            These Terms of Service govern your use of Jobplotter — the website, applications, browser extension, and
            related services (together, the "Service"). By creating an account or using the Service, you agree to these
            terms and to our{" "}
            <Link to="/privacy" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</Link>. If you
            don't agree, please don't use the Service.
          </p>
        </Section>

        <Section title="2. Your account">
          <p>
            You must provide accurate information when creating an account and keep your credentials secure. You're
            responsible for activity that happens under your account. You must be at least 16 years old to use the
            Service.
          </p>
        </Section>

        <Section title="3. Plans, billing, and cancellation">
          <p>
            Jobplotter offers a free plan and paid subscriptions with additional features and higher AI usage
            allowances, as described on our{" "}
            <Link to="/pricing" className="text-indigo-600 font-semibold hover:underline">Pricing page</Link>.
            Subscriptions renew automatically each billing period until cancelled. You can cancel at any time from your
            settings; you'll keep paid features until the end of the current period. Prices and plan limits may change
            with reasonable advance notice.
          </p>
        </Section>

        <Section title="4. Your content">
          <p>
            You own the resumes, profile information, and other content you create or upload ("Your Content"). You
            grant us a limited license to store, process, and display Your Content solely to operate the Service —
            including processing it with AI providers to deliver features you invoke, such as resume review or job
            matching. You're responsible for ensuring Your Content is accurate and that you have the right to share it.
          </p>
        </Section>

        <Section title="5. AI features">
          <p>
            The Service uses artificial intelligence to generate match scores, resume suggestions, and drafted content.
            AI output can be inaccurate or incomplete. It is provided as assistance, not professional advice — always
            review AI-generated material before relying on it or submitting it to an employer. You are responsible for
            the final content of anything you send with your name on it.
          </p>
        </Section>

        <Section title="6. Job listings">
          <p>
            Job listings are aggregated from third-party sources. We work to keep them fresh and accurate but don't
            guarantee that any listing is current, complete, or that applying will lead to any outcome. Applications
            submitted on third-party sites are governed by those sites' terms.
          </p>
        </Section>

        <Section title="7. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use the Service to create misleading or fraudulent application materials</li>
            <li>Scrape, harvest, or bulk-download listings or other users' data</li>
            <li>Reverse engineer, disrupt, or overload the Service, or circumvent usage limits</li>
            <li>Upload malicious code or content that infringes others' rights</li>
            <li>Resell or provide access to the Service to third parties without our permission</li>
          </ul>
        </Section>

        <Section title="8. Intellectual property">
          <p>
            The Service — including its software, design, matching engine, and branding — is owned by Jobplotter and
            protected by intellectual-property laws. These terms don't grant you any rights to our brand or technology
            beyond using the Service as intended.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            You may stop using the Service or delete your account at any time. We may suspend or terminate accounts
            that violate these terms or put the Service or its users at risk. Sections that by their nature should
            survive termination (such as ownership, disclaimers, and limitations of liability) survive.
          </p>
        </Section>

        <Section title="10. Disclaimers and limitation of liability">
          <p>
            The Service is provided "as is" and "as available", without warranties of any kind, express or implied. To
            the maximum extent permitted by law, Jobplotter will not be liable for indirect, incidental, special, or
            consequential damages, or for lost opportunities, arising from your use of the Service. Our total liability
            for any claim is limited to the amount you paid us in the twelve months before the claim arose.
          </p>
        </Section>

        <Section title="11. Changes to these terms">
          <p>
            We may update these terms as the Service evolves. Material changes will be announced in the app or by
            email before they take effect. Continuing to use the Service after changes take effect means you accept the
            updated terms.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about these terms? Reach us through the{" "}
            <Link to="/contact" className="text-indigo-600 font-semibold hover:underline">contact page</Link>.
          </p>
        </Section>
      </div>
    </MarketingShell>
  );
}
