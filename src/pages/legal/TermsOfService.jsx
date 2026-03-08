import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'definitions', label: 'Definitions' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'accounts', label: 'Account Registration' },
  { id: 'products-orders', label: 'Products and Orders' },
  { id: 'preorders', label: 'Pre-Orders' },
  { id: 'payments', label: 'Payments' },
  { id: 'shipping', label: 'Shipping and Delivery' },
  { id: 'returns', label: 'Returns and Refunds' },
  { id: 'authenticity', label: 'Product Authenticity' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'user-conduct', label: 'User Conduct' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'ugc', label: 'User-Generated Content' },
  { id: 'disclaimers', label: 'Disclaimers' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'indemnification', label: 'Indemnification' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'force-majeure', label: 'Force Majeure' },
  { id: 'severability', label: 'Severability' },
  { id: 'entire-agreement', label: 'Entire Agreement' },
  { id: 'governing-law', label: 'Governing Law' },
  { id: 'amendments', label: 'Amendments' },
  { id: 'contact', label: 'Contact Us' },
];

const TermsOfService = () => (
  <LegalLayout
    title="Terms of Service"
    lastUpdated="6 March 2026"
    seo={{ title: 'Terms of Service', path: '/terms-of-service' }}
    sections={sections}
  >
    <section id="introduction">
      <h2 className="text-base font-medium text-gray-900 mb-3">1. Introduction</h2>
      <p>
        These Terms of Service ("Terms") govern your access to and use of the Elite TCG website
        at <strong>www.elitetcg.co.za</strong> (the "Site"), operated by Elite TCG (Pty) Ltd
        ("we", "us", or "our"), a company registered in the Republic of South Africa. By
        accessing, browsing, or placing an order on the Site, you agree to be bound by these
        Terms, our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>, and
        our <Link to="/refund-policy" className="underline">Refund Policy</Link>. If you do not
        agree, you must stop using the Site immediately.
      </p>
    </section>

    <section id="definitions">
      <h2 className="text-base font-medium text-gray-900 mb-3">2. Definitions</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>"Consumer"</strong> means any person who purchases or intends to purchase goods or services from the Site.</li>
        <li><strong>"Goods"</strong> means any Pokemon Trading Card Game products, accessories, or related merchandise listed on the Site.</li>
        <li><strong>"Order"</strong> means a request by the Consumer to purchase Goods through the Site.</li>
        <li><strong>"CPA"</strong> means the Consumer Protection Act 68 of 2008.</li>
        <li><strong>"ECTA"</strong> means the Electronic Communications and Transactions Act 25 of 2002.</li>
        <li><strong>"POPIA"</strong> means the Protection of Personal Information Act 4 of 2013.</li>
      </ul>
    </section>

    <section id="eligibility">
      <h2 className="text-base font-medium text-gray-900 mb-3">3. Eligibility</h2>
      <p>
        You must be at least 18 years of age to use this Site or place an Order. By using the
        Site, you represent and warrant that you meet this age requirement and have the legal
        capacity to enter into binding agreements. If you are under 18, you may only use the
        Site under the direct supervision of a parent or legal guardian who agrees to be bound
        by these Terms on your behalf.
      </p>
    </section>

    <section id="accounts">
      <h2 className="text-base font-medium text-gray-900 mb-3">4. Account Registration</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</li>
        <li>You agree to provide accurate, current, and complete information when creating an account and to update such information promptly.</li>
        <li>You must notify us immediately of any unauthorised use of your account.</li>
        <li>We reserve the right to suspend, disable, or terminate any account at our sole discretion, including accounts that violate these Terms or are suspected of fraud.</li>
        <li>You may not create multiple accounts for the purpose of abusing promotions or circumventing restrictions.</li>
      </ul>
    </section>

    <section id="products-orders">
      <h2 className="text-base font-medium text-gray-900 mb-3">5. Products and Orders</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>All Goods listed on the Site are subject to availability. We do not guarantee that any product will remain in stock.</li>
        <li>We reserve the right to limit quantities, refuse any Order, or cancel any Order at our sole discretion, including after confirmation. If we cancel a paid Order, you will receive a full refund.</li>
        <li>Prices are listed in South African Rand (ZAR) and are inclusive of VAT at the prevailing rate (currently 15%).</li>
        <li>We make every reasonable effort to display accurate product images, descriptions, and specifications. Minor variations in colour or appearance may occur due to screen differences.</li>
        <li>An Order confirmation email does not constitute acceptance of an Order. Acceptance occurs only when the Goods are dispatched.</li>
        <li>We reserve the right to correct pricing errors. If a product's correct price is higher than the listed price, we will contact you before processing the Order.</li>
      </ul>
    </section>

    <section id="preorders">
      <h2 className="text-base font-medium text-gray-900 mb-3">6. Pre-Orders and Coming Soon Products</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Pre-order items are products not yet released by the manufacturer. Release dates are estimates and may change without notice.</li>
        <li>Payment for pre-orders is taken at the time the Order is placed.</li>
        <li>If a pre-order item is cancelled by the manufacturer or becomes permanently unavailable, you will receive a full refund.</li>
        <li>Pre-order items will be dispatched once they are received from the supplier, which may be after the indicated release date.</li>
        <li>Pre-order items cannot be combined with in-stock items in the same shipment. In-stock items may ship separately.</li>
      </ul>
    </section>

    <section id="payments">
      <h2 className="text-base font-medium text-gray-900 mb-3">7. Payments</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>All payments are processed securely through PayFast, a PCI DSS Level 1 certified payment gateway. We do not store, process, or have access to your full payment card details.</li>
        <li>By placing an Order, you confirm that you are authorised to use the selected payment method and that there are sufficient funds available.</li>
        <li>We accept payment methods supported by PayFast, which may include Visa, Mastercard, instant EFT, and other options. Available payment methods are displayed at checkout.</li>
        <li>All transactions are subject to PayFast's terms and conditions.</li>
        <li>If your payment fails or is reversed after dispatch, we reserve the right to pursue recovery of the Goods and/or the outstanding amount.</li>
      </ul>
    </section>

    <section id="shipping">
      <h2 className="text-base font-medium text-gray-900 mb-3">8. Shipping and Delivery</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Shipping is handled by The Courier Guy and is available within South Africa only. We do not currently ship internationally.</li>
        <li>Delivery times provided at checkout are estimates only. We are not liable for delays caused by the courier, customs, natural disasters, or events beyond our reasonable control.</li>
        <li>In accordance with Section 19 of the CPA, risk of loss or damage to Goods remains with us until the Goods are delivered to you or a person authorised by you to accept delivery. Title to the Goods passes to you upon full payment.</li>
        <li>It is your sole responsibility to provide a correct, complete, and accessible shipping address. We are not liable for non-delivery due to incorrect address details.</li>
        <li>If a delivery fails due to the recipient being unavailable, the courier's redelivery or collection policies will apply, and additional fees may be charged to you.</li>
        <li>You must inspect Goods upon delivery and report any visible damage or discrepancies within 24 hours by emailing admin@elitetcg.co.za with photos.</li>
        <li>Shipping fees are non-refundable unless the return is due to our error or a defective product.</li>
      </ul>
    </section>

    <section id="returns">
      <h2 className="text-base font-medium text-gray-900 mb-3">9. Returns, Refunds, and Exchanges</h2>
      <p className="mb-3">
        Please refer to our full <Link to="/refund-policy" className="underline">Refund Policy</Link> for
        detailed information. A summary is provided below:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Sealed products:</strong> Trading card products that have been opened, tampered with, or had their factory seals broken cannot be returned or refunded under any circumstances, except where the product is defective. This is due to the nature of randomised collectible products.</li>
        <li><strong>Defective goods:</strong> In accordance with Section 56 of the CPA, if Goods are defective, unsafe, or not of a quality reasonably expected, you may return them within 6 months of delivery for a repair, replacement, or refund at your choice.</li>
        <li><strong>Goods not as described:</strong> If Goods received materially differ from their description on the Site, you may return them within 7 days of delivery for a full refund.</li>
        <li><strong>Cooling-off period:</strong> Under Section 44 of the ECTA, you have the right to cancel an Order within 7 days of delivery without reason. You must return the Goods in their original, unopened, and sealed condition at your own cost. Opened or used products are excluded.</li>
        <li><strong>Change of mind:</strong> We do not accept returns for change of mind on opened products. Sealed, unopened items may be returned within 7 days subject to a 15% restocking fee and return shipping at your cost.</li>
        <li>Refunds will be processed to the original payment method within 14 business days of us receiving the returned Goods in acceptable condition.</li>
      </ul>
    </section>

    <section id="authenticity">
      <h2 className="text-base font-medium text-gray-900 mb-3">10. Product Authenticity</h2>
      <p>
        All Pokemon TCG products sold on the Site are guaranteed to be 100% authentic and sourced
        from authorised distributors. We do not sell counterfeit, resealed, or tampered products.
        If you believe you have received a counterfeit product, contact us immediately with
        photographic evidence and we will investigate and resolve the matter.
      </p>
    </section>

    <section id="marketplace">
      <h2 className="text-base font-medium text-gray-900 mb-3">11. Marketplace</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>The marketplace feature allows verified third-party sellers to list and sell Pokemon TCG products through the Site.</li>
        <li>Elite TCG facilitates marketplace transactions by processing payments and providing the platform. While we are not a direct party to transactions between buyers and third-party sellers, as the payment facilitator we have a responsibility to ensure fair resolution of disputes.</li>
        <li>Third-party sellers are solely responsible for the accuracy of their listings, the authenticity and quality of their products, and compliance with all applicable laws.</li>
        <li>We do not warrant, endorse, or guarantee any products sold by third-party sellers.</li>
        <li>We reserve the right to remove any listing or suspend any seller account that violates our policies or applicable law.</li>
        <li>Disputes between buyers and marketplace sellers should first be addressed directly with the seller. If unresolved within 7 days, you may contact us at admin@elitetcg.co.za for mediation assistance. We will acknowledge your request within two (2) business days and aim to resolve the dispute within five (5) business days of receiving all necessary information from both parties.</li>
      </ul>
    </section>

    <section id="user-conduct">
      <h2 className="text-base font-medium text-gray-900 mb-3">12. User Conduct</h2>
      <p className="mb-2">You agree not to:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Use the Site for any unlawful, fraudulent, or malicious purpose.</li>
        <li>Attempt to gain unauthorised access to any part of the Site, its servers, or any connected systems.</li>
        <li>Interfere with, disrupt, or place an unreasonable burden on the Site or its infrastructure.</li>
        <li>Submit false, misleading, or inaccurate information.</li>
        <li>Use automated tools, bots, scrapers, or scripts to access or collect data from the Site.</li>
        <li>List, sell, or distribute counterfeit, stolen, or illegally obtained goods.</li>
        <li>Engage in price manipulation, shill bidding, or other deceptive practices.</li>
        <li>Harass, abuse, or threaten other users, our staff, or third-party sellers.</li>
        <li>Post defamatory, obscene, or harmful content in reviews or community features.</li>
        <li>Use the Site to infringe on the intellectual property rights of any party.</li>
      </ul>
    </section>

    <section id="ip">
      <h2 className="text-base font-medium text-gray-900 mb-3">13. Intellectual Property</h2>
      <p>
        All content on this Site, including but not limited to text, graphics, logos, icons,
        images, audio, video, software, and the compilation thereof, is the property of
        Elite TCG or its content suppliers and is protected by South African and international
        copyright, trademark, and other intellectual property laws. Pokemon, the Pokemon logo,
        and all related character names, images, and trademarks are the property of
        Nintendo, Creatures Inc., and GAME FREAK inc. These marks are used solely to identify
        authentic licensed products sold through this Site and do not imply any affiliation with
        or endorsement by the trademark holders. You may not reproduce, modify, distribute,
        display, transmit, or create derivative works from any content on this Site without our
        prior written consent.
      </p>
    </section>

    <section id="ugc">
      <h2 className="text-base font-medium text-gray-900 mb-3">14. User-Generated Content</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>By submitting reviews, comments, or other content ("User Content"), you grant us a non-exclusive, royalty-free, perpetual, worldwide licence to use, display, reproduce, and distribute such content on the Site and in marketing materials.</li>
        <li>You represent that you own or have the right to submit any User Content and that it does not violate the rights of any third party.</li>
        <li>We reserve the right to remove or edit User Content that violates these Terms or is otherwise objectionable, without notice.</li>
        <li>We are not responsible for User Content posted by other users.</li>
      </ul>
    </section>

    <section id="disclaimers">
      <h2 className="text-base font-medium text-gray-900 mb-3">15. Disclaimer of Warranties</h2>
      <p>
        The Site and all Goods are provided "as is" and "as available" without warranties of any
        kind, whether express or implied, to the fullest extent permitted by South African law.
        We do not warrant that the Site will be uninterrupted, error-free, or free of viruses
        or other harmful components. We do not guarantee the accuracy, completeness, or timeliness
        of any information on the Site. Nothing in these Terms excludes or limits any rights you
        may have under the CPA that cannot lawfully be excluded.
      </p>
    </section>

    <section id="liability">
      <h2 className="text-base font-medium text-gray-900 mb-3">16. Limitation of Liability</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>To the maximum extent permitted by South African law, Elite TCG, its directors, employees, agents, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages (including loss of profit, data, goodwill, or business opportunity) arising out of or in connection with your use of the Site or any Goods purchased.</li>
        <li>Our total aggregate liability for any claims arising from or related to these Terms or your use of the Site shall not exceed the total amount paid by you for the specific Order giving rise to the claim.</li>
        <li>Nothing in these Terms limits liability for death or personal injury caused by negligence, fraud, or any liability that cannot be excluded under South African law.</li>
      </ul>
    </section>

    <section id="indemnification">
      <h2 className="text-base font-medium text-gray-900 mb-3">17. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless Elite TCG, its officers, directors,
        employees, agents, and suppliers from and against any claims, damages, losses, liabilities,
        costs, and expenses (including reasonable legal fees) arising out of or related to your
        breach of these Terms, your use of the Site, any User Content you submit, or your violation
        of any applicable law or the rights of any third party.
      </p>
    </section>

    <section id="privacy">
      <h2 className="text-base font-medium text-gray-900 mb-3">18. Privacy</h2>
      <p>
        Your use of the Site is also governed by our <Link to="/privacy-policy" className="underline">Privacy Policy</Link>,
        which details how we collect, use, and protect your personal information in compliance
        with POPIA. By using the Site, you consent to the collection and processing of your
        personal information as described in the Privacy Policy.
      </p>
    </section>

    <section id="force-majeure">
      <h2 className="text-base font-medium text-gray-900 mb-3">19. Force Majeure</h2>
      <p>
        We shall not be liable for any failure or delay in performing our obligations where such
        failure or delay results from events beyond our reasonable control, including but not
        limited to natural disasters, pandemics, government actions, power failures, internet
        disruptions, strikes, civil unrest, or supplier delays.
      </p>
    </section>

    <section id="severability">
      <h2 className="text-base font-medium text-gray-900 mb-3">20. Severability</h2>
      <p>
        If any provision of these Terms is held to be invalid, illegal, or unenforceable by a
        court of competent jurisdiction, the remaining provisions shall continue in full force
        and effect. The invalid provision shall be modified to the minimum extent necessary to
        make it valid and enforceable while preserving its original intent.
      </p>
    </section>

    <section id="entire-agreement">
      <h2 className="text-base font-medium text-gray-900 mb-3">21. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy and Refund Policy, constitute the entire
        agreement between you and Elite TCG regarding your use of the Site and supersede all
        prior agreements, communications, and understandings, whether written or oral.
      </p>
    </section>

    <section id="governing-law">
      <h2 className="text-base font-medium text-gray-900 mb-3">22. Governing Law and Jurisdiction</h2>
      <p>
        These Terms are governed by and construed in accordance with the laws of the Republic
        of South Africa, including the CPA, ECTA, and POPIA. Any disputes arising from these
        Terms or your use of the Site shall be subject to the exclusive jurisdiction of the
        Magistrate's Court or High Court of South Africa, as appropriate.
      </p>
    </section>

    <section id="amendments">
      <h2 className="text-base font-medium text-gray-900 mb-3">23. Amendments</h2>
      <p>
        We reserve the right to amend these Terms at any time. Material changes will be
        communicated by posting the updated Terms on this page with a revised date. Your
        continued use of the Site after any amendments constitutes your acceptance of the
        updated Terms. We recommend reviewing this page periodically.
      </p>
    </section>

    <section id="contact">
      <h2 className="text-base font-medium text-gray-900 mb-3">24. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us:</p>
      <div className="mt-3 space-y-1">
        <p><strong>Elite TCG (Pty) Ltd</strong></p>
        <p>Registration No: K2026177931</p>
        <p>Address: [REGISTERED_ADDRESS]</p>
        <p>Email: <a href="mailto:admin@elitetcg.co.za" className="underline">admin@elitetcg.co.za</a></p>
        <p>Website: <a href="https://www.elitetcg.co.za" className="underline">www.elitetcg.co.za</a></p>
      </div>
    </section>
  </LegalLayout>
);

export default TermsOfService;
