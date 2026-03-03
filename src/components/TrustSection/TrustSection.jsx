import { Link } from 'react-router-dom';

const items = [
  {
    title: 'Sealed & Authentic',
    body: 'Every Booster Box and Elite Trainer Box is 100% verified and sourced through trusted channels.',
  },
  {
    title: 'Nationwide Shipping',
    body: 'Fast, tracked delivery via The Courier Guy to all SA provinces — from Cape Town to JHB and beyond.',
  },
  {
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
        <div className="text-center mb-14">
          <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase mb-3">Who we are</p>
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">About Elite TCG</h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            South Africa's online store for authentic Pokémon TCG products. Shop sealed products, singles, and accessories — or join our marketplace to buy and sell with other collectors.
          </p>
        </div>

        {/* Trust items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map(({ title, body }) => (
            <div key={title} className="flex flex-col items-center text-center gap-2">
              <h3 className="text-sm font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12">
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
