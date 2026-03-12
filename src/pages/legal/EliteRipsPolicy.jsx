import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'what-is-elite-rips', label: 'What Is Elite Rips' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'provably-fair', label: 'Provably Fair System' },
  { id: 'seed-system', label: 'Seed & Nonce System' },
  { id: 'rng-algorithm', label: 'RNG Algorithm' },
  { id: 'verification', label: 'Independent Verification' },
  { id: 'card-pricing', label: 'Card Pricing & Valuation' },
  { id: 'shipping', label: 'Shipping & Fulfilment' },
  { id: 'no-gambling', label: 'Not Gambling' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'refunds', label: 'Refund Policy' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact Us' },
];

const Code = ({ children }) => (
  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono text-gray-700 overflow-x-auto my-3 leading-relaxed">
    {children}
  </pre>
);

const EliteRipsPolicy = () => (
  <LegalLayout
    title="Elite Rips Policy"
    lastUpdated="12 March 2026"
    seo={{ title: 'Elite Rips Policy – How It Works', path: '/elite-rips-policy' }}
    sections={sections}
  >
    <section id="overview">
      <h2 className="text-base font-medium text-gray-900 mb-3">1. Overview</h2>
      <p>
        This policy explains exactly how Elite Rips works, including how real packs are sourced,
        the provably fair pack selection system, pricing methodology, shipping, and your rights
        as a user. We believe in full transparency — every pack assignment is cryptographically
        verifiable and no element of the system is hidden from you.
      </p>
      <p className="mt-2">
        By using Elite Rips, you agree to the terms outlined in this policy, in addition to our
        general <Link to="/terms-of-service" className="underline">Terms of Service</Link>,{' '}
        <Link to="/privacy-policy" className="underline">Privacy Policy</Link>, and{' '}
        <Link to="/refund-policy" className="underline">Refund Policy</Link>.
      </p>
    </section>

    <section id="what-is-elite-rips">
      <h2 className="text-base font-medium text-gray-900 mb-3">2. What Is Elite Rips</h2>
      <p>
        Elite Rips is a real pack opening experience. We physically purchase sealed Pokémon TCG
        booster packs, open them on camera, and record every card inside. When you open a pack
        on Elite Rips, the provably fair system assigns you one of these real, pre-opened packs
        at random — you receive the exact cards that were inside.
      </p>
      <p className="mt-2">
        Each pack costs a fixed price in South African Rand (ZAR). After your cards are revealed,
        you can choose to have them shipped to you or open another pack. Card values displayed are
        sourced from Cardmarket (Europe's largest TCG marketplace) for reference.
      </p>
    </section>

    <section id="how-it-works">
      <h2 className="text-base font-medium text-gray-900 mb-3">3. How It Works — Step by Step</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <strong>We open packs on camera:</strong> Our team purchases sealed booster packs, opens
          them on video, and records every card. Each pack and its contents are logged in our
          inventory system with a unique pack number.
        </li>
        <li>
          <strong>Choose a set:</strong> Browse available Pokémon TCG sets on the{' '}
          <Link to="/elite-rips" className="underline">Elite Rips</Link> page. Sets with available
          inventory are shown as in stock.
        </li>
        <li>
          <strong>Open the pack:</strong> When you click "Open Pack", the provably fair system
          generates a random number to select which real pack from the available inventory you
          receive. The pack is marked as sold and assigned to you.
        </li>
        <li>
          <strong>Reveal your cards:</strong> The cards from your assigned pack are presented one
          by one. Tap each card to flip and reveal it. Rare cards trigger visual effects.
        </li>
        <li>
          <strong>Ship or continue:</strong> After all cards are revealed, you can choose to have
          the physical cards shipped to your address, or go back and open another pack.
        </li>
      </ol>
    </section>

    <section id="provably-fair">
      <h2 className="text-base font-medium text-gray-900 mb-3">4. Provably Fair System</h2>
      <p>
        Elite Rips uses <strong>HMAC-SHA512</strong> provably fair cryptography to determine which
        pack you receive. This system allows you to independently verify that pack assignment was
        random and was not manipulated after the fact. Here is how it works:
      </p>
      <ol className="list-decimal pl-5 space-y-2 mt-3">
        <li>
          <strong>Before any packs are opened:</strong> The server generates a random{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">server_seed</code> (64
          hex characters / 256 bits of entropy) and shows you its{' '}
          <strong>SHA-256 hash</strong>. This hash is a commitment — it proves the server seed
          was chosen before you open packs, and cannot be changed afterwards.
        </li>
        <li>
          <strong>Client seed:</strong> You are assigned a{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">client_seed</code>{' '}
          (your username if logged in, or a random 16-hex string). You can change this at any
          time. The client seed ensures the server cannot predict outcomes alone.
        </li>
        <li>
          <strong>Nonce:</strong> Each pack opening uses a unique{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">nonce</code> that
          combines a timestamp with a sequential counter. This ensures every pack selection is
          unique even if seeds are identical.
        </li>
        <li>
          <strong>Pack selection:</strong> The HMAC-SHA512 output is converted to a number between
          0 and 1, then multiplied by the number of available packs for that set. The result
          determines which specific pack you receive.
        </li>
        <li>
          <strong>After seed rotation:</strong> When you rotate your server seed, the{' '}
          <strong>unhashed previous server seed</strong> is revealed. You can then hash it
          yourself and confirm it matches the hash you were shown before — proving the pack
          selection was pre-determined and fair.
        </li>
      </ol>
    </section>

    <section id="seed-system">
      <h2 className="text-base font-medium text-gray-900 mb-3">5. Seed & Nonce System — Source Code</h2>
      <p>
        Below is the exact code used to generate seeds and nonces. This code runs on our server
        and is reproduced here verbatim for transparency:
      </p>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Server seed generation (256-bit random):</p>
      <Code>{`function generateServerSeed() {
  return crypto.randomBytes(32).toString('hex');
}
// Example output: "a3f8c2d1e6b9...64 hex characters"`}</Code>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Server seed hashing (commitment):</p>
      <Code>{`function hashServerSeed(serverSeed) {
  return crypto.createHash('sha256')
    .update(serverSeed)
    .digest('hex');
}`}</Code>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Time-based nonce generation:</p>
      <Code>{`function generateTimeNonce() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return \`\${pad(d.getSeconds())}\${pad(d.getMinutes())}\`
       + \`\${pad(d.getHours())}\${pad(d.getDate())}\`
       + \`\${pad(d.getMonth() + 1)}\${d.getFullYear()}\`;
}
// Example: "30141509032026" (30s, 14m, 15h, 9th, March, 2026)`}</Code>

      <p className="mt-2">
        The final nonce used for each pack is:{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">timeNonce:sessionCounter</code>,
        making every single pack opening cryptographically unique.
      </p>
    </section>

    <section id="rng-algorithm">
      <h2 className="text-base font-medium text-gray-900 mb-3">6. RNG Algorithm — Pack Selection</h2>
      <p>
        When you open a pack, a single HMAC-SHA512 computation determines which pack from the
        available inventory you receive. Here is the exact code:
      </p>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Generating a roll to select a pack:</p>
      <Code>{`function generateRoll(serverSeed, clientSeed, nonce) {
  const message = \`\${clientSeed}:\${nonce}\`;
  const hmac = crypto.createHmac('sha512', serverSeed)
    .update(message)
    .digest('hex');
  // First 8 hex chars → 32-bit integer → float in [0, 1)
  const int = parseInt(hmac.substring(0, 8), 16);
  return int / 0x100000000; // divide by 2^32
}`}</Code>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Selecting a pack from available inventory:</p>
      <Code>{`// roll is a float in [0, 1)
const packIndex = Math.floor(roll * availablePacks.length);
const selectedPack = availablePacks[packIndex];

// Mark pack as sold with optimistic lock
await db.update('opened_packs')
  .set({ status: 'sold', assigned_to: userId })
  .where({ id: selectedPack.id, status: 'available' });`}</Code>

      <p className="mt-2">
        The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">HMAC-SHA512</code> function
        is a keyed hash function from Node.js's built-in{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">crypto</code> module. It is
        deterministic — given the same inputs, it always produces the same output. This is what
        makes verification possible.
      </p>
      <p className="mt-2">
        <strong>Optimistic locking</strong> ensures that if two users try to claim the same pack
        simultaneously, only one succeeds. The other user is prompted to try again, at which point
        a new pack is selected from the remaining inventory.
      </p>
    </section>

    <section id="verification">
      <h2 className="text-base font-medium text-gray-900 mb-3">7. Independent Verification</h2>
      <p>
        After rotating your server seed, you can verify any previous pack selection yourself.
        The verification endpoint is available at{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">POST /api/packs/verify</code>:
      </p>

      <Code>{`// Verify a pack selection
const message = \`\${clientSeed}:\${nonce}\`;
const hmac = crypto.createHmac('sha512', serverSeed)
  .update(message)
  .digest('hex');
const int = parseInt(hmac.substring(0, 8), 16);
const roll = int / 0x100000000;
// roll * totalAvailablePacks = the pack index you received`}</Code>

      <p className="mt-2"><strong>To verify a pack selection yourself:</strong></p>
      <ol className="list-decimal pl-5 space-y-1 mt-2">
        <li>Note the <strong>server seed hash</strong>, <strong>client seed</strong>, and <strong>nonce</strong> shown before opening.</li>
        <li>Open packs as normal. Each pack response includes the <strong>packIndex</strong> and <strong>totalAvailable</strong> count.</li>
        <li>Rotate your server seed — the <strong>previous unhashed server seed</strong> is revealed.</li>
        <li>Hash the revealed server seed with SHA-256 and confirm it matches the hash from step 1.</li>
        <li>Run the HMAC-SHA512 computation above with the revealed server seed, your client seed, and the nonce.</li>
        <li>Confirm that <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">floor(roll * totalAvailable)</code> equals the packIndex you received.</li>
      </ol>
      <p className="mt-2">
        You can perform this verification in any programming language, any online HMAC calculator,
        or via our API endpoint. The algorithm is standard and not proprietary.
      </p>
    </section>

    <section id="card-pricing">
      <h2 className="text-base font-medium text-gray-900 mb-3">8. Card Pricing & Valuation</h2>
      <p>
        Card values displayed in Elite Rips are sourced from{' '}
        <strong>Cardmarket</strong> (cardmarket.com), Europe's largest trading card marketplace,
        via the TCGdex API. We use the following price priority:
      </p>
      <ol className="list-decimal pl-5 space-y-1 mt-2">
        <li><strong>Trend price</strong> (30-day moving average)</li>
        <li><strong>Average price</strong> (if trend unavailable)</li>
        <li><strong>Low price</strong> (if average unavailable)</li>
      </ol>
      <p className="mt-2">
        Prices are in EUR and converted to ZAR using live exchange rates from the Open Exchange
        Rates API, refreshed every hour.
      </p>
      <p className="mt-2">
        <strong>Important:</strong> Displayed values are indicative market prices for reference
        only. They represent the approximate value of the physical card on Cardmarket and do not
        constitute a guarantee of resale value or buyback offer.
      </p>
    </section>

    <section id="shipping">
      <h2 className="text-base font-medium text-gray-900 mb-3">9. Shipping & Fulfilment</h2>
      <p>
        After opening a pack, you can request the physical cards to be shipped to you:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>Cards are stored securely in our facility after being opened on camera.</li>
        <li>Shipping is available within South Africa. A shipping fee is calculated based on your delivery address.</li>
        <li>Cards are shipped in protective sleeves and top-loaders to prevent damage during transit.</li>
        <li>Tracking information is provided once your order is dispatched.</li>
      </ul>
      <p className="mt-2">
        If you do not request shipping, the cards remain in your account and can be shipped at a
        later date.
      </p>
    </section>

    <section id="no-gambling">
      <h2 className="text-base font-medium text-gray-900 mb-3">10. Not Gambling</h2>
      <p>
        Elite Rips is <strong>not gambling</strong> under South African law (National Gambling Act
        7 of 2004). Elite Rips is the sale of real, physical Pokémon TCG trading cards where:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>You pay a fixed price and always receive a full pack of real cards — there is no possibility of receiving nothing.</li>
        <li>The cards are real, physical products that can be shipped to you.</li>
        <li>Every pack was physically opened and its contents recorded before being made available.</li>
        <li>The provably fair system determines which pre-opened pack you receive, not whether you win or lose.</li>
        <li>This is functionally identical to buying a sealed booster pack from a shop — the only difference is we open it on camera first.</li>
      </ul>
    </section>

    <section id="eligibility">
      <h2 className="text-base font-medium text-gray-900 mb-3">11. Eligibility</h2>
      <p>
        You must be at least <strong>18 years of age</strong> to use Elite Rips. By opening a
        pack, you confirm that you are 18 or older. We reserve the right to request age
        verification at any time and to suspend access if we believe a user is underage.
      </p>
    </section>

    <section id="refunds">
      <h2 className="text-base font-medium text-gray-900 mb-3">12. Refund Policy for Elite Rips</h2>
      <p>
        Because pack openings assign a specific real pack to you instantly:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>Before opening:</strong> If a technical error prevents the pack from opening, you will not be charged or will receive a full refund.</li>
        <li><strong>After opening:</strong> Once a pack has been assigned and cards revealed, the transaction is complete and refunds are not available, as the physical pack has been allocated to you.</li>
        <li><strong>Shipping issues:</strong> If cards are damaged or lost in transit, contact us for a resolution.</li>
      </ul>
      <p className="mt-2">
        If you experience a technical issue (e.g., the page crashes mid-opening and cards are not
        displayed), please contact us with the details and we will investigate and resolve the
        issue.
      </p>
    </section>

    <section id="ip">
      <h2 className="text-base font-medium text-gray-900 mb-3">13. Intellectual Property</h2>
      <p>
        Pokémon, Pokémon TCG, and all related names, logos, and card designs are trademarks and
        copyrights of The Pokémon Company International, Nintendo, and Game Freak. Elite TCG is
        <strong> not affiliated with, endorsed by, or sponsored by</strong> The Pokémon Company,
        Nintendo, or Game Freak.
      </p>
      <p className="mt-2">
        Card images are sourced from public APIs and are used for identification and reference
        purposes in connection with the sale of authentic Pokémon TCG products.
      </p>
    </section>

    <section id="liability">
      <h2 className="text-base font-medium text-gray-900 mb-3">14. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by South African law, Elite TCG (Pty) Ltd shall not be
        liable for:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>The specific pack assigned in any pack opening (outcomes are random and verifiable).</li>
        <li>Fluctuations in card market values after a pack is opened.</li>
        <li>Service interruptions or temporary unavailability.</li>
        <li>Any indirect, incidental, or consequential damages arising from the use of Elite Rips.</li>
      </ul>
      <p className="mt-2">
        Our total liability for any claim related to Elite Rips shall not exceed the amount you
        paid for the specific pack opening in question.
      </p>
    </section>

    <section id="changes">
      <h2 className="text-base font-medium text-gray-900 mb-3">15. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time to reflect changes in our service, technology,
        or legal requirements. Material changes will be announced on the Site. The "Last updated"
        date at the top of this page indicates when this policy was most recently revised.
        Continued use of Elite Rips after changes constitutes acceptance of the updated policy.
      </p>
    </section>

    <section id="contact">
      <h2 className="text-base font-medium text-gray-900 mb-3">16. Contact Us</h2>
      <p>
        If you have questions about this policy, the provably fair system, or need help verifying
        a pack opening, contact us:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>Email:</strong> support@elitetcg.co.za</li>
        <li><strong>Website:</strong> <Link to="/" className="underline">www.elitetcg.co.za</Link></li>
      </ul>
    </section>
  </LegalLayout>
);

export default EliteRipsPolicy;
