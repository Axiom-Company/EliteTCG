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
  { id: 'pull-rates', label: 'Pull Rates & Odds' },
  { id: 'card-pricing', label: 'Card Pricing & Valuation' },
  { id: 'card-data', label: 'Card Data Sources' },
  { id: 'digital-vs-physical', label: 'Digital vs Physical' },
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
    lastUpdated="9 March 2026"
    seo={{ title: 'Elite Rips Policy – How It Works', path: '/elite-rips-policy' }}
    sections={sections}
  >
    <section id="overview">
      <h2 className="text-base font-medium text-gray-900 mb-3">1. Overview</h2>
      <p>
        This policy explains exactly how Elite Rips works, including the technology behind it, the
        randomness system, pull rates, pricing methodology, and your rights as a user. We believe
        in full transparency — every outcome is cryptographically verifiable and no element of the
        system is hidden from you.
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
        Elite Rips is a digital pack opening experience that simulates the experience of opening a
        Pokémon Trading Card Game booster pack. When you open a pack, you receive 5 randomly
        selected cards from the chosen set's card pool. The randomness is powered by a{' '}
        <strong>provably fair</strong> cryptographic system — the same standard used by
        transparent online platforms worldwide.
      </p>
      <p className="mt-2">
        Each pack costs a fixed price in South African Rand (ZAR). The cards you receive are
        digital representations of real Pokémon TCG cards, with market-based valuations sourced
        from Cardmarket (Europe's largest TCG marketplace).
      </p>
    </section>

    <section id="how-it-works">
      <h2 className="text-base font-medium text-gray-900 mb-3">3. How It Works — Step by Step</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <strong>Choose a set:</strong> Browse available Pokémon TCG sets on the{' '}
          <Link to="/elite-rips" className="underline">Elite Rips</Link> page. Each set
          displays its name, card count, and price.
        </li>
        <li>
          <strong>Confirm your pack:</strong> Review the set details, pull rate categories,
          and price. You can view the provably fair seed information before opening.
        </li>
        <li>
          <strong>Open the pack:</strong> The server generates 5 cards using the provably fair
          RNG system. Cards are sorted by rarity (common → ultra rare) so the best card is
          revealed last.
        </li>
        <li>
          <strong>Reveal cards:</strong> Click each card to flip it over. Rare cards trigger
          visual effects (sparkles, screen shake for ultra rares).
        </li>
        <li>
          <strong>View results:</strong> After all 5 cards are revealed, you see a summary
          with each card's name, image, and market value in ZAR.
        </li>
      </ol>
    </section>

    <section id="provably-fair">
      <h2 className="text-base font-medium text-gray-900 mb-3">4. Provably Fair System</h2>
      <p>
        Elite Rips uses <strong>HMAC-SHA512</strong> provably fair cryptography — a system that
        allows you to independently verify that every pack outcome was determined fairly and was
        not manipulated after the fact. Here is how it works:
      </p>
      <ol className="list-decimal pl-5 space-y-2 mt-3">
        <li>
          <strong>Before any rolls:</strong> The server generates a random{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">server_seed</code> (64
          hex characters / 256 bits of entropy) and shows you its{' '}
          <strong>SHA-256 hash</strong>. This hash is a commitment — it proves the server seed
          was chosen before you open packs, and cannot be changed afterwards.
        </li>
        <li>
          <strong>Client seed:</strong> You are assigned a{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">client_seed</code>{' '}
          (your username if logged in, or a random 16-hex string). You can change this at any
          time via the API. The client seed ensures the server cannot predict outcomes alone.
        </li>
        <li>
          <strong>Nonce:</strong> Each pack opening uses a unique{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">nonce</code> that
          combines a timestamp (SSMMHHDDMMYYYY format) with a sequential counter. This ensures
          every roll is unique even if seeds are identical.
        </li>
        <li>
          <strong>After seed rotation:</strong> When you rotate your server seed, the{' '}
          <strong>unhashed previous server seed</strong> is revealed. You can then hash it
          yourself and confirm it matches the hash you were shown before any rolls — proving
          the outcomes were pre-determined and fair.
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
      <h2 className="text-base font-medium text-gray-900 mb-3">6. RNG Algorithm — Source Code</h2>
      <p>
        Each card in a pack is determined by a separate HMAC-SHA512 computation. Here is the exact
        code:
      </p>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Generating rolls for a 5-card pack:</p>
      <Code>{`function generatePackRolls(serverSeed, clientSeed, nonce, count) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const message = \`\${clientSeed}:\${nonce}:\${i}\`;
    const hmac = crypto.createHmac('sha512', serverSeed)
      .update(message)
      .digest('hex');
    // First 8 hex chars → 32-bit integer → float in [0, 1)
    const int = parseInt(hmac.substring(0, 8), 16);
    rolls.push(int / 0x100000000); // divide by 2^32
  }
  return rolls;
}`}</Code>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Mapping a roll to a rarity tier:</p>
      <Code>{`function rollToRarity(roll, weights) {
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let cumulative = 0;
  for (const { rarity, weight } of weights) {
    cumulative += weight / totalWeight;
    if (roll < cumulative) return rarity;
  }
  return weights[weights.length - 1].rarity;
}`}</Code>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Selecting a specific card from the rarity pool:</p>
      <Code>{`function rollToCardIndex(roll, cardCount) {
  return Math.floor(roll * cardCount);
}`}</Code>

      <p className="mt-2">
        The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">HMAC-SHA512</code> function
        is a keyed hash function from Node.js's built-in{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">crypto</code> module. It is a
        deterministic function — given the same inputs, it always produces the same output. This
        is what makes verification possible.
      </p>
    </section>

    <section id="verification">
      <h2 className="text-base font-medium text-gray-900 mb-3">7. Independent Verification</h2>
      <p>
        After rotating your server seed, you can verify any previous pack opening yourself. Here
        is the verification function (also available via our API at{' '}
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">POST /api/packs/verify</code>):
      </p>

      <Code>{`function verifyRoll(serverSeed, clientSeed, nonce, cardIndex) {
  const message = \`\${clientSeed}:\${nonce}:\${cardIndex}\`;
  const hmac = crypto.createHmac('sha512', serverSeed)
    .update(message)
    .digest('hex');
  const int = parseInt(hmac.substring(0, 8), 16);
  return {
    hmac,
    int,
    roll: int / 0x100000000,
  };
}`}</Code>

      <p className="mt-2"><strong>To verify a roll yourself:</strong></p>
      <ol className="list-decimal pl-5 space-y-1 mt-2">
        <li>Note the <strong>server seed hash</strong>, <strong>client seed</strong>, and <strong>nonce</strong> shown before opening.</li>
        <li>Open packs as normal.</li>
        <li>Rotate your server seed — the <strong>previous unhashed server seed</strong> is revealed.</li>
        <li>Hash the revealed server seed with SHA-256 and confirm it matches the hash from step 1.</li>
        <li>Run the HMAC-SHA512 computation above with the revealed server seed, your client seed, the nonce, and each card index (0–4).</li>
        <li>Confirm the resulting rolls match the cards you received.</li>
      </ol>
      <p className="mt-2">
        You can perform this verification in any programming language, any online HMAC calculator,
        or via our <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">POST /api/packs/verify</code>{' '}
        API endpoint. The algorithm is standard and not proprietary.
      </p>
    </section>

    <section id="pull-rates">
      <h2 className="text-base font-medium text-gray-900 mb-3">8. Pull Rates & Odds</h2>
      <p>
        Each 5-card pack has a fixed slot structure. The exact weights used in our system are:
      </p>

      <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-2.5 font-medium text-gray-900">Slot</th>
              <th className="px-4 py-2.5 font-medium text-gray-900">Rarity</th>
              <th className="px-4 py-2.5 font-medium text-gray-900">Weight</th>
              <th className="px-4 py-2.5 font-medium text-gray-900">Probability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr><td className="px-4 py-2">1</td><td className="px-4 py-2">Common</td><td className="px-4 py-2">100</td><td className="px-4 py-2">100%</td></tr>
            <tr><td className="px-4 py-2">2</td><td className="px-4 py-2">Common</td><td className="px-4 py-2">100</td><td className="px-4 py-2">100%</td></tr>
            <tr><td className="px-4 py-2">3</td><td className="px-4 py-2">Common</td><td className="px-4 py-2">100</td><td className="px-4 py-2">100%</td></tr>
            <tr><td className="px-4 py-2">4</td><td className="px-4 py-2">Uncommon</td><td className="px-4 py-2">100</td><td className="px-4 py-2">100%</td></tr>
            <tr>
              <td className="px-4 py-2">5</td>
              <td className="px-4 py-2">Rare / Ultra Rare</td>
              <td className="px-4 py-2">88 / 12</td>
              <td className="px-4 py-2">88% Rare, 12% Ultra Rare</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3">
        This means approximately <strong>1 in 8 packs</strong> will contain an ultra rare card
        (Illustration Rare, Full Art, Alt Art, Special Art Rare, Secret Rare, etc.). These rates
        are fixed in our server code and are not dynamically adjusted.
      </p>

      <p className="mt-3 mb-1 text-xs font-medium text-gray-500">Exact slot weights in code:</p>
      <Code>{`const SLOT_WEIGHTS = [
  [{ rarity: 'common',    weight: 100 }],  // Slot 1
  [{ rarity: 'common',    weight: 100 }],  // Slot 2
  [{ rarity: 'common',    weight: 100 }],  // Slot 3
  [{ rarity: 'uncommon',  weight: 100 }],  // Slot 4
  [                                         // Slot 5
    { rarity: 'rare',       weight: 88 },
    { rarity: 'ultra_rare', weight: 12 },
  ],
];`}</Code>

      <p className="mt-2">
        <strong>Duplicate protection:</strong> No two cards in the same pack will be identical.
        If a duplicate is rolled, the system re-rolls with an incremented sub-nonce (up to 20
        attempts) to select a different card from the same rarity pool.
      </p>
    </section>

    <section id="card-pricing">
      <h2 className="text-base font-medium text-gray-900 mb-3">9. Card Pricing & Valuation</h2>
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
        Rates API, refreshed every hour. Card prices are cached for 30 minutes to ensure
        up-to-date valuations.
      </p>
      <p className="mt-2">
        <strong>Important:</strong> Displayed values are indicative market prices for reference
        only. They represent the approximate value of the physical card on Cardmarket and do not
        constitute a guarantee of resale value, buyback offer, or redeemable credit.
      </p>
    </section>

    <section id="card-data">
      <h2 className="text-base font-medium text-gray-900 mb-3">10. Card Data Sources</h2>
      <p>
        Card information (names, images, rarity, set membership) is sourced from:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>TCGdex API</strong> (api.tcgdex.net) — primary source for card data, rarity classifications, and Cardmarket pricing.</li>
        <li><strong>PokemonTCG.io</strong> (images.pokemontcg.io) — fallback image CDN for card artwork.</li>
      </ul>
      <p className="mt-2">
        Card rarity is determined by the official rarity classification from these APIs and mapped
        to our internal system (Common, Uncommon, Rare, Ultra Rare). The full rarity mapping is
        publicly documented in our server code.
      </p>
    </section>

    <section id="digital-vs-physical">
      <h2 className="text-base font-medium text-gray-900 mb-3">11. Digital vs Physical Cards</h2>
      <p>
        Cards received through Elite Rips are <strong>digital representations</strong> of real
        Pokémon TCG cards. When you open a pack:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>You receive a digital reveal experience showing which cards were randomly selected.</li>
        <li>The "Store Credit" and "Ship Cards" options are features under development and may not be available at all times.</li>
        <li>Card images are sourced from official Pokémon TCG databases and represent authentic card designs.</li>
      </ul>
      <p className="mt-2">
        Elite Rips is an entertainment product. The primary value is the experience of opening
        packs with provably fair randomness and seeing which cards you pull.
      </p>
    </section>

    <section id="no-gambling">
      <h2 className="text-base font-medium text-gray-900 mb-3">12. Not Gambling</h2>
      <p>
        Elite Rips is <strong>not gambling</strong> under South African law (National Gambling Act
        7 of 2004). Gambling requires the possibility of winning money or money's worth as a
        prize. Elite Rips is a digital entertainment product where:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>You pay a fixed price for a digital pack opening experience.</li>
        <li>You always receive exactly 5 cards — there is no possibility of receiving nothing.</li>
        <li>Cards are digital representations with indicative market values for reference only.</li>
        <li>There is no cash-out, no monetary prize, and no mechanism to convert digital results into money.</li>
        <li>The experience is analogous to purchasing a physical booster pack where contents vary.</li>
      </ul>
      <p className="mt-2">
        This is functionally identical to buying a physical Pokémon TCG booster pack — you pay a
        fixed price and receive random cards. The randomised element is inherent to trading card
        products and is not classified as gambling in any jurisdiction where physical booster packs
        are legally sold.
      </p>
    </section>

    <section id="eligibility">
      <h2 className="text-base font-medium text-gray-900 mb-3">13. Eligibility</h2>
      <p>
        You must be at least <strong>18 years of age</strong> to use Elite Rips. By opening a
        pack, you confirm that you are 18 or older. We reserve the right to request age
        verification at any time and to suspend access if we believe a user is underage.
      </p>
    </section>

    <section id="refunds">
      <h2 className="text-base font-medium text-gray-900 mb-3">14. Refund Policy for Elite Rips</h2>
      <p>
        Because pack openings involve randomised digital content that is delivered instantly:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li><strong>Before opening:</strong> If a technical error prevents the pack from opening, you will not be charged or will receive a full refund.</li>
        <li><strong>After opening:</strong> Once cards have been revealed, the transaction is complete and refunds are not available, as the digital content has been fully delivered.</li>
        <li>This is consistent with Section 44 of the Consumer Protection Act (CPA) regarding digital goods that have been accessed or consumed.</li>
      </ul>
      <p className="mt-2">
        If you experience a technical issue (e.g., the page crashes mid-opening and cards are not
        displayed), please contact us with the details and we will investigate and resolve the
        issue.
      </p>
    </section>

    <section id="ip">
      <h2 className="text-base font-medium text-gray-900 mb-3">15. Intellectual Property</h2>
      <p>
        Pokémon, Pokémon TCG, and all related names, logos, and card designs are trademarks and
        copyrights of The Pokémon Company International, Nintendo, and Game Freak. Elite TCG is
        <strong> not affiliated with, endorsed by, or sponsored by</strong> The Pokémon Company,
        Nintendo, or Game Freak.
      </p>
      <p className="mt-2">
        Card images are sourced from public APIs (TCGdex, PokemonTCG.io) and are used for
        identification and reference purposes in connection with the sale of authentic
        Pokémon TCG products and digital entertainment services.
      </p>
    </section>

    <section id="liability">
      <h2 className="text-base font-medium text-gray-900 mb-3">16. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by South African law, Elite TCG (Pty) Ltd shall not be
        liable for:
      </p>
      <ul className="list-disc pl-5 space-y-1 mt-2">
        <li>The specific cards received in any pack opening (outcomes are random and verifiable).</li>
        <li>Fluctuations in card market values after a pack is opened.</li>
        <li>Service interruptions, API outages from third-party providers (TCGdex, exchange rate APIs), or temporary unavailability.</li>
        <li>Any indirect, incidental, or consequential damages arising from the use of Elite Rips.</li>
      </ul>
      <p className="mt-2">
        Our total liability for any claim related to Elite Rips shall not exceed the amount you
        paid for the specific pack opening in question.
      </p>
    </section>

    <section id="changes">
      <h2 className="text-base font-medium text-gray-900 mb-3">17. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time to reflect changes in our service, technology,
        or legal requirements. Material changes will be announced on the Site. The "Last updated"
        date at the top of this page indicates when this policy was most recently revised.
        Continued use of Elite Rips after changes constitutes acceptance of the updated policy.
      </p>
    </section>

    <section id="contact">
      <h2 className="text-base font-medium text-gray-900 mb-3">18. Contact Us</h2>
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
