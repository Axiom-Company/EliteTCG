import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { ChevronRight, ShoppingBag, MapPin } from 'lucide-react';
import { ELITE_API_URL, PAYMENTS_API_URL } from '../../config/api';

const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
];

const conditionLabels = {
  mint: 'Mint',
  near_mint: 'Near Mint',
  excellent: 'Excellent',
  good: 'Good',
  played: 'Played',
  poor: 'Poor'
};

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${ELITE_API_URL}${url}`;
};

const MarketplaceCheckout = () => {
  const { listingId } = useParams();
  const { isAuthenticated, user, getToken } = useCustomerAuth();

  // Listing state
  const [listing, setListing] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'South Africa'
  });
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Pre-fill from authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      setFetchLoading(true);
      setFetchError(null);

      try {
        const headers = {};
        if (isAuthenticated) {
          const token = getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        const res = await fetch(`${ELITE_API_URL}/api/marketplace/listings/${listingId}`, { headers });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load listing');
        }

        if (!data.listing || data.listing.status !== 'active') {
          throw new Error('This listing is no longer available');
        }

        setListing(data.listing);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setFetchLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId, isAuthenticated, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= (listing?.quantity || 1)) {
      setQuantity(val);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.line1.trim()) newErrors.line1 = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    } else if (!/^\d{4,5}$/.test(formData.postal_code.trim())) {
      newErrors.postal_code = 'Enter a valid postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;
    if (!listing) return;

    setSubmitting(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (isAuthenticated) {
        const token = getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const payload = {
        listing_id: listing.id,
        quantity,
        buyer_email: formData.email.trim(),
        buyer_name: formData.name.trim(),
        buyer_phone: formData.phone.trim() || null,
        shipping_address: {
          line1: formData.line1.trim(),
          line2: formData.line2.trim() || null,
          city: formData.city.trim(),
          province: formData.province,
          postal_code: formData.postal_code.trim(),
          country: formData.country
        }
      };

      const res = await fetch(`${PAYMENTS_API_URL}/marketplace/payfast/create-payment`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Redirect via PayFast form submission or direct URL
      if (data.payment_url && data.payment_data) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payment_url;
        Object.entries(data.payment_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else if (data.payment_url) {
        window.location.href = data.payment_url;
      } else if (data.form_html) {
        // If the API returns raw form HTML, inject and submit it
        const container = document.createElement('div');
        container.innerHTML = data.form_html;
        document.body.appendChild(container);
        const embeddedForm = container.querySelector('form');
        if (embeddedForm) {
          embeddedForm.submit();
        }
      } else {
        throw new Error('No payment redirect received from server');
      }
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  // Computed totals
  const unitPrice = listing?.price || 0;
  const subtotal = unitPrice * quantity;
  const total = subtotal;

  // Loading state
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Listing Not Available</h1>
          <p className="text-gray-600 mb-8">{fetchError || 'This listing could not be found.'}</p>
          <Link
            to="/marketplace"
            className="px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors inline-block"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const listingImage = listing.images?.[0] ? getImageUrl(listing.images[0]) : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-8">
          <ol className="flex items-center gap-1.5 text-gray-500">
            <li><Link to="/" className="hover:text-gray-900 transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li><Link to="/marketplace" className="hover:text-gray-900 transition-colors">Marketplace</Link></li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-gray-900">Checkout</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-medium text-gray-900">Marketplace Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your purchase securely</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column - Form (3 cols) */}
            <div className="lg:col-span-3 space-y-10">

              {/* Listing Preview */}
              <section className="p-5 bg-gray-50 rounded-2xl">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0">
                    {listingImage ? (
                      <img src={listingImage} alt={listing.title} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">{conditionLabels[listing.condition] || listing.condition}</span>
                      {listing.seller?.display_name && (
                        <span className="text-sm text-gray-400">by {listing.seller.display_name}</span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-gray-900 mt-1">R{listing.price.toLocaleString()}</p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <h2 className="text-lg font-medium text-gray-900">Your Information</h2>
                </div>

                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {submitError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phone <span className="text-gray-400">(optional)</span></label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+27"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      name="line1"
                      value={formData.line1}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.line1 ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Apartment, suite, etc. <span className="text-gray-400">(optional)</span></label>
                    <input
                      type="text"
                      name="line2"
                      value={formData.line2}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.city ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Province</label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.province ? 'border-red-300' : 'border-gray-200'}`}
                      >
                        <option value="">Select province</option>
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleChange}
                        maxLength={5}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.postal_code ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.postal_code && <p className="text-xs text-red-500 mt-1">{errors.postal_code}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Quantity */}
              {listing.quantity > 1 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <h2 className="text-lg font-medium text-gray-900">Quantity</h2>
                  </div>
                  <div className="max-w-[160px]">
                    <select
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                    >
                      {Array.from({ length: listing.quantity }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">{listing.quantity} available</p>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Order Summary (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-2xl p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                {/* Item */}
                <div className="flex gap-4 mb-6">
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                    {listingImage ? (
                      <img src={listingImage} alt={listing.title} className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">{listing.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900 shrink-0">
                    R{subtotal.toLocaleString()}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">R{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform fee</span>
                    <span className="text-gray-500">Included</span>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">R{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-6 py-3.5 bg-[#E3350D] text-white text-sm font-medium rounded-full hover:bg-[#c92d0b] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </span>
                  ) : (
                    `Pay R${total.toLocaleString()} with PayFast`
                  )}
                </button>

                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs text-gray-400">
                    Secured by PayFast · 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketplaceCheckout;
