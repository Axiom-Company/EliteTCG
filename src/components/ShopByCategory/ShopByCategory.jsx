import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001';

// Default icon when no image
const DefaultIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
);

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getImageUrl = (category) => {
    if (!category.image) return null;
    return category.image.startsWith('http') ? category.image : `${API_BASE}${category.image}`;
  };

  if (loading) {
    return (
      <section id="category" className="py-16 bg-gray-50 md:py-10">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-medium mb-2">Shop by Category</h2>
            <p className="text-sm text-gray-500">Find exactly what you're looking for</p>
          </div>
          <div className="flex justify-center py-12">
            <div className="text-gray-400">Loading categories...</div>
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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <a
              key={category.id}
              href={`#category-${category.slug}`}
              className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-250 hover:border-gray-300 group cursor-pointer"
            >
              <div className="relative h-40 bg-white flex items-center justify-center overflow-hidden">
                {getImageUrl(category) ? (
                  <img
                    src={getImageUrl(category)}
                    alt={category.name}
                    className="max-w-[80%] max-h-[80%] object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="text-gray-300">
                    <DefaultIcon />
                  </div>
                )}
              </div>
              <div className="p-3 text-center">
                <h3 className="text-base font-medium text-gray-900 mb-1">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ShopByCategory;
