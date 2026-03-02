import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ShieldCheck, Star, ChevronRight, MessageCircle, ShoppingBag } from 'lucide-react';
import VerifiedBadge from '../../components/marketplace/VerifiedBadge';
import PromotionBadge from '../../components/marketplace/PromotionBadge';
import ReviewList from '../../components/marketplace/ReviewList';

import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import SEO from '../../components/SEO/SEO';

const conditionLabels = {
  mint: 'Mint',
  near_mint: 'Near Mint',
  excellent: 'Excellent',
  good: 'Good',
  played: 'Played',
  poor: 'Poor'
};

const conditionDescriptions = {
  mint: 'Perfect condition, no visible wear or damage',
  near_mint: 'Very minor wear, nearly perfect',
  excellent: 'Light wear, minor edge wear possible',
  good: 'Moderate wear, some edge wear and light scratches',
  played: 'Heavy wear, noticeable scratches and edge wear',
  poor: 'Significant damage, creases, or heavy wear'
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useCustomerAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const headers = {};
        if (isAuthenticated) {
          headers['Authorization'] = `Bearer ${getToken()}`;
        }

        const res = await fetch(`${ELITE_API_URL}/api/marketplace/listings/${id}`, { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Listing not found');
        }

        setListing(data.listing);

        fetch(`${ELITE_API_URL}/api/marketplace/listings/${id}/view`, {
          method: 'POST',
          headers
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, isAuthenticated, getToken]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
        <p className="text-gray-600 mb-8">{error || 'This listing may have been removed or sold.'}</p>
        <Link to="/marketplace" className="text-gray-900 font-medium hover:underline">
          Browse other listings
        </Link>
      </div>
    );
  }

  const hasDiscount = listing.compare_at_price && listing.compare_at_price > listing.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - listing.price / listing.compare_at_price) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {listing && <SEO title={listing.title} description={`${listing.title} - ${listing.condition ? listing.condition.replace('_', ' ') : ''} condition. R${Number(listing.price).toLocaleString()}`} path={`/marketplace/${id}`} image={listing.images?.[0] ? getImageUrl(listing.images[0]) : undefined} type="product" />}
      {/* Breadcrumb */}
      <nav className="text-sm mb-8">
        <ol className="flex items-center gap-1.5 text-gray-500">
          <li><Link to="/" className="hover:text-gray-900">Home</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li><Link to="/marketplace" className="hover:text-gray-900">Marketplace</Link></li>
          <li><ChevronRight className="w-3.5 h-3.5" /></li>
          <li className="text-gray-900 truncate max-w-[200px]">{listing.title}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={getImageUrl(listing.images?.[selectedImage])}
              alt={listing.title}
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
            />
          </div>

          {listing.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? 'border-gray-900' : 'border-gray-200'
                  }`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {listing.promotion_tier && listing.promotion_expires_at && new Date(listing.promotion_expires_at) > new Date() && (
              <PromotionBadge tier={listing.promotion_tier} />
            )}
            {listing.status !== 'active' && (
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                listing.status === 'sold' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {listing.status === 'sold' ? 'Sold' : 'Paused'}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>

          {listing.set_name && (
            <p className="text-gray-600 mb-6">
              {listing.set_name} {listing.card_number && `#${listing.card_number}`}
            </p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-3xl font-bold text-gray-900">
              R{listing.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  R{listing.compare_at_price.toLocaleString()}
                </span>
                <span className="bg-[#FFCB32] text-gray-900 text-sm font-medium px-2 py-1 rounded">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Market value reference */}
          {listing.market_price_zar ? (
            <p className="text-sm text-gray-500 mb-8">
              Market value: <span className="font-medium">R{listing.market_price_zar.toLocaleString()}</span>
            </p>
          ) : (
            <div className="mb-5" />
          )}

          {/* Condition */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-500">Condition</span>
              <span className="font-medium text-gray-900">{conditionLabels[listing.condition]}</span>
            </div>
            <p className="text-sm text-gray-500">{conditionDescriptions[listing.condition]}</p>
          </div>

          {/* Grading */}
          {listing.is_graded && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Grading</p>
              <p className="font-medium text-gray-900">
                {listing.grading_company} {listing.grade}
                {listing.certificate_number && ` · Cert #${listing.certificate_number}`}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">Language</p>
              <p className="font-medium text-gray-900">{listing.language || 'English'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium text-gray-900 capitalize">{listing.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="font-medium text-gray-900">{listing.quantity} in stock</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Views</p>
              <p className="font-medium text-gray-900">{listing.view_count || 0}</p>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Description</p>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {listing.is_negotiable && (
            <p className="text-sm text-gray-600 mb-6">
              Price is negotiable - contact the seller to discuss
            </p>
          )}

          {/* Action Buttons */}
          {listing.status === 'active' && listing.seller && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                    return;
                  }
                  navigate(`/marketplace/checkout/${listing.id}`);
                }}
                className="w-full py-3 px-6 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Buy Now
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-full hover:border-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Seller
              </button>
            </div>
          )}

          {/* Seller Info */}
          {listing.seller && (
            <div className="mt-6 flex items-center gap-4 py-4">
              <div className="w-12 h-12 bg-[#FFCB32] rounded-full flex items-center justify-center text-gray-900 font-medium">
                {listing.seller.display_name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{listing.seller.display_name}</p>
                  <VerifiedBadge isVerified={listing.seller.is_verified} />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {listing.seller.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {listing.seller.rating}
                      {listing.seller.review_count > 0 && ` (${listing.seller.review_count})`}
                    </span>
                  )}
                  {listing.seller.location_city && (
                    <span>{listing.seller.rating > 0 ? ' · ' : ''}{listing.seller.location_city}</span>
                  )}
                  <span>{listing.seller.location_city ? ' · ' : ''}{listing.seller.total_sales || 0} sales</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Seller Reviews */}
      {listing.seller && (
        <div className="mt-12 border-t border-gray-200 pt-10">
          <ReviewList sellerId={listing.seller.id} />
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && listing.seller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Contact {listing.seller.display_name}</h2>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            <div className="space-y-3">
              {listing.seller.contact_whatsapp && (
                <a
                  href={`https://wa.me/${listing.seller.contact_whatsapp.replace(/\D/g, '')}?text=Hi, I'm interested in your listing: ${listing.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                    W
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <p className="text-sm text-gray-500">{listing.seller.contact_whatsapp}</p>
                  </div>
                </a>
              )}

              {listing.seller.contact_phone && (
                <a
                  href={`tel:${listing.seller.contact_phone}`}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium">
                    P
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">{listing.seller.contact_phone}</p>
                  </div>
                </a>
              )}

              {listing.seller.contact_email && (
                <a
                  href={`mailto:${listing.seller.contact_email}?subject=Inquiry about: ${listing.title}`}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-900 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                    E
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-500">{listing.seller.contact_email}</p>
                  </div>
                </a>
              )}
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full py-2.5 border border-gray-300 rounded-full text-gray-700 hover:border-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
