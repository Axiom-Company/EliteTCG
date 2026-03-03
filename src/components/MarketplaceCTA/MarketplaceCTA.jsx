import { Link } from 'react-router-dom';

const MarketplaceCTA = () => {
  const renderDots = (rows, cols) => {
    const dots = [];
    for (let i = 0; i < rows * cols; i++) {
      dots.push(<div key={i} className="w-1 h-1 bg-white rounded-full" />);
    }
    return dots;
  };

  return (
    <section
      className="relative bg-[#FFCB32] overflow-hidden"
      style={{ paddingTop: '101px', paddingBottom: '101px' }}
    >
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Buy &amp; Sell Pokémon Cards
          </h2>
          <p className="text-gray-800 text-lg max-w-xl">
            Join our marketplace to buy rare cards from verified sellers or become a seller yourself and reach collectors across South Africa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/marketplace"
            className="px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors text-center"
          >
            Browse Marketplace
          </Link>
          <Link
            to="/become-seller"
            className="px-8 py-3 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-colors text-center"
          >
            Start Selling
          </Link>
        </div>
      </div>

      {/* Decorative dots - bottom left */}
      <div
        className="absolute bottom-0 left-0 grid opacity-50"
        style={{
          gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
          gap: '8px',
          padding: '16px',
        }}
      >
        {renderDots(6, 11)}
      </div>

      {/* Decorative dots - top right */}
      <div
        className="absolute top-0 right-0 grid opacity-50"
        style={{
          gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
          gap: '8px',
          padding: '16px',
        }}
      >
        {renderDots(6, 11)}
      </div>
    </section>
  );
};

export default MarketplaceCTA;
