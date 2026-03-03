import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ELITE_API_URL, getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import SEO from '../../components/SEO/SEO';

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

  return (
    <div className="min-h-screen bg-white">
      <SEO title={`Review — ${product?.name}`} noindex />
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* Back */}
        <Link
          to={`/product/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to product
        </Link>

        {/* Product preview */}
        {product && (
          <div className="flex items-center gap-4 mb-8">
            <img
              src={product.images?.[0] ? getImageUrl(product.images[0]) : PLACEHOLDER_IMAGE}
              alt={product.name}
              className="w-14 h-14 object-contain rounded-lg bg-gray-50 shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-gray-900 leading-snug">{product.name}</p>
            </div>
          </div>
        )}

        <h1 className="text-2xl font-medium text-gray-900 mb-8">Write a review</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Star rating */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Rating <span className="text-red-400">*</span></label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('rating', s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none"
                    className={s <= (hovered || form.rating) ? 'text-yellow-400' : 'text-gray-200'}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              ))}
              {form.rating > 0 && (
                <span className="ml-2 text-sm text-gray-400">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
              placeholder="Your name"
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="you@example.com"
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Review title <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Sum it up in one line"
              className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors"
            />
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Review <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={form.comment}
              onChange={e => set('comment', e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Share your experience with this product..."
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{form.comment.length}/2000</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="h-10 w-full rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
