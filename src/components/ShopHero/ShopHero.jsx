import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CHIPS = [
  { label: 'All',        value: '' },
  { label: 'Booster Boxes',       value: 'booster_box' },
  { label: 'Elite Trainer Boxes', value: 'etb' },
  { label: 'Singles',             value: 'singles' },
  { label: 'Sealed Products',     value: 'sealed' },
  { label: 'Accessories',         value: 'accessories' },
];

const ShopHero = () => {
  const [query, setQuery]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);

    // Show loading spinner briefly while typing
    clearTimeout(timerRef.current);
    if (q.length >= 2) {
      setLoading(true);
      timerRef.current = setTimeout(() => setLoading(false), 400);
    } else {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(false);
    clearTimeout(timerRef.current);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleChip = (value) => {
    navigate(value ? `/products?category=${value}` : '/products');
  };

  return (
    <section className="bg-white pt-14 pb-10 md:pt-20 md:pb-14">
      <div className="container text-center">
        <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-2 leading-tight">
          Find your next pull
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          South Africa's premier Pokémon TCG destination
        </p>

        {/* Search bar */}
        <div className="max-w-lg mx-auto mb-7">
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              {loading ? (
                <svg className="absolute left-4 text-gray-400 animate-spin pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg className="absolute left-4 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              )}
              <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder="Search sets, products, cards..."
                className="w-full pl-11 pr-28 py-3.5 rounded-full border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-5 py-2 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => handleChip(chip.value)}
              className="px-4 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:border-gray-800 hover:text-gray-900 transition-all duration-150"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopHero;
