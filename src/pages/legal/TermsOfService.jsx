import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';

const TermsOfService = () => {
  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <SEO title="Terms of Service" description="EliteTCG terms of service. Read our terms and conditions for using the EliteTCG website and services." path="/terms-of-service" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: 2 March 2026</p>

      <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h2>
          <p>
            These Terms of Service ("Terms") govern your access to and use of the Elite TCG website
            at <strong>www.elitetcg.co.za</strong> (the "Site"), operated by Elite TCG ("we", "us",
            or "our"). By accessing or using the Site, you agree to be bound by these Terms. If you
            do not agree, please do not use the Site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Eligibility</h2>
          <p>
            You must be at least 18 years of age to use this Site or make purchases. By using the
            Site, you represent and warrant that you meet this age requirement. If you are under 18,
            you may only use the Site under the supervision of a parent or legal guardian.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Account Registration</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to provide accurate and complete information when creating an account.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Products and Orders</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All products listed on the Site are subject to availability.</li>
            <li>We reserve the right to limit quantities, refuse orders, or cancel orders at our discretion.</li>
            <li>Prices are listed in South African Rand (ZAR) and include VAT where applicable.</li>
            <li>We make every effort to display accurate product images and descriptions, but minor variations may occur.</li>
            <li>Pre-order items are subject to release date changes by manufacturers.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Payments</h2>
          <p>
            All payments are processed securely through PayFast. We do not store your payment card
            details on our servers. By placing an order, you confirm that you are authorised to use
            the payment method provided. All transactions are subject to PayFast's terms and
            conditions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Shipping and Delivery</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Shipping is handled by The Courier Guy and is available within South Africa.</li>
            <li>Delivery times are estimates and may vary based on location and courier availability.</li>
            <li>Risk of loss and title for items pass to you upon delivery to the courier.</li>
            <li>It is your responsibility to provide a correct and complete shipping address.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Returns and Refunds</h2>
          <p>
            In accordance with the Consumer Protection Act 68 of 2008, you may return goods within
            7 days of delivery if they are defective, not as described, or if you were not given the
            opportunity to inspect them before purchase. Sealed trading card products that have been
            opened cannot be returned unless defective. Refunds will be processed to the original
            payment method within 14 business days of receiving the returned item.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Marketplace</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>The marketplace allows verified sellers to list and sell Pokémon TCG products.</li>
            <li>Elite TCG acts as a platform facilitator and is not a party to transactions between buyers and sellers.</li>
            <li>Sellers are responsible for the accuracy of their listings and the quality of their products.</li>
            <li>We reserve the right to remove listings or suspend seller accounts that violate our policies.</li>
            <li>Marketplace disputes should first be raised with the seller. If unresolved, contact us for mediation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
          <p>
            All content on this Site, including text, graphics, logos, and software, is the property
            of Elite TCG or its licensors and is protected by South African and international
            intellectual property laws. Pokémon, the Pokémon logo, and all related names and images
            are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc. You may not reproduce,
            distribute, or create derivative works from any content on this Site without our prior
            written consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Prohibited Conduct</h2>
          <p className="mb-2">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the Site for any unlawful purpose.</li>
            <li>Attempt to gain unauthorised access to any part of the Site or its systems.</li>
            <li>Interfere with or disrupt the Site's functionality.</li>
            <li>Submit false or misleading information.</li>
            <li>Use automated tools to scrape or collect data from the Site.</li>
            <li>List counterfeit or stolen goods on the marketplace.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by South African law, Elite TCG shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages arising out of
            your use of the Site or any products purchased through the Site. Our total liability
            shall not exceed the amount paid by you for the specific product or service giving rise
            to the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of South Africa. Any disputes
            arising from these Terms or your use of the Site shall be subject to the exclusive
            jurisdiction of the courts of South Africa.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Changes to These Terms</h2>
          <p>
            We reserve the right to update these Terms at any time. Changes will be posted on this
            page with an updated revision date. Continued use of the Site after changes are posted
            constitutes your acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
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

export default TermsOfService;
