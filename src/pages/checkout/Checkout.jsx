import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../config/api';
import { getShippingQuote } from '../../services/shippingApi';
import { createDirectOrder } from '../../services/orderApi';
import { getPayflexConfiguration, createPayflexOrder } from '../../services/payflexApi';
import SEO from '../../components/SEO/SEO';

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

  // Shipping state
  const [shippingQuote, setShippingQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('payfast');
  const [payflexConfig, setPayflexConfig] = useState(null);

  // Submit state
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch Payflex configuration on mount
  useEffect(() => {
    getPayflexConfiguration().then(setPayflexConfig).catch(() => {});
  }, []);

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

  // Auto-fetch quote when address is complete (only once — don't retry on error)
  useEffect(() => {
    if (
      formData.streetAddress && formData.city && formData.province && formData.postalCode &&
      formData.postalCode.length >= 4 &&
      !shippingQuote && !quoteLoading && !quoteError
    ) {
      fetchQuote();
    }
  }, [formData.streetAddress, formData.city, formData.province, formData.postalCode, shippingQuote, quoteLoading, quoteError, fetchQuote]);

  // Calculate totals
  const shippingCost = shippingQuote?.customer_cost_zar || 0;
  const orderTotal = subtotal + shippingCost;

  // Payflex availability check
  const payflexAvailable = payflexConfig?.available &&
    orderTotal >= parseFloat(payflexConfig.min_amount || '0') &&
    orderTotal <= parseFloat(payflexConfig.max_amount || '0');

  const payflexInstallment = payflexAvailable ? (orderTotal / 4).toFixed(2) : null;

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    if (!shippingQuote) {
      setSubmitError('Please get a shipping quote before proceeding');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order in our backend
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
          method: 'courier_guy',
          address_line1: formData.streetAddress,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postalCode,
          cost_zar: shippingCost,
        },
        payment_provider: paymentMethod,
      });

      // Store order info for success page
      if (data.order) {
        sessionStorage.setItem('lastOrderNumber', data.order.order_number || '');
        sessionStorage.setItem('lastOrderEmail', formData.email);
      }
      sessionStorage.setItem('clearCartOnSuccess', 'true');

      // Step 2: Route to the correct payment provider
      if (paymentMethod === 'payflex' && data.order_number) {
        // Payflex flow: create Payflex order, then redirect
        const pfData = await createPayflexOrder(data.order_number);
        if (pfData.redirect_url) {
          window.location.href = pfData.redirect_url;
        } else {
          throw new Error('Failed to get Payflex checkout URL');
        }
      } else if (data.payment_url && data.payment_data) {
        // PayFast flow: submit hidden form
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
      <SEO title="Checkout" noindex />
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

              {/* ── Delivery Address ── */}
              <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
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
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Shipping quote calculated — see order summary
                      </div>
                    )}
                  </div>
                </section>
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
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
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
                    <div>
                      <span className="text-gray-600">Shipping</span>
                      {shippingQuote && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {shippingQuote.service_name} · {shippingQuote.estimated_days} business day{shippingQuote.estimated_days !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <span className="text-gray-900">
                      {shippingQuote ? (
                        `R${shippingQuote.customer_cost_zar.toFixed(2)}`
                      ) : quoteLoading ? (
                        <span className="text-gray-400 text-xs">Calculating...</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">R{orderTotal.toLocaleString()}</span>
                  </div>

                  {/* Payflex installment breakdown */}
                  {paymentMethod === 'payflex' && payflexInstallment && (
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-gray-400">4 payments of</span>
                      <span className="font-medium" style={{ color: '#00c9a7' }}>R{payflexInstallment}</span>
                    </div>
                  )}
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={loading || !shippingQuote}
                  className="w-full mt-6 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </span>
                  ) : paymentMethod === 'payflex' ? (
                    `Pay R${orderTotal.toLocaleString()} with Payflex`
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
                    {paymentMethod === 'payflex'
                      ? 'Secured by Payflex · 256-bit SSL encryption'
                      : 'Secured by PayFast · 256-bit SSL encryption'
                    }
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
