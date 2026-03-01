import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const API_BASE = 'http://localhost:3001';

const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const ShopBySet = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setRef, isVisible } = useScrollAnimation(sets.length);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch(`${ELITE_API_URL}/api/sets?limit=10`);
        const data = await response.json();
        setSets(data.sets || []);
      } catch (error) {
        console.error('Failed to fetch sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="sets" className="py-16 bg-white md:py-10">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-2">Shop by Sets</h2>
          <p className="text-sm text-gray-500">Explore the latest Pokémon TCG expansions</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-400">Loading sets...</div>
          </div>
        ) : sets.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-400">No sets available</div>
          </div>
        ) : (
          <div className="relative">
            <button
              className={`absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 z-10 transition-all duration-150 hover:border-gray-400 hover:text-gray-900 ${!canScrollLeft ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft />
            </button>

            <div
              className="flex gap-4 overflow-x-auto scroll-snap-x-mandatory scrollbar-none py-2 px-1"
              ref={scrollRef}
              onScroll={handleScroll}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {sets.map((set, i) => (
                <Link
                  key={set.id}
                  to={`/sets/${set.id}`}
                  ref={setRef(i)}
                  data-anim-idx={i}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  className={`flex-none w-60 scroll-snap-start bg-white rounded-lg overflow-hidden transition-all duration-500 hover:opacity-80 md:w-[200px] ${isVisible(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                >
                  <div className="relative h-[220px] bg-white flex items-center justify-center overflow-hidden md:h-[180px]">
                    <img
                      src={getImageUrl(set.image)}
                      alt={set.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    {set.is_new && (
                      <span className="absolute top-2 right-2 inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full bg-primary text-white">
                        New
                      </span>
                    )}
                  </div>
                  <div className="px-2 pb-2 text-center">
                    <h3 className="text-sm font-normal text-gray-900">{set.name}</h3>
                  </div>
                </Link>
              ))}
            </div>

            <button
              className={`absolute top-1/2 -right-5 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 z-10 transition-all duration-150 hover:border-gray-400 hover:text-gray-900 ${!canScrollRight ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight />
            </button>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Link
            to="/sets"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium rounded-full bg-white text-gray-900 border border-gray-300 hover:border-primary hover:text-primary transition-all duration-250"
          >
            View All Sets
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShopBySet;
