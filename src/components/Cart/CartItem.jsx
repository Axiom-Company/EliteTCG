import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link
        to={`/product/${item.slug || item.id}`}
        className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0"
      >
        {item.image ? (
          <img
            src={getImageUrl(item.image)}
            alt={item.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${item.slug || item.id}`}
          className="text-sm font-medium text-gray-900 hover:text-gray-600 line-clamp-2 transition-colors"
        >
          {item.name}
        </Link>

        <p className="text-sm text-gray-900 mt-1">
          R{item.price.toLocaleString()}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Decrease quantity"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center text-sm font-medium text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.id)}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          R{(item.price * item.quantity).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
