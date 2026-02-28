import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { getImageUrl } from '../../config/api';
import { getShippingQuote } from '../../services/shippingApi';
import { createDirectOrder } from '../../services/orderApi';
import courierGuyLogo from '../../assets/images/The-courier-guy.webp';

const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useCustomerAuth();

  // Form state
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    streetAddress: '', apartment: '', city: '', province: '', postalCode: ''
  });
  const [errors, setErrors] = useState({});

  // Shipping method state
  const [shippingMethod, setShippingMethod] = useState('courier_guy');
  const [shippingQuote, setShippingQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // Submit state
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Pre-fill authenticated user
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || user.name?.split(' ')[0] || '',
        lastName: user.last_name || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Redirect if cart empty
  useEffect(() => {
    if (cart.length === 0) navigate('/products');
  }, [cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    // Clear quote when address changes
    if (['streetAddress', 'city', 'province', 'postalCode'].includes(name)) {
      setShippingQuote(null);
      setQuoteError(null);
    }
  };

  // Fetch live Courier Guy shipping quote
  const fetchQuote = useCallback(async () => {
    if (!formData.streetAddress || !formData.city || !formData.province || !formData.postalCode) {
      setQuoteError('Please fill in your address first');
      return;
    }

    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const quote = await getShippingQuote({
        address_line1: formData.streetAddress,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postalCode,
      });
      setShippingQuote(quote);
    } catch (err) {
      setQuoteError(err.message);
    } finally {
      setQuoteLoading(false);
    }
  }, [formData.streetAddress, formData.city, formData.province, formData.postalCode]);

  // Auto-fetch quote when address is complete and courier_guy is selected
  useEffect(() => {
    if (
      shippingMethod === 'courier_guy' &&
      formData.streetAddress && formData.city && formData.province && formData.postalCode &&
      formData.postalCode.length >= 4 &&
      !shippingQuote && !quoteLoading
    ) {
      fetchQuote();
    }
  }, [shippingMethod, formData.streetAddress, formData.city, formData.province, formData.postalCode, shippingQuote, quoteLoading, fetchQuote]);

  // Calculate totals
  const shippingCost = shippingMethod === 'collection' ? 0 : (shippingQuote?.customer_cost_zar || 0);
  const orderTotal = subtotal + shippingCost;

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (shippingMethod === 'courier_guy') {
      if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.province) newErrors.province = 'Province is required';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    if (shippingMethod === 'courier_guy' && !shippingQuote) {
      setSubmitError('Please get a shipping quote before proceeding');
      return;
    }

    setLoading(true);

    try {
      const data = await createDirectOrder({
        items: cart.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit_price_zar: item.price,
          image_url: item.image || null,
        })),
        customer: {
          email: formData.email,
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
        },
        shipping: {
          method: shippingMethod,
          address_line1: formData.streetAddress || 'Collection',
          city: formData.city || 'N/A',
          province: formData.province || 'Gauteng',
          postal_code: formData.postalCode || '0000',
          cost_zar: shippingCost,
        },
      });

      // Store order info for success page
      if (data.order) {
        sessionStorage.setItem('lastOrderNumber', data.order.order_number || '');
        sessionStorage.setItem('lastOrderEmail', formData.email);
      }
      sessionStorage.setItem('clearCartOnSuccess', 'true');

      // Redirect to PayFast
      if (data.payment_url && data.payment_data) {
        // Build and submit a form to PayFast
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
      }
    } catch (err) {
      setSubmitError(err.message);
      setLoading(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link to="/products" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Back to shopping
          </Link>
          <h1 className="text-2xl font-medium text-gray-900 mt-4">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your order securely</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column — Form (3 cols) */}
            <div className="lg:col-span-3 space-y-10">

              {/* ── Contact Information ── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
                </div>

                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {submitError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">First Name</label>
                      <input
                        type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.firstName ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.lastName ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Phone</label>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+27"
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.phone ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Shipping Method ── */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <h2 className="text-lg font-medium text-gray-900">Shipping Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Courier Guy */}
                  <button
                    type="button"
                    onClick={() => setShippingMethod('courier_guy')}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      shippingMethod === 'courier_guy'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        shippingMethod === 'courier_guy' ? 'border-gray-900' : 'border-gray-300'
                      }`}>
                        {shippingMethod === 'courier_guy' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                      </div>
                      <img src={courierGuyLogo} alt="Courier Guy" className="w-8 h-8 object-contain shrink-0 rounded" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Courier Guy Delivery</p>
                        <p className="text-xs text-gray-500 mt-1">Door-to-door delivery across South Africa</p>
                        {shippingQuote && shippingMethod === 'courier_guy' && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-900">R{shippingQuote.customer_cost_zar.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {shippingQuote.estimated_days} business day{shippingQuote.estimated_days !== 1 ? 's' : ''} · {shippingQuote.service_name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Collection */}
                  <button
                    type="button"
                    onClick={() => { setShippingMethod('collection'); setShippingQuote(null); setQuoteError(null); }}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      shippingMethod === 'collection'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        shippingMethod === 'collection' ? 'border-gray-900' : 'border-gray-300'
                      }`}>
                        {shippingMethod === 'collection' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                      </div>
                      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                        <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Local Collection</p>
                        <p className="text-xs text-gray-500 mt-1">Pick up from our location — free</p>
                        {shippingMethod === 'collection' && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-green-600">FREE</p>
                            <p className="text-xs text-gray-500 mt-0.5">Collect at arranged time</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </section>

              {/* ── Delivery Address (only for courier) ── */}
              {shippingMethod === 'courier_guy' && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <h2 className="text-lg font-medium text-gray-900">Delivery Address</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                      <input
                        type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.streetAddress ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.streetAddress && <p className="text-xs text-red-500 mt-1">{errors.streetAddress}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Apartment, suite, etc. (optional)</label>
                      <input
                        type="text" name="apartment" value={formData.apartment} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">City</label>
                        <input
                          type="text" name="city" value={formData.city} onChange={handleChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.city ? 'border-red-300' : 'border-gray-200'}`}
                        />
                        {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Province</label>
                        <select
                          name="province" value={formData.province} onChange={handleChange}
                          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.province ? 'border-red-300' : 'border-gray-200'}`}
                        >
                          <option value="">Select province</option>
                          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                      </div>
                    </div>
                    <div className="max-w-[200px]">
                      <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                      <input
                        type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} maxLength={5}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${errors.postalCode ? 'border-red-300' : 'border-gray-200'}`}
                      />
                      {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                    </div>

                    {/* Quote status */}
                    {quoteLoading && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                        Getting shipping quote from Courier Guy...
                      </div>
                    )}
                    {quoteError && (
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{quoteError}</p>
                        <button type="button" onClick={fetchQuote}
                          className="text-sm font-medium text-red-700 hover:text-red-800 underline ml-4">
                          Retry
                        </button>
                      </div>
                    )}
                    {!quoteLoading && !quoteError && !shippingQuote && formData.streetAddress && formData.city && formData.province && formData.postalCode && (
                      <button type="button" onClick={fetchQuote}
                        className="text-sm font-medium text-gray-900 underline hover:no-underline">
                        Get shipping quote
                      </button>
                    )}
                    {shippingQuote && !quoteLoading && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">Shipping quote ready</p>
                            <p className="text-xs text-green-700 mt-0.5">
                              {shippingQuote.service_name} · {shippingQuote.estimated_days} business day{shippingQuote.estimated_days !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <p className="text-lg font-medium text-green-800">R{shippingQuote.customer_cost_zar.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column — Order Summary (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-2xl p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        R{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">R{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {shippingMethod === 'collection' ? (
                        <span className="text-green-600">FREE</span>
                      ) : shippingQuote ? (
                        `R${shippingQuote.customer_cost_zar.toFixed(2)}`
                      ) : quoteLoading ? (
                        <span className="text-gray-400">Calculating...</span>
                      ) : (
                        <span className="text-gray-400">Get quote</span>
                      )}
                    </span>
                  </div>
                  {shippingQuote && shippingMethod === 'courier_guy' && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Est. delivery</span>
                      <span className="text-gray-500">{shippingQuote.estimated_days} business days</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">R{orderTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={loading || (shippingMethod === 'courier_guy' && !shippingQuote)}
                  className="w-full mt-6 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </span>
                  ) : (
                    `Pay R${orderTotal.toLocaleString()} with PayFast`
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

export default Checkout;
