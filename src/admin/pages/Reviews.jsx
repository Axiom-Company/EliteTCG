import { useState, useEffect, useCallback } from 'react';
import { productReviewsApi, useApiCall } from '../hooks/useApi';
import { Trash2, Star, MessageSquare, Search, X } from 'lucide-react';

const StarDisplay = ({ rating, size = 'sm' }) => {
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-[#333]'}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { loading, execute } = useApiCall();

  const loadReviews = useCallback(async () => {
    try {
      const data = await execute(() => productReviewsApi.getAll({ limit: 200 }));
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch {
      // error handled by hook
    }
  }, [execute]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await execute(() => productReviewsApi.delete(id));
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotal((t) => t - 1);
    } catch {
      // error handled by hook
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.products?.name?.toLowerCase().includes(q)
    );
  });

  // Compute average rating of displayed reviews
  const avgRating = filtered.length
    ? (filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#f1f1f1]">Reviews</h1>
          <p className="text-sm text-[#6b6b6b] mt-0.5">{total} total review{total !== 1 ? 's' : ''}</p>
        </div>
        {avgRating && (
          <div className="flex items-center gap-2 bg-[#171717] border border-[#282828] rounded-xl px-4 py-2.5">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" strokeWidth={1.5} />
            <span className="text-[#f1f1f1] font-medium text-sm">{avgRating}</span>
            <span className="text-[#6b6b6b] text-sm">avg rating</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b6b]" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Search by reviewer, product, or comment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#171717] border border-[#282828] text-[#f1f1f1] placeholder-[#4a4a4a] rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:border-[#444]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#f1f1f1] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-5 h-5 border-2 border-[#282828] border-t-[#f1f1f1] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-[#282828] bg-[#111111] rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 bg-[#1c1c1c] rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="w-5 h-5 text-[#444]" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-[#c4c4c4]">
            {search ? 'No reviews match your search' : 'No reviews yet'}
          </p>
          <p className="text-xs text-[#4a4a4a] mt-1">
            {search ? 'Try a different query' : 'Reviews will appear here once customers submit them'}
          </p>
        </div>
      ) : (
        <div className="border border-[#282828] bg-[#111111] rounded-2xl overflow-hidden">
          {/* Table header — desktop */}
          <div className="hidden md:grid grid-cols-[1fr_auto_180px_auto] gap-4 px-5 py-3 border-b border-[#1c1c1c] text-xs font-medium text-[#6b6b6b] uppercase tracking-wider">
            <span>Review</span>
            <span>Rating</span>
            <span>Product</span>
            <span></span>
          </div>

          <div className="divide-y divide-[#1c1c1c]">
            {filtered.map((review) => (
              <div
                key={review.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_auto_180px_auto] md:gap-4 px-5 py-4 gap-2 group"
              >
                {/* Reviewer + comment */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#222] flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-[#888]">
                        {review.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[#e0e0e0]">{review.name}</span>
                    <span className="text-xs text-[#4a4a4a]">{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment ? (
                    <p className="text-sm text-[#888] leading-relaxed line-clamp-2 ml-9">
                      {review.comment}
                    </p>
                  ) : (
                    <p className="text-xs text-[#4a4a4a] italic ml-9">No comment</p>
                  )}
                  {/* Mobile: rating + product */}
                  <div className="flex items-center gap-3 ml-9 md:hidden mt-0.5">
                    <StarDisplay rating={review.rating} />
                    {review.products?.name && (
                      <span className="text-xs text-[#6b6b6b] truncate">{review.products.name}</span>
                    )}
                  </div>
                </div>

                {/* Rating — desktop */}
                <div className="hidden md:flex items-center">
                  <StarDisplay rating={review.rating} />
                </div>

                {/* Product — desktop */}
                <div className="hidden md:flex items-center min-w-0">
                  {review.products?.name ? (
                    <span className="text-sm text-[#888] truncate" title={review.products.name}>
                      {review.products.name}
                    </span>
                  ) : (
                    <span className="text-xs text-[#4a4a4a] italic">Unknown product</span>
                  )}
                </div>

                {/* Delete */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="w-8 h-8 flex items-center justify-center text-[#4a4a4a] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Delete review"
                  >
                    {deletingId === review.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
