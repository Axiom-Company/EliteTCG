import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';

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
  const [results, setResults] = useState(null);
  const [open, setOpen]       = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const boxRef   = useRef(null);

  const hasResults = results &&
    (results.products?.length || results.sets?.length || results.categories?.length);

  // Close suggestions when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(timerRef.current);

    if (q.trim().length < 2) {
      setResults(null);
      setLoading(false);
      setOpen(false);
      return;
    }

    setLoading(true);
    setOpen(true);
    const controller = new AbortController();
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${ELITE_API_URL}/api/search?q=${encodeURIComponent(q.trim())}&limit=5`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data);
      } catch {
        // ignore aborted / failed requests
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const goToSearch = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    clearTimeout(timerRef.current);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToSearch();
  };

  const handleChip = (value) => {
    navigate(value ? `/products?category=${value}` : '/products');
  };

  const closeAfter = () => { setOpen(false); setQuery(''); setResults(null); };

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
        <div ref={boxRef} className="relative max-w-lg mx-auto mb-7 text-left">
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
                onFocus={() => { if (hasResults) setOpen(true); }}
                placeholder="Search sets, products, cards..."
                className="w-full pl-11 pr-28 py-3.5 rounded-full border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 bg-white transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-5 py-2 text-sm font-medium rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Suggestions dropdown */}
          {open && query.trim().length >= 2 && (
            <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              {loading && !results ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse px-2 py-1.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                        <div className="h-3 w-1/4 bg-gray-100 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !hasResults ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No matches for “{query.trim()}”
                </div>
              ) : (
                <div className="max-h-[22rem] overflow-y-auto py-2">
                  {/* Products */}
                  {results.products?.length > 0 && (
                    <div>
                      <p className="px-4 pt-1 pb-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-400">Products</p>
                      {results.products.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug || p.id}`}
                          onClick={closeAfter}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={getImageUrl(p.images?.[0])}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                            />
                          </div>
                          <span className="flex-1 text-sm text-gray-900 truncate">{p.name}</span>
                          <span className="text-sm font-medium text-gray-900 tabular-nums shrink-0">
                            R{Number(p.price || 0).toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Sets */}
                  {results.sets?.length > 0 && (
                    <div className="mt-1">
                      <p className="px-4 pt-1 pb-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-400">Sets</p>
                      {results.sets.map((s) => (
                        <Link
                          key={s.id}
                          to={`/sets/${s.id}`}
                          onClick={closeAfter}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
                            <img
                              src={getImageUrl(s.logo_url)}
                              alt={s.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                            />
                          </div>
                          <span className="flex-1 text-sm text-gray-900 truncate">{s.name}</span>
                          {s.code && <span className="text-xs uppercase text-gray-400 shrink-0">{s.code}</span>}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Categories */}
                  {results.categories?.length > 0 && (
                    <div className="mt-1 px-4 pt-1 pb-2">
                      <p className="pb-2 text-[11px] font-medium uppercase tracking-widest text-gray-400">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {results.categories.map((c) => (
                          <Link
                            key={c.id}
                            to={`/categories/${c.slug}`}
                            onClick={closeAfter}
                            className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 ease-in-out"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View all */}
                  <button
                    onClick={goToSearch}
                    className="w-full mt-1 px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50 border-t border-gray-100 transition-colors text-left"
                  >
                    View all results for “{query.trim()}”
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {CHIPS.map(chip => (
            <button
              key={chip.value}
              onClick={() => handleChip(chip.value)}
              className="px-4 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300 ease-in-out"
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
