import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'responsible-party', label: 'Responsible Party' },
  { id: 'info-collected', label: 'Information We Collect' },
  { id: 'lawful-basis', label: 'Lawful Basis' },
  { id: 'how-we-use', label: 'How We Use Your Info' },
  { id: 'sharing', label: 'Sharing and Disclosure' },
  { id: 'third-parties', label: 'Third-Party Providers' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'cross-border', label: 'Cross-Border Transfers' },
  { id: 'your-rights', label: 'Your Rights (POPIA)' },
  { id: 'direct-marketing', label: 'Direct Marketing' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'breach', label: 'Breach Notification' },
  { id: 'third-party-links', label: 'Third-Party Links' },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'regulator', label: 'Information Regulator' },
  { id: 'contact', label: 'Contact Us' },
];

const PrivacyPolicy = () => (
  <LegalLayout
    title="Privacy Policy"
    lastUpdated="6 March 2026"
    seo={{ title: 'Privacy Policy', description: 'Learn how EliteTCG collects, uses, and protects your personal information in accordance with POPIA.', path: '/privacy-policy' }}
    sections={sections}
  >
    <section id="introduction">
      <h2 className="text-base font-medium text-gray-900 mb-3">1. Introduction</h2>
      <p>
        Elite TCG (Pty) Ltd ("EliteTCG", "we", "us", or "our") operates the website{' '}
        <strong>www.elitetcg.co.za</strong> (the "Site"). This Privacy Policy explains how we
        collect, use, store, disclose, and safeguard your personal information when you visit,
        register on, or make a purchase from our Site.
      </p>
      <p className="mt-2">
        We are committed to protecting your privacy in accordance with the{' '}
        <strong>Protection of Personal Information Act 4 of 2013 ("POPIA")</strong>, the{' '}
        <strong>Electronic Communications and Transactions Act 25 of 2002 ("ECTA")</strong>,
        and all other applicable South African legislation. By using our Site you acknowledge
        that you have read and understood this Privacy Policy.
      </p>
    </section>

    <section id="responsible-party">
      <h2 className="text-base font-medium text-gray-900 mb-3">2. Responsible Party</h2>
      <p>
        For the purposes of POPIA, EliteTCG is the "responsible party" in relation to the
        personal information we process.
      </p>
      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p><strong>Elite TCG (Pty) Ltd</strong></p>
        <p>Registration No: K2026177931</p>
        <p>Address: [REGISTERED_ADDRESS]</p>
        <p>Information Officer: <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a></p>
      </div>
    </section>

    <section id="info-collected">
      <h2 className="text-base font-medium text-gray-900 mb-3">3. Information We Collect</h2>
      <p className="mb-2">We collect the following categories of personal information:</p>

      <h3 className="font-medium text-gray-900 mt-3 mb-1">3.1 Information You Provide</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Account information:</strong> full name, email address, and encrypted password when you register.</li>
        <li><strong>Profile information:</strong> display name, profile picture, and communication preferences.</li>
        <li><strong>Order and billing information:</strong> shipping address, phone number, billing address, and payment method details necessary to process your transactions.</li>
        <li><strong>Marketplace seller information:</strong> bank account details, government-issued identification documents, and a selfie photograph for identity verification if you register as a seller.</li>
        <li><strong>Communication data:</strong> messages, emails, reviews, and other content you send to us or post on our Site.</li>
        <li><strong>Support requests:</strong> information provided when you contact our customer service team.</li>
      </ul>

      <h3 className="font-medium text-gray-900 mt-3 mb-1">3.2 Information Collected Automatically</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Device information:</strong> IP address, browser type and version, operating system, device type, and screen resolution.</li>
        <li><strong>Usage data:</strong> pages visited, time spent on pages, click patterns, referring URLs, and navigation paths.</li>
        <li><strong>Location data:</strong> approximate geographic location derived from your IP address.</li>
        <li><strong>Cookies and similar technologies:</strong> as described in Section 8 below.</li>
      </ul>

      <h3 className="font-medium text-gray-900 mt-3 mb-1">3.3 Biometric Information (Sellers Only)</h3>
      <p className="mb-1">
        If you apply to become a marketplace seller, we collect biometric information as part of
        our identity verification process. This includes a photograph of your government-issued
        ID and a selfie, which are compared using automated facial recognition technology
        (Google Cloud Vision API) to verify your identity. This processing is done with your
        explicit consent and in compliance with Sections 26–27 of POPIA regarding special
        personal information. Biometric data is used solely for verification purposes and is
        permanently deleted within 24 hours of the verification process being completed or
        declined.
      </p>

      <h3 className="font-medium text-gray-900 mt-3 mb-1">3.4 Information From Third Parties</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Authentication data from third-party sign-in providers (e.g. Google) if you choose to link your account.</li>
        <li>Payment confirmation data from our payment processor (PayFast).</li>
        <li>Shipping and delivery status updates from our logistics partner (The Courier Guy).</li>
      </ul>
    </section>

    <section id="lawful-basis">
      <h2 className="text-base font-medium text-gray-900 mb-3">4. Lawful Basis for Processing</h2>
      <p className="mb-2">Under POPIA, we process your personal information on the following lawful grounds:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Consent:</strong> where you have given explicit consent (e.g. marketing emails, cookies).</li>
        <li><strong>Contractual necessity:</strong> to perform a contract with you (e.g. processing orders, managing your account).</li>
        <li><strong>Legal obligation:</strong> to comply with applicable laws (e.g. tax record-keeping, fraud prevention).</li>
        <li><strong>Legitimate interest:</strong> to improve our services, prevent fraud, and ensure the security of our Site, where such interests are not overridden by your rights.</li>
      </ul>
    </section>

    <section id="how-we-use">
      <h2 className="text-base font-medium text-gray-900 mb-3">5. How We Use Your Information</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>To create, manage, and authenticate your account.</li>
        <li>To process, fulfil, and ship your orders.</li>
        <li>To process payments securely through our payment gateway.</li>
        <li>To communicate with you about orders, deliveries, and account activity.</li>
        <li>To send promotional communications (only with your consent; you may unsubscribe at any time).</li>
        <li>To operate our marketplace and facilitate transactions between buyers and sellers.</li>
        <li>To respond to your enquiries and provide customer support.</li>
        <li>To verify the identity of marketplace seller applicants using automated facial recognition technology (comparing a selfie to an uploaded ID document). This automated processing is performed with your explicit consent and you may request human review of any automated verification decision.</li>
        <li>To detect, prevent, and address fraud, abuse, and security issues.</li>
        <li>To analyse usage patterns and improve our Site, products, and services.</li>
        <li>To comply with legal and regulatory obligations.</li>
        <li>To enforce our <Link to="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</Link>.</li>
      </ul>
    </section>

    <section id="sharing">
      <h2 className="text-base font-medium text-gray-900 mb-3">6. Sharing and Disclosure</h2>
      <p className="mb-2">We do not sell your personal information. We may share it with:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Service providers:</strong> third parties that assist us in operating our business (see Section 7).</li>
        <li><strong>Marketplace sellers:</strong> limited information (name, shipping address) necessary for sellers to fulfil orders.</li>
        <li><strong>Legal authorities:</strong> when required by law, court order, or governmental regulation, or to protect our legal rights.</li>
        <li><strong>Business transfers:</strong> in the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
        <li><strong>With your consent:</strong> in any other situation where you have given us explicit permission.</li>
      </ul>
    </section>

    <section id="third-parties">
      <h2 className="text-base font-medium text-gray-900 mb-3">7. Third-Party Service Providers</h2>
      <p className="mb-2">We use the following third-party services ("operators" under POPIA) that may process your data on our behalf:</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 mt-2">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-3 py-2 font-medium text-gray-900 border-b border-gray-200">Provider</th>
              <th className="text-left px-3 py-2 font-medium text-gray-900 border-b border-gray-200">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr><td className="px-3 py-2">Supabase</td><td className="px-3 py-2">Authentication, database hosting, file storage</td></tr>
            <tr><td className="px-3 py-2">PayFast</td><td className="px-3 py-2">Payment processing (PCI DSS Level 1 compliant)</td></tr>
            <tr><td className="px-3 py-2">The Courier Guy</td><td className="px-3 py-2">Shipping and delivery logistics</td></tr>
            <tr><td className="px-3 py-2">ZeptoMail</td><td className="px-3 py-2">Transactional email delivery</td></tr>
            <tr><td className="px-3 py-2">Vercel</td><td className="px-3 py-2">Website hosting and edge delivery</td></tr>
            <tr><td className="px-3 py-2">Vercel Analytics</td><td className="px-3 py-2">Website analytics, performance monitoring, and speed insights</td></tr>
            <tr><td className="px-3 py-2">Google Cloud Vision</td><td className="px-3 py-2">Seller identity verification (facial matching for ID documents)</td></tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2">
        Each provider is contractually bound to process your data only as instructed by us and
        to maintain appropriate security measures. We encourage you to review their respective
        privacy policies.
      </p>
    </section>

    <section id="cookies">
      <h2 className="text-base font-medium text-gray-900 mb-3">8. Cookies and Tracking Technologies</h2>

      <h3 className="font-medium text-gray-900 mt-3 mb-1">8.1 What Are Cookies</h3>
      <p>
        Cookies are small text files stored on your device when you visit a website. They help
        us recognise your browser, remember preferences, and understand how you use our Site.
      </p>

      <h3 className="font-medium text-gray-900 mt-3 mb-1">8.2 Types of Cookies We Use</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Essential cookies:</strong> required for the Site to function (authentication, cart, security). These cannot be disabled.</li>
        <li><strong>Functional cookies:</strong> remember your preferences such as language and display settings.</li>
        <li><strong>Analytics cookies:</strong> help us understand how visitors interact with our Site (e.g. Vercel Analytics).</li>
        <li><strong>Marketing cookies:</strong> used to deliver relevant advertisements and track campaign effectiveness.</li>
      </ul>

      <h3 className="font-medium text-gray-900 mt-3 mb-1">8.3 Managing Cookies</h3>
      <p>
        When you first visit our Site, you will be presented with a cookie consent banner. No
        non-essential cookies are set until you make a choice. If you decline non-essential
        cookies, only strictly essential cookies will be used and any analytics or marketing
        scripts will not be loaded. You can change your cookie preferences at any time through
        your browser settings. Note that disabling essential cookies may affect Site functionality.
      </p>
    </section>

    <section id="data-security">
      <h2 className="text-base font-medium text-gray-900 mb-3">9. Data Security</h2>
      <p>
        We implement appropriate technical and organisational security measures to protect your
        personal information against unauthorised access, alteration, disclosure, or destruction.
        These measures include:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Encryption of data in transit using TLS/SSL.</li>
        <li>Encryption of sensitive data at rest.</li>
        <li>Secure authentication with hashed passwords (we never store plaintext passwords).</li>
        <li>Payment processing handled exclusively by PayFast (PCI DSS Level 1 compliant) — we never store card numbers, CVVs, or full payment details on our servers.</li>
        <li>Regular security reviews and access controls.</li>
        <li>Role-based access to personal information within our organisation.</li>
      </ul>
      <p className="mt-2">
        While we take all reasonable steps to protect your information, no method of
        transmission over the Internet or electronic storage is 100% secure. We cannot
        guarantee absolute security.
      </p>
    </section>

    <section id="data-retention">
      <h2 className="text-base font-medium text-gray-900 mb-3">10. Data Retention</h2>
      <p>We retain your personal information only for as long as necessary to fulfil the purposes for which it was collected:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>Account data:</strong> retained for the duration of your account and for a reasonable period after deletion to comply with legal obligations.</li>
        <li><strong>Order and transaction records:</strong> retained for a minimum of five (5) years in compliance with the South African Income Tax Act and VAT Act.</li>
        <li><strong>Marketing preferences:</strong> retained until you withdraw consent.</li>
        <li><strong>Analytics data:</strong> retained in anonymised/aggregated form indefinitely.</li>
        <li><strong>Support communications:</strong> retained for up to two (2) years after resolution.</li>
      </ul>
      <p className="mt-2">
        When personal information is no longer required, we will securely delete or anonymise
        it in accordance with POPIA requirements.
      </p>
    </section>

    <section id="cross-border">
      <h2 className="text-base font-medium text-gray-900 mb-3">11. Cross-Border Data Transfers</h2>
      <p>
        Some of our third-party service providers may store or process your data outside of
        South Africa. In such cases, we ensure that:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>The recipient country has adequate data protection laws, or</li>
        <li>The recipient is bound by a binding corporate rule or agreement that provides adequate protection, or</li>
        <li>You have given your consent to the transfer, or</li>
        <li>The transfer is necessary for the performance of a contract between you and us.</li>
      </ul>
      <p className="mt-2">
        These safeguards comply with Section 72 of POPIA regarding transborder information flows.
      </p>
    </section>

    <section id="your-rights">
      <h2 className="text-base font-medium text-gray-900 mb-3">12. Your Rights Under POPIA</h2>
      <p className="mb-2">As a data subject under POPIA, you have the following rights:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Right to access:</strong> request confirmation of whether we hold your personal information and obtain a copy of it.</li>
        <li><strong>Right to correction:</strong> request that inaccurate or incomplete personal information be corrected or updated.</li>
        <li><strong>Right to deletion:</strong> request deletion of your personal information where it is no longer necessary for the purpose it was collected, subject to legal retention requirements.</li>
        <li><strong>Right to object:</strong> object to the processing of your personal information on reasonable grounds.</li>
        <li><strong>Right to restrict processing:</strong> request that we limit the processing of your information in certain circumstances.</li>
        <li><strong>Right to data portability:</strong> receive your personal information in a structured, commonly used, machine-readable format.</li>
        <li><strong>Right to withdraw consent:</strong> withdraw your consent for marketing communications at any time without affecting the lawfulness of processing based on consent before its withdrawal.</li>
        <li><strong>Right not to be subject to automated decision-making:</strong> request human intervention in decisions made solely by automated means that significantly affect you.</li>
        <li><strong>Right to lodge a complaint:</strong> file a complaint with the Information Regulator of South Africa if you believe your rights have been infringed.</li>
      </ul>
      <p className="mt-2">
        To exercise any of these rights, please contact us at{' '}
        <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a>.
        We will respond to your request within thirty (30) days as required by POPIA.
      </p>
    </section>

    <section id="direct-marketing">
      <h2 className="text-base font-medium text-gray-900 mb-3">13. Direct Marketing</h2>
      <p>
        We will only send you marketing communications if you have given us your explicit,
        opt-in consent. You may withdraw your consent at any time by:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Clicking the "unsubscribe" link in any marketing email.</li>
        <li>Updating your communication preferences in your account settings.</li>
        <li>Contacting us at <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a>.</li>
      </ul>
      <p className="mt-2">
        Withdrawal of marketing consent will not affect transactional communications (e.g.
        order confirmations, shipping updates) which are necessary for the performance of our
        contract with you.
      </p>
    </section>

    <section id="children">
      <h2 className="text-base font-medium text-gray-900 mb-3">14. Children's Privacy</h2>
      <p>
        Our Site is not directed at children under the age of 18. We do not knowingly collect
        personal information from children under 18. If you are a parent or guardian and believe
        that your child has provided us with personal information, please contact us immediately
        at <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a>{' '}
        so that we can take appropriate steps to delete such information.
      </p>
      <p className="mt-2">
        In accordance with Section 35 of POPIA, we will not process the personal information of
        a child unless we have obtained prior consent from a competent person (parent or guardian)
        and the processing is in the child's best interest.
      </p>
    </section>

    <section id="breach">
      <h2 className="text-base font-medium text-gray-900 mb-3">15. Security Breach Notification</h2>
      <p>
        In the event of a security breach that compromises your personal information, we will:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Notify the Information Regulator of South Africa as soon as reasonably possible.</li>
        <li>Notify affected data subjects as required under Section 22 of POPIA.</li>
        <li>Take immediate steps to mitigate the breach and prevent further unauthorised access.</li>
        <li>Provide you with sufficient information to take protective measures.</li>
      </ul>
    </section>

    <section id="third-party-links">
      <h2 className="text-base font-medium text-gray-900 mb-3">16. Third-Party Links</h2>
      <p>
        Our Site may contain links to third-party websites, applications, or services that are
        not operated by us. We have no control over and assume no responsibility for the content,
        privacy policies, or practices of any third-party sites. We encourage you to review the
        privacy policy of every site you visit.
      </p>
    </section>

    <section id="changes">
      <h2 className="text-base font-medium text-gray-900 mb-3">17. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices,
        technology, legal requirements, or other factors. When we make material changes, we will:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Post the updated policy on this page with a revised "Last updated" date.</li>
        <li>Notify you via email or a prominent notice on our Site for significant changes.</li>
      </ul>
      <p className="mt-2">
        Your continued use of our Site after any changes constitutes your acceptance of the
        updated Privacy Policy.
      </p>
    </section>

    <section id="regulator">
      <h2 className="text-base font-medium text-gray-900 mb-3">18. Information Regulator</h2>
      <p>
        If you are not satisfied with how we handle your personal information or believe that
        your rights under POPIA have been infringed, you have the right to lodge a complaint
        with the Information Regulator of South Africa:
      </p>
      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p><strong>Information Regulator (South Africa)</strong></p>
        <p>JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001</p>
        <p>P.O. Box 31533, Braamfontein, Johannesburg, 2017</p>
        <p>Email: complaints.IR@justice.gov.za</p>
        <p>Tel: 010 023 5207</p>
      </div>
    </section>

    <section id="contact">
      <h2 className="text-base font-medium text-gray-900 mb-3">19. Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy, wish to exercise your
        data subject rights, or need to report a privacy issue, please contact us:
      </p>
      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p><strong>Elite TCG (Pty) Ltd</strong></p>
        <p>Registration No: K2026177931</p>
        <p>Address: [REGISTERED_ADDRESS]</p>
        <p>Information Officer</p>
        <p>Email: <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a></p>
        <p>Website: <a href="https://www.elitetcg.co.za" className="text-blue-600 hover:underline">www.elitetcg.co.za</a></p>
      </div>
    </section>
  </LegalLayout>
);

export default PrivacyPolicy;
