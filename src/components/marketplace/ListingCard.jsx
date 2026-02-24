import { Link } from 'react-router-dom';

const conditionLabels = {
  mint: 'Mint',
  near_mint: 'Near Mint',
  excellent: 'Excellent',
  good: 'Good',
  played: 'Played',
  poor: 'Poor'
};

const conditionColors = {
  mint: 'bg-green-100 text-green-800',
  near_mint: 'bg-emerald-100 text-emerald-800',
  excellent: 'bg-blue-100 text-blue-800',
  good: 'bg-yellow-100 text-yellow-800',
  played: 'bg-orange-100 text-orange-800',
  poor: 'bg-red-100 text-red-800'
};

const ListingCard = ({ listing }) => {
  const mainImage = listing.images?.[0] || null;
  const hasDiscount = listing.compare_at_price && listing.compare_at_price > listing.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - listing.price / listing.compare_at_price) * 100)
    : 0;

  return (
    <Link
      to={`/marketplace/${listing.id}`}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        )}

        {/* Graded Badge */}
        {listing.is_graded && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded">
            {listing.grading_company} {listing.grade}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Condition Badge */}
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${conditionColors[listing.condition]}`}>
          {conditionLabels[listing.condition]}
        </span>

        {/* Title */}
        <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>

        {/* Card Details */}
        {listing.set_name && (
          <p className="mt-1 text-xs text-gray-500 truncate">
            {listing.set_name} {listing.card_number && `#${listing.card_number}`}
          </p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            R{listing.price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              R{listing.compare_at_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Seller Info */}
        {listing.seller && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 truncate">
              {listing.seller.display_name}
            </span>
            {listing.seller.location_city && (
              <span className="text-xs text-gray-400 truncate">
                {listing.seller.location_city}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {listing.view_count || 0}
          </span>
          {listing.quantity > 1 && (
            <span>{listing.quantity} available</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
