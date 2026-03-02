import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';

const PrivacyPolicy = () => {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <SEO title="Privacy Policy" description="EliteTCG privacy policy. Learn how we collect, use, and protect your personal information." path="/privacy-policy" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: 2 March 2026</p>

      <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h2>
          <p>
            Elite TCG ("we", "us", or "our") operates the website{' '}
            <strong>www.elitetcg.co.za</strong> (the "Site"). This Privacy Policy explains how we
            collect, use, disclose, and safeguard your personal information when you visit or make a
            purchase from our Site, in accordance with the Protection of Personal Information Act 4
            of 2013 ("POPIA") and the Electronic Communications and Transactions Act 25 of 2002
            ("ECTA") of South Africa.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
          <p className="mb-2">We may collect the following personal information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> name, email address, and password when you register.</li>
            <li><strong>Order information:</strong> shipping address, phone number, and payment details when you make a purchase.</li>
            <li><strong>Marketplace seller information:</strong> bank details and identification documents if you register as a seller.</li>
            <li><strong>Usage data:</strong> pages visited, browser type, IP address, device information, and cookies collected automatically.</li>
            <li><strong>Communication data:</strong> messages you send us via email or support channels.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To process and fulfill your orders, including shipping and payment processing.</li>
            <li>To create and manage your account.</li>
            <li>To communicate with you about orders, updates, and promotions (with your consent).</li>
            <li>To operate our marketplace and facilitate transactions between buyers and sellers.</li>
            <li>To improve our Site, products, and services.</li>
            <li>To comply with legal obligations and enforce our terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
          <p className="mb-2">We use the following third-party services that may process your data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase:</strong> Authentication and database hosting.</li>
            <li><strong>PayFast:</strong> Payment processing for orders and marketplace transactions.</li>
            <li><strong>The Courier Guy:</strong> Shipping and delivery services.</li>
            <li><strong>ZeptoMail:</strong> Transactional email delivery.</li>
            <li><strong>Vercel:</strong> Website hosting and analytics.</li>
          </ul>
          <p className="mt-2">
            Each third-party provider has their own privacy policy governing the use of your
            information. We encourage you to review their policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, analyse
            site traffic, and personalise content. You can control cookie settings through your
            browser preferences. Essential cookies required for site functionality cannot be
            disabled.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal
            information against unauthorised access, alteration, disclosure, or destruction. Payment
            information is processed securely through PayFast and is never stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the
            purposes outlined in this policy, or as required by law. Order records are retained for
            a minimum of five years in compliance with South African tax legislation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Your Rights Under POPIA</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access your personal information held by us.</li>
            <li>Request correction or deletion of your personal information.</li>
            <li>Object to the processing of your personal information.</li>
            <li>Withdraw consent for marketing communications at any time.</li>
            <li>Lodge a complaint with the Information Regulator of South Africa.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
          <p>
            Our Site is not directed at children under the age of 18. We do not knowingly collect
            personal information from children. If you believe a child has provided us with personal
            information, please contact us so we can remove it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated revision date. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to exercise your rights,
            please contact us at:
          </p>
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p><strong>Elite TCG</strong></p>
            <p>Email: <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a></p>
            <p>Website: <a href="https://www.elitetcg.co.za" className="text-blue-600 hover:underline">www.elitetcg.co.za</a></p>
          </div>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200">
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
