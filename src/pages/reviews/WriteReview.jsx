import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ELITE_API_URL, getImageUrl } from '../../config/api';

const StarPicker = ({ value, hover, onChange, onHover, onLeave }) => (
  <div className="flex items-center gap-1.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        onMouseEnter={() => onHover(s)}
        onMouseLeave={onLeave}
        className="transition-transform active:scale-90 focus:outline-none"
      >
        <svg
          width="24" height="24" viewBox="0 0 24 24"
          fill="currentColor" stroke="none"
          className={`transition-colors duration-100 ${s <= (hover || value) ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>
    ))}
  </div>
);

const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-2";

const WriteReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useCustomerAuth();

  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: { pathname: `/product/${id}/review` } },
      });
    }
  }, [authLoading, isAuthenticated, id, navigate]);

  // Pre-fill public name from user profile
  useEffect(() => {
    if (user) {
      const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
      setName(displayName);
    }
  }, [user]);

  // Load product info (image + name)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${ELITE_API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProduct(data.product);
      } catch {
        // non-critical
      } finally {
        setProductLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!name.trim()) { setError('Please enter your public name.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${ELITE_API_URL}/api/product-reviews/product/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), title: title.trim(), rating, comment: comment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;
  if (!isAuthenticated) return null;

  if (success) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-start pt-32 px-6 text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-1">Review submitted!</h2>
        <p className="text-sm text-gray-400 mb-8">Thanks for sharing your experience.</p>
        <Link
          to={`/product/${id}`}
          className="text-sm font-medium text-gray-900 underline underline-offset-4"
        >
          Back to product
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col items-center justify-start pt-16 px-6 pb-20">
      <div className="w-full max-w-[360px]">

        {/* Product image + name */}
        <div className="flex flex-col items-center mb-8">
          {productLoading ? (
            <div className="w-20 h-20 bg-gray-100 rounded-2xl animate-pulse mb-3" />
          ) : product?.images?.[0] ? (
            <img
              src={getImageUrl(product.images[0])}
              alt={product?.name}
              className="w-20 h-20 object-contain mb-3"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-50 rounded-2xl mb-3" />
          )}
          {product?.name && (
            <p className="text-xs text-gray-400 text-center max-w-[220px] line-clamp-2 leading-relaxed">{product.name}</p>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-medium text-gray-900 text-center mb-2">Write a review</h1>
        <p className="text-sm text-gray-400 text-center mb-8">Share your experience with this product</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star picker */}
          <div className="flex flex-col items-center gap-2 py-2">
            <StarPicker
              value={rating}
              hover={hover}
              onChange={setRating}
              onHover={setHover}
              onLeave={() => setHover(0)}
            />
            <p className="text-xs text-gray-400 h-4">
              {hover || rating ? ratingLabels[hover || rating] : 'Select a rating'}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className={labelClass}>Review title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarise your experience"
              maxLength={120}
              className={inputClass}
            />
          </div>

          {/* Public name */}
          <div>
            <label className={labelClass}>Your public name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Displayed on your review"
              maxLength={80}
              className={inputClass}
            />
          </div>

          {/* Comment */}
          <div>
            <label className={labelClass}>Review <span className="font-normal text-gray-300">(optional)</span></label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience"
              rows={4}
              maxLength={2000}
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !rating || !name.trim()}
            className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>

          <p className="text-center pt-1">
            <Link to={`/product/${id}`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Cancel
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default WriteReview;
