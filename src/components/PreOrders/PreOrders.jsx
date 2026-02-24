import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3001';

const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'ZAR': return 'R';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return 'R';
  }
};

const PreOrders = () => {
  const [preorders, setPreorders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreorders = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products?badge=preorder`);
        const data = await response.json();
        setPreorders(data.products || []);
      } catch (error) {
        console.error('Error fetching preorders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreorders();
  }, []);

  // Don't render the section if there are no pre-orders
  if (!loading && preorders.length === 0) {
    return null;
  }

  return (
    <section id="preorders" className="py-16 bg-white md:py-10">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-2">Pre-Orders</h2>
          <p className="text-sm text-gray-500">Reserve upcoming sets before they sell out</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading pre-orders...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {preorders.map((item) => (
              <a
                key={item.id}
                href={`/product/${item.slug || item.id}`}
                className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-250 hover:border-gray-300 group cursor-pointer"
              >
                <div className="relative h-48 bg-white flex items-center justify-center overflow-hidden p-3">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0].startsWith('http') ? item.images[0] : `${API_BASE}${item.images[0]}`}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : null}
                  <span className="absolute top-3 right-3 inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full bg-primary text-white">
                    Coming Soon
                  </span>
                </div>

                <div className="p-4 text-center flex-1 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>

                  <div className="mt-auto">
                    <span className="text-lg font-normal text-gray-900">
                      {getCurrencySymbol(item.currency)}{item.price?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PreOrders;
