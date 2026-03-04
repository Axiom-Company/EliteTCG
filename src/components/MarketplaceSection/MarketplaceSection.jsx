import { Link } from 'react-router-dom';

const items = [
  {
    num: '01',
    headline: 'Find Rare Cards at the Right Price',
    body: 'Browse verified listings from collectors across South Africa. From budget pulls to ultra-rare holos, all in one place.',
    cta: { label: 'Browse Marketplace', to: '/marketplace' },
  },
  {
    num: '02',
    headline: 'Turn Your Collection Into Cash',
    body: 'List your cards in minutes and reach collectors nationwide. Set your own price with no upfront fees.',
    cta: { label: 'Start Selling', to: '/become-seller' },
  },
];

const MarketplaceSection = () => (
  <section className="bg-gray-50 border-t border-b border-gray-100">
    <div className="container max-w-5xl mx-auto px-6 py-16 md:py-20">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2.5">Marketplace</p>
        <h2 className="text-3xl md:text-4xl font-medium text-gray-900">Buy & Sell Cards</h2>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {items.map(({ num, headline, body, cta }) => (
          <div
            key={num}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 py-8 md:py-9"
          >
            <div className="flex items-start gap-6">
              <span className="text-sm font-medium text-gray-200 shrink-0 mt-0.5 w-6">{num}</span>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1.5 leading-snug">{headline}</h3>
                <p className="text-sm text-gray-400 max-w-md leading-relaxed">{body}</p>
              </div>
            </div>
            <Link
              to={cta.to}
              className="shrink-0 self-start md:self-auto ml-12 md:ml-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              {cta.label}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          </div>
        ))}
      </div>

    </div>
  </section>
);

export default MarketplaceSection;
