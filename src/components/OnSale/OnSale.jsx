import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';

const getDiscountPct = (product) => {
  if (!product.compare_at_price || !product.price) return null;
  const pct = Math.round((1 - product.price / product.compare_at_price) * 100);
  return pct > 0 ? pct : null;
};

const OnSale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const res = await fetch(`${ELITE_API_URL}/api/products?limit=50`);
        const data = await res.json();
        const all = data.products || [];
        const onSale = all.filter(
          p => p.compare_at_price && Number(p.compare_at_price) > Number(p.price)
        );
        setProducts(onSale.slice(0, 16));
      } catch {}
      finally { setLoading(false); }
    };
    fetchSaleProducts();
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full bg-red-500 text-white">
              Sale
            </span>
            <h2 className="text-base font-semibold text-gray-900">On Sale Now</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => scroll(-1)}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs transition-all duration-200
                  ${canScrollLeft ? 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button
                onClick={() => scroll(1)}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs transition-all duration-200
                  ${canScrollRight ? 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
            <Link to="/products" className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
              View all
            </Link>
          </div>
        </div>

        {/* Scroll row */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory' }}
        >
          {products.map((product) => {
            const discountPct = getDiscountPct(product);
            return (
              <Link
                key={product.id}
                to={`/product/${product.slug || product.id}`}
                className="group shrink-0 w-36 md:w-44"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="relative aspect-square flex items-center justify-center p-4 overflow-hidden">
                    <img
                      src={getImageUrl(product.images?.[0]) || PLACEHOLDER_IMAGE}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain transition-transform duration-400 ease-out group-hover:scale-[1.05]"
                      onError={e => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    {discountPct && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                        −{discountPct}%
                      </span>
                    )}
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-[12px] font-medium text-gray-800 truncate leading-snug">
                      {product.name}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default OnSale;
