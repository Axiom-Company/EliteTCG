import { Link } from 'react-router-dom';

const MarketplaceCTA = () => {
  return (
    <section className="bg-gray-100 py-14 md:py-16">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-8">

        {/* Heading */}
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase mb-2">Marketplace</p>
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-snug mb-2">
            Buy &amp; sell Pokémon cards
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
            Discover rare singles from verified sellers, or list your own collection and reach collectors across South Africa.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Browse Marketplace
          </Link>
          <Link
            to="/become-seller"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            Start Selling
          </Link>
        </div>

      </div>
    </section>
  );
};

export default MarketplaceCTA;
