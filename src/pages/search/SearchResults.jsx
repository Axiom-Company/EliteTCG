import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import ProductCard from '../../components/ProductCard/ProductCard';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) { setLoading(false); return; }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ELITE_API_URL}/api/search?q=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const hasResults = results &&
    (results.products?.length || results.sets?.length || results.categories?.length);

  return (
    <div className="bg-white min-h-screen">
      <div className="container py-10 md:py-14">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm text-gray-400 mb-1">Search results for</p>
          <h1 className="text-3xl md:text-4xl font-medium text-gray-900">"{query}"</h1>
        </div>

        {loading ? (
          <div className="space-y-10">
            {/* Product skeletons */}
            <div>
              <div className="h-4 w-24 bg-gray-100 rounded-full mb-5" />
              <div className="grid grid-cols-4 gap-4 md:grid-cols-3 max-[480px]:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-2">
                    <div className="aspect-[3/4] bg-gray-100 rounded-xl" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !hasResults ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No results found for "{query}"</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="space-y-14">

            {/* Products */}
            {results.products?.length > 0 && (
              <section>
                <h2 className="text-lg font-medium text-gray-900 mb-5">Products</h2>
                <div className="grid grid-cols-4 gap-4 md:grid-cols-3 max-[480px]:grid-cols-2">
                  {results.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Sets */}
            {results.sets?.length > 0 && (
              <section>
                <h2 className="text-lg font-medium text-gray-900 mb-5">Sets</h2>
                <div className="grid grid-cols-4 gap-4 md:grid-cols-3 max-[480px]:grid-cols-2">
                  {results.sets.map((set) => (
                    <Link
                      key={set.id}
                      to={`/sets/${set.id}`}
                      className="flex flex-col bg-white rounded-lg overflow-hidden md:border md:border-gray-200 md:shadow-sm hover:opacity-80 transition-opacity"
                    >
                      <div className="h-[180px] bg-white flex items-center justify-center overflow-hidden">
                        <img
                          src={getImageUrl(set.logo_url)}
                          alt={set.name}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                      </div>
                      <div className="px-3 py-2 text-center">
                        <h3 className="text-sm font-normal text-gray-900">{set.name}</h3>
                        {set.code && <p className="text-xs text-gray-400 uppercase mt-0.5">{set.code}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            {results.categories?.length > 0 && (
              <section>
                <h2 className="text-lg font-medium text-gray-900 mb-5">Categories</h2>
                <div className="flex flex-wrap gap-3">
                  {results.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      className="px-5 py-2.5 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default SearchResults;
