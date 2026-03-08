import LegalLayout from './LegalLayout';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'cooling-off', label: 'Cooling-Off Period' },
  { id: 'defective', label: 'Defective Goods' },
  { id: 'sealed-products', label: 'Sealed Products' },
  { id: 'singles', label: 'Singles and Accessories' },
  { id: 'preorders', label: 'Pre-Orders' },
  { id: 'change-of-mind', label: 'Change of Mind' },
  { id: 'damaged', label: 'Damaged Orders' },
  { id: 'how-to-request', label: 'How to Request a Return' },
  { id: 'refund-methods', label: 'Refund Methods' },
  { id: 'exchanges', label: 'Exchanges' },
  { id: 'marketplace', label: 'Marketplace Purchases' },
  { id: 'cancellations', label: 'Order Cancellations' },
  { id: 'non-returnable', label: 'Non-Returnable Items' },
  { id: 'disputes', label: 'Dispute Resolution' },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact Us' },
];

const RefundPolicy = () => (
  <LegalLayout
    title="Refund &amp; Return Policy"
    lastUpdated="6 March 2026"
    seo={{ title: 'Refund Policy', description: 'EliteTCG refund, return, and exchange policy for Pokemon TCG products.', path: '/refund-policy' }}
    sections={sections}
  >
    <section id="overview">
      <h2 className="text-base font-medium text-gray-900 mb-3">1. Overview</h2>
      <p>
        This Refund &amp; Return Policy applies to all purchases made through{' '}
        <strong>www.elitetcg.co.za</strong> (the "Site"), operated by Elite TCG (Pty) Ltd
        ("EliteTCG", "we", "us", or "our"). This policy is governed by the{' '}
        <strong>Consumer Protection Act 68 of 2008 ("CPA")</strong> and the{' '}
        <strong>Electronic Communications and Transactions Act 25 of 2002 ("ECTA")</strong>{' '}
        of South Africa.
      </p>
      <p className="mt-2">
        By placing an order on our Site, you agree to the terms of this policy. Please read it
        carefully before making a purchase.
      </p>
    </section>

    <section id="cooling-off">
      <h2 className="text-base font-medium text-gray-900 mb-3">2. Cooling-Off Period (ECTA Section 44)</h2>
      <p>
        In accordance with Section 44 of ECTA, you have the right to cancel an order made
        through our Site within <strong>seven (7) calendar days</strong> from the date of
        delivery, without reason or penalty. To exercise this right:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>The product must be <strong>unused, unopened, and in its original sealed packaging</strong>.</li>
        <li>You must notify us in writing (email) within the 7-day period.</li>
        <li>You are responsible for the cost of returning the product to us in its original condition.</li>
        <li>A full refund will be issued within fourteen (14) business days of receiving the returned product.</li>
      </ul>
      <p className="mt-2 font-medium text-gray-900">
        Important: This cooling-off right does NOT apply to sealed trading card game (TCG)
        products that have been opened. See Section 4 below.
      </p>
    </section>

    <section id="defective">
      <h2 className="text-base font-medium text-gray-900 mb-3">3. Defective Goods (CPA Section 56)</h2>
      <p>
        Under Section 56 of the CPA, you are entitled to return goods that are defective,
        unsafe, or not of good quality within <strong>six (6) months</strong> from the date
        of delivery. In such cases, you may choose:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>A full refund of the purchase price.</li>
        <li>A replacement of the defective product (subject to availability).</li>
        <li>Repair of the product at no cost to you.</li>
      </ul>
      <p className="mt-2">
        This right applies to manufacturing defects, packaging damage, and goods that are
        materially different from what was described or depicted on our Site. We will cover the
        cost of return shipping for confirmed defective items.
      </p>
    </section>

    <section id="sealed-products">
      <h2 className="text-base font-medium text-gray-900 mb-3">4. Sealed Trading Card Products — No Returns Once Opened</h2>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
        <p className="font-medium text-amber-900">
          Due to the nature of trading card game products, we CANNOT accept returns or issue
          refunds for any sealed product that has been opened, tampered with, or had its
          factory seal broken.
        </p>
      </div>
      <p>This includes but is not limited to:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Booster boxes (once the shrink wrap or seal is broken)</li>
        <li>Elite Trainer Boxes (ETBs)</li>
        <li>Booster packs (individual or from multi-packs)</li>
        <li>Collection boxes, tins, and bundles</li>
        <li>Blister packs and promo packs</li>
        <li>Any sealed product where the factory seal has been removed or compromised</li>
      </ul>
      <p className="mt-2">
        This restriction exists because the contents of sealed TCG products are randomised.
        Once a seal is broken, it is impossible to verify that the contents have not been
        altered. This policy is standard across the trading card industry and is necessary
        to maintain product integrity for all customers.
      </p>
      <p className="mt-2">
        <strong>Sealed and unopened products</strong> may still be returned within the 7-day
        cooling-off period (Section 2) or if found to be defective (Section 3).
      </p>
    </section>

    <section id="singles">
      <h2 className="text-base font-medium text-gray-900 mb-3">5. Singles and Accessories</h2>
      <p>
        Individual trading cards (singles) and accessories may be returned within the 7-day
        cooling-off period provided they are:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>In the same condition as received (undamaged, unplayed).</li>
        <li>In their original protective packaging or sleeve.</li>
        <li>Accompanied by proof of purchase (order confirmation email or order number).</li>
      </ul>
      <p className="mt-2">
        Singles that arrive damaged or are materially different from the listing description
        (e.g. wrong card, wrong condition grade) qualify for a full refund or replacement
        under Section 3 above.
      </p>
    </section>

    <section id="preorders">
      <h2 className="text-base font-medium text-gray-900 mb-3">6. Pre-Orders / Coming Soon Products</h2>
      <p>
        Pre-orders and "Coming Soon" products may be cancelled for a full refund at any time
        before the product has shipped. Once a pre-order has been dispatched, the standard
        return policy applies.
      </p>
      <p className="mt-2">
        Release dates for pre-order products are estimates and may change. If a release date
        is significantly delayed, we will notify you and offer the option to cancel for a
        full refund.
      </p>
    </section>

    <section id="change-of-mind">
      <h2 className="text-base font-medium text-gray-900 mb-3">7. Change of Mind</h2>
      <p>
        Outside of the 7-day ECTA cooling-off period, we are <strong>not obligated</strong>{' '}
        to accept returns or issue refunds for change of mind. The CPA does not provide a
        general right of return for change of mind.
      </p>
      <p className="mt-2">
        We may, at our sole discretion, offer store credit for change-of-mind returns on a
        case-by-case basis, provided the product is unopened and in its original condition.
        This is not guaranteed and is subject to a 15% restocking fee.
      </p>
    </section>

    <section id="damaged">
      <h2 className="text-base font-medium text-gray-900 mb-3">8. Damaged or Incorrect Orders</h2>
      <p>
        If your order arrives damaged during shipping or contains incorrect items, please
        contact us within <strong>48 hours</strong> of delivery with:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Your order number.</li>
        <li>Clear photographs of the damage or incorrect items.</li>
        <li>Photographs of the shipping packaging (inner and outer).</li>
        <li>A description of the issue.</li>
      </ul>
      <p className="mt-2">
        We will arrange for a replacement or full refund at no additional cost to you. We
        may require the damaged items to be returned (at our expense) or may waive the
        return depending on the circumstances. This 48-hour requirement applies to visible
        shipping damage only and does not limit your rights under Section 56 of the CPA
        regarding defective goods, which may be returned within six (6) months of delivery.
      </p>
    </section>

    <section id="how-to-request">
      <h2 className="text-base font-medium text-gray-900 mb-3">9. How to Request a Return or Refund</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <strong>Contact us</strong> at{' '}
          <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a>{' '}
          with your order number and reason for the return.
        </li>
        <li>
          <strong>Wait for approval.</strong> We will review your request and respond within
          two (2) business days with return instructions if applicable.
        </li>
        <li>
          <strong>Ship the item.</strong> Package the product securely in its original
          packaging and ship it to the address we provide. You are responsible for return
          shipping costs unless the item is defective or was sent in error.
        </li>
        <li>
          <strong>Inspection.</strong> Once we receive the returned item, we will inspect it
          within three (3) business days.
        </li>
        <li>
          <strong>Refund processing.</strong> Approved refunds will be processed to your
          original payment method within fourteen (14) business days. Please allow additional
          time for your bank or payment provider to reflect the refund.
        </li>
      </ol>
    </section>

    <section id="refund-methods">
      <h2 className="text-base font-medium text-gray-900 mb-3">10. Refund Methods</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Refunds will be issued to the original payment method used at checkout.</li>
        <li>If the original payment method is no longer available, we will work with you to find an alternative (e.g. bank transfer, store credit).</li>
        <li>Shipping costs are non-refundable unless the return is due to our error or a defective product.</li>
        <li>Any promotional discounts or vouchers used on the original order will be deducted from the refund amount proportionally.</li>
      </ul>
    </section>

    <section id="exchanges">
      <h2 className="text-base font-medium text-gray-900 mb-3">11. Exchanges</h2>
      <p>
        We do not offer direct exchanges. If you wish to exchange a product, please follow
        the return process for a refund and place a new order for the desired item. This
        ensures the fastest processing time.
      </p>
    </section>

    <section id="marketplace">
      <h2 className="text-base font-medium text-gray-900 mb-3">12. Marketplace Purchases</h2>
      <p>
        Products purchased from third-party sellers on our marketplace are subject to the
        individual seller's return policy, which must comply with the CPA and ECTA at a
        minimum. As the platform facilitating payment, EliteTCG has a responsibility to
        ensure that marketplace transactions are resolved fairly.
      </p>
      <p className="mt-2">
        If a marketplace seller fails to resolve a valid return or refund request within
        seven (7) days of being notified, you may escalate the matter to EliteTCG. We will
        review the dispute within five (5) business days and, where warranted, may process
        a refund from the seller's held funds on your behalf. Your statutory rights under
        the CPA are not affected by the seller's individual return policy.
      </p>
    </section>

    <section id="cancellations">
      <h2 className="text-base font-medium text-gray-900 mb-3">13. Order Cancellations</h2>
      <p>
        You may cancel an order free of charge at any time <strong>before it has been
        dispatched</strong>. To cancel, contact us as soon as possible at{' '}
        <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a>{' '}
        with your order number.
      </p>
      <p className="mt-2">
        Once an order has been dispatched, it cannot be cancelled and the standard return
        policy will apply upon delivery.
      </p>
    </section>

    <section id="non-returnable">
      <h2 className="text-base font-medium text-gray-900 mb-3">14. Non-Returnable Items</h2>
      <p>The following items cannot be returned or refunded under any circumstances (except for defects under CPA Section 56):</p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Sealed TCG products that have been opened (see Section 4).</li>
        <li>Digital products, gift cards, or voucher codes that have been redeemed.</li>
        <li>Products damaged by the customer through misuse, negligence, or improper storage.</li>
        <li>Products returned without prior authorisation from EliteTCG.</li>
        <li>Products returned after the applicable return period has expired.</li>
      </ul>
    </section>

    <section id="disputes">
      <h2 className="text-base font-medium text-gray-900 mb-3">15. Dispute Resolution</h2>
      <p>
        If you are not satisfied with the outcome of a return or refund request, you may:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Escalate the matter to our management team via <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a>.</li>
        <li>Lodge a complaint with the National Consumer Commission (NCC) at <strong>www.thencc.gov.za</strong>.</li>
        <li>Refer the dispute to the relevant consumer court or ombud scheme.</li>
        <li>Seek resolution through the South African courts as a last resort.</li>
      </ul>
    </section>

    <section id="changes">
      <h2 className="text-base font-medium text-gray-900 mb-3">16. Changes to This Policy</h2>
      <p>
        We reserve the right to update this Refund &amp; Return Policy at any time. Changes
        will be posted on this page with an updated revision date. The policy in effect at
        the time of your purchase will apply to that transaction.
      </p>
    </section>

    <section id="contact">
      <h2 className="text-base font-medium text-gray-900 mb-3">17. Contact Us</h2>
      <p>
        For all return and refund enquiries, please contact us:
      </p>
      <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p><strong>Elite TCG (Pty) Ltd</strong></p>
        <p>Email: <a href="mailto:admin@elitetcg.co.za" className="text-blue-600 hover:underline">admin@elitetcg.co.za</a></p>
        <p>Website: <a href="https://www.elitetcg.co.za" className="text-blue-600 hover:underline">www.elitetcg.co.za</a></p>
      </div>
    </section>
  </LegalLayout>
);

export default RefundPolicy;
