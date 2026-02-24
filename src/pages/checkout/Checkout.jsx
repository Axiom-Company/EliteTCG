import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const API_BASE_URL = 'http://localhost:3001';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const provinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape'
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, subtotal, shipping, total } = useCart();
  const { user, isAuthenticated, getToken } = useCustomerAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    apartment: '',
    city: '',
    province: '',
    postalCode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || ''
      }));
    }
  }, [isAuthenticated, user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/products');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
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

    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street_address: formData.streetAddress,
          apartment: formData.apartment || null,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postalCode,
          country: 'South Africa'
        }
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      // Add auth token if authenticated
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Store order ID for success page
      sessionStorage.setItem('lastOrderId', data.order.id);
      sessionStorage.setItem('lastOrderNumber', data.order.order_number);

      // Store cart clear flag - cart will be cleared on success page
      sessionStorage.setItem('clearCartOnSuccess', 'true');

      // Redirect to PayFast
      if (data.payment?.url) {
        window.location.href = data.payment.url;
      } else if (data.payment?.form_html) {
        // Submit form
        const container = document.createElement('div');
        container.innerHTML = data.payment.form_html;
        document.body.appendChild(container);
        container.querySelector('form').submit();
      }
    } catch (err) {
      setSubmitError(err.message);
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/products" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Back to shopping
          </Link>
          <h1 className="text-2xl font-medium text-gray-900 mt-4">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Shipping Form */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Information</h2>

              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${
                        errors.firstName ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${
                        errors.lastName ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Contact Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${
                        errors.email ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+27"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${
                        errors.phone ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${
                      errors.streetAddress ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.streetAddress && <p className="text-xs text-red-500 mt-1">{errors.streetAddress}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                  />
                </div>

                {/* City & Province */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${
                        errors.city ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Province</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${
                        errors.province ? 'border-red-300' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select province</option>
                      {provinces.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
                  </div>
                </div>

                {/* Postal Code */}
                <div className="max-w-[200px]">
                  <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all ${
                      errors.postalCode ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div>
              <div className="bg-gray-50 rounded-2xl p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-contain p-1"
                          />
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
                      {shipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `R${shipping}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-medium pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">R{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Pay with PayFast'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You will be redirected to PayFast to complete your payment securely.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
