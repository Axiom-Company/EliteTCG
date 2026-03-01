import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import PromotionBadge from './PromotionBadge';

const conditionLabels = {
  mint: 'Mint',
  near_mint: 'Near Mint',
  excellent: 'Excellent',
  good: 'Good',
  played: 'Played',
  poor: 'Poor',
};

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const ListingCard = ({ listing }) => {
  const mainImage = listing.images?.[0] || null;
  const hasDiscount = listing.compare_at_price && listing.compare_at_price > listing.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - listing.price / listing.compare_at_price) * 100)
    : 0;

  const hasActivePromotion = listing.promotion_tier &&
    (!listing.promotion_expires_at || new Date(listing.promotion_expires_at) > new Date());

  return (
    <Link
      to={`/marketplace/${listing.id}`}
      className="card-3d group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-300"
    >
      {/* Image */}
      <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-white">
        {mainImage ? (
          <img
            src={getImageUrl(mainImage)}
            alt={listing.title}
            className="w-[75%] h-[75%] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Package className="w-12 h-12 text-gray-200" />
        )}

        {/* Promotion Badge */}
        {hasActivePromotion && (
          <span className="absolute top-2.5 left-2.5">
            <PromotionBadge tier={listing.promotion_tier} />
          </span>
        )}

        {/* Discount Badge (only if not promoted, to avoid overlap) */}
        {!hasActivePromotion && hasDiscount && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-primary text-white">
            -{discountPercent}%
          </span>
        )}

        {/* Graded Badge */}
        {listing.is_graded && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[11px] font-medium rounded-full bg-purple-600 text-white">
            {listing.grading_company} {listing.grade}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">
          {conditionLabels[listing.condition] || listing.condition}
        </span>

        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mt-0.5">
          {listing.title}
        </h3>

        {listing.set_name && (
          <p className="text-xs text-gray-500 truncate">
            {listing.set_name} {listing.card_number && `#${listing.card_number}`}
          </p>
        )}

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-medium text-gray-900">
            R{listing.price?.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              R{listing.compare_at_price?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Seller Info */}
        {listing.seller && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
            <span className="text-xs text-gray-500 truncate flex-1">
              {listing.seller.display_name}
            </span>
            <VerifiedBadge isVerified={listing.seller.is_verified} />
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;
