import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import SEO from '../../components/SEO/SEO';

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const Star = ({ filled, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"
    className={`transition-colors ${filled ? 'text-yellow-400' : 'text-gray-200'}`}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const WriteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', rating: 0, title: '', comment: '',
  });
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${ELITE_API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data.product);
      } catch {
        toast.error('Could not load product');
        navigate(`/product/${id}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const set = (name, value) => setForm(p => ({ ...p, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please select a star rating'); return; }
    if (!form.name.trim()) { toast.error('Name is required'); return; }

    setSubmitting(true);
    try {
      const res = await fetch(`${ELITE_API_URL}/api/product-reviews/product/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          rating: form.rating,
          title: form.title.trim() || undefined,
          comment: form.comment.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      toast.success('Review submitted!');
      navigate(`/product/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  const activeRating = hovered || form.rating;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={`Review — ${product?.name}`} noindex />

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center">
          <Link
            to={`/product/${id}`}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </Link>
          <span className="flex-1 text-center text-sm font-medium text-gray-900">Write a Review</span>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 md:py-10">

        {/* Product card */}
        {product && (
          <div className="bg-white rounded-2xl p-4 flex items-center gap-4 mb-6 border border-gray-100">
            <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={product.images?.[0] ? getImageUrl(product.images[0]) : PLACEHOLDER_IMAGE}
                alt={product.name}
                className="w-[80%] h-[80%] object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{product.name}</p>
              <p className="text-sm text-gray-400 mt-0.5">R{Number(product.price || 0).toLocaleString()}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Star rating — big and tappable */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-900 mb-3">How would you rate this product?</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('rating', s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-1 transition-transform active:scale-90 hover:scale-110"
                >
                  <Star filled={s <= activeRating} size={32} />
                </button>
              ))}
              {activeRating > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-500">
                  {RATING_LABELS[activeRating]}
                </span>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                placeholder="Your name"
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">
                Email <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all"
              />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">
                Review title <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Sum it up in a few words"
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all"
              />
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-900">
                Your review <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                value={form.comment}
                onChange={e => set('comment', e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Tell others what you think about this product..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 focus:bg-white transition-all resize-none leading-relaxed"
              />
              <p className="text-xs text-gray-300 text-right">{form.comment.length}/2000</p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || form.rating === 0}
            className="w-full py-3.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.98] transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : 'Submit Review'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Your review will be visible to other customers after submission.
          </p>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
