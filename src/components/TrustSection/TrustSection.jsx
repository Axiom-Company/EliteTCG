import { Link } from 'react-router-dom';

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v4h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
);

const items = [
  {
    icon: <ShieldIcon />,
    title: 'Sealed & Authentic',
    body: 'Every Booster Box and Elite Trainer Box is 100% verified and sourced through trusted channels.',
  },
  {
    icon: <TruckIcon />,
    title: 'Nationwide Shipping',
    body: 'Fast, tracked delivery via The Courier Guy to all SA provinces — from Cape Town to JHB and beyond.',
  },
  {
    icon: <LockIcon />,
    title: 'Secure Payments',
    body: (
      <>
        All transactions processed securely through PayFast. Your data is protected per our{' '}
        <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-gray-900 transition-colors">privacy policy</Link>.
      </>
    ),
  },
];

const TrustSection = () => {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="container max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-medium tracking-[0.2em] uppercase text-primary mb-4">
            Who we are
          </span>
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">About Elite TCG</h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed" style={{ paddingTop: '2px' }}>
            South Africa's online store for authentic Pokémon TCG products. Shop sealed products, singles, and accessories — or join our marketplace to buy and sell with other collectors.
          </p>
        </div>

        {/* Trust items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: '5px' }}>
          {items.map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col gap-2 p-6 rounded-2xl border border-gray-100 bg-gray-50">
              <div className="flex flex-col gap-1">
                <div className="text-gray-500 mb-2">{icon}</div>
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 py-3 px-8 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            Shop Now
          </Link>
        </div>

      </div>
    </section>
  );
};

export default TrustSection;
