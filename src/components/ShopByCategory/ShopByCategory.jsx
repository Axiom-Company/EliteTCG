import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { ELITE_API_URL, getImageUrl } from '../../config/api';

// Default icon when no image
const DefaultIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);

const BADGE_PRIORITY = ['hot', 'sale', 'limited', 'new', 'preorder'];

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [categoryBadges, setCategoryBadges] = useState({});
  const [loading, setLoading] = useState(true);
  const { setRef, isVisible } = useScrollAnimation(categories.length);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, productsRes] = await Promise.all([
          fetch(`${ELITE_API_URL}/api/categories`),
          fetch(`${ELITE_API_URL}/api/products?limit=200`),
        ]);
        const catData = await catRes.json();
        const productsData = await productsRes.json();

        const badges = {};
        for (const product of productsData.products || []) {
          if (!product.category || !product.badge || product.badge === 'none') continue;
          const current = badges[product.category];
          const incoming = product.badge.toLowerCase();
          if (!current || BADGE_PRIORITY.indexOf(incoming) < BADGE_PRIORITY.indexOf(current)) {
            badges[product.category] = incoming;
          }
        }

        setCategories(catData.categories || []);
        setCategoryBadges(badges);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="category" className="py-16 bg-white md:py-10">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-medium mb-2">Shop by Category</h2>
            <p className="text-sm text-gray-500">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-4 gap-4 lg:grid-cols-4 md:grid-cols-3 md:gap-4 max-[480px]:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-xl" />
                <div className="px-3 pt-1.5 pb-2 flex flex-col items-center gap-1.5">
                  <div className="h-3 w-20 bg-gray-100 rounded-full" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section id="category" className="py-16 bg-white md:py-10">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-2">Shop by Category</h2>
          <p className="text-sm text-gray-500">Find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-4 gap-4 lg:grid-cols-4 md:grid-cols-3 md:gap-4 max-[480px]:grid-cols-2">
          {categories.map((category, i) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug}`}
              ref={setRef(i)}
              data-anim-idx={i}
              style={{ transitionDelay: `${i * 70}ms` }}
              className={`flex flex-col bg-white rounded-xl overflow-hidden md:border md:border-gray-200 md:shadow-sm transition-all duration-500 group cursor-pointer ${isVisible(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                {getImageUrl(category.image) ? (
                  <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className="max-w-[70%] max-h-[70%] object-contain"
                  />
                ) : (
                  <div className="text-gray-300">
                    <DefaultIcon />
                  </div>
                )}
                {categoryBadges[category.slug] && (
                  <span className="absolute top-2.5 left-2.5 inline-flex items-center px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full bg-primary text-white">
                    {categoryBadges[category.slug]}
                  </span>
                )}
              </div>
              <div className="px-1 pt-1 pb-1 md:px-4 md:pt-2 md:pb-4 text-center">
                <h3 className="text-base font-medium text-gray-900 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopByCategory;
