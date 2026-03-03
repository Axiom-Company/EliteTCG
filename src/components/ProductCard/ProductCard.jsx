import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';

const getBadgeStyle = (badge) => {
  switch (badge?.toLowerCase()) {
    case 'hot':      return 'bg-[#E3350D] text-white';
    case 'sale':     return 'bg-[#E3350D] text-white';
    case 'new':      return 'bg-[#FFCB32] text-gray-900';
    case 'limited':  return 'bg-gray-900 text-white';
    case 'preorder': return 'bg-blue-600 text-white';
    default:         return 'bg-gray-900 text-white';
  }
};

const formatPrice = (product) => {
  const symbol = product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : 'R';
  return `${symbol}${Number(product.price || 0).toLocaleString()}`;
};

const formatComparePrice = (product) => {
  if (!product.compare_at_price) return null;
  const symbol = product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : 'R';
  return `${symbol}${Number(product.compare_at_price).toLocaleString()}`;
};

const getDiscountPct = (product) => {
  if (!product.compare_at_price || !product.price) return null;
  const pct = Math.round((1 - product.price / product.compare_at_price) * 100);
  return pct > 0 ? pct : null;
};

// showWishlist — show the heart toggle (wishlist page)
const ProductCard = ({ product, showWishlist = false, imageSize = '75%' }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();

  const comparePrice = formatComparePrice(product);
  const discountPct = getDiscountPct(product);
  const wishlisted = isWishlisted(product.id);
  const isOutOfStock = product.inventory?.quantity === 0;
  const isLowStock =
    product.inventory?.quantity > 0 &&
    product.inventory?.quantity <= (product.inventory?.low_stock_threshold ?? 5);

  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-white">
        {product.images?.[0] ? (
          <>
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              style={{ width: imageSize, height: imageSize }}
              className={`object-contain transition-opacity duration-300 ${product.images.length > 1 ? 'group-hover:opacity-0' : ''}`}
            />
            {product.images.length > 1 && (
              <img
                src={getImageUrl(product.images[1])}
                alt={product.name}
                style={{ width: imageSize, height: imageSize }}
                className="object-contain absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
          </>
        ) : (
          <img
            src={PLACEHOLDER_IMAGE}
            alt="Product image not available"
            style={{ width: imageSize, height: imageSize }}
            className="object-contain"
          />
        )}

        {/* Badge — discount % takes priority */}
        {!isOutOfStock && (discountPct ? (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-gray-900 text-white">
            -{discountPct}%
          </span>
        ) : product.badge && product.badge !== 'none' && (
          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full capitalize tracking-wide ${getBadgeStyle(product.badge)}`}>
            {product.badge}
          </span>
        ))}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-end justify-center pb-4">
            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Out of stock
            </span>
          </div>
        )}

        {/* Wishlist heart */}
        {showWishlist && (
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-red-500 transition-all duration-150 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-[16px] font-medium text-gray-900 line-clamp-2 leading-snug mt-0.5">
          {product.name}
        </h3>

        {/* Stars */}
        {(() => {
          const count = product.review_count ?? 0;
          const rating = count > 0 ? Math.round(product.rating || 0) : 0;
          return (
            <div className="flex items-center gap-1 mt-0.5">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} width="16" height="16" viewBox="0 0 24 24"
                  fill="currentColor" stroke="none"
                  className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
              <span className="text-[13px] text-gray-400 ml-0.5">({count})</span>
            </div>
          );
        })()}

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-medium text-gray-900">{formatPrice(product)}</span>
          {comparePrice && (
            <span className="text-sm text-gray-400 line-through">{comparePrice}</span>
          )}
        </div>
        {isLowStock && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
            Only {product.inventory.quantity} left
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
