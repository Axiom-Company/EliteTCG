import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ELITE_API_URL } from '../../config/api';
import ProductCard from '../ProductCard/ProductCard';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${ELITE_API_URL}/api/products?limit=8`);
        const data = await response.json();
        const sorted = (data.products || []).sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        });
        setProducts(sorted);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section id="products" className="py-16 bg-white md:py-10">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-2">Featured Products</h2>
          <p className="text-sm text-gray-500">Hand-picked favorites from our collection</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-400">Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-400">No products available</div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 lg:grid-cols-4 md:grid-cols-3 md:gap-4 max-[480px]:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10" style={{ paddingBottom: '3px' }}>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-250 cursor-pointer"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
