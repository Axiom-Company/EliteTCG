import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomerAuth } from '../../contexts/AuthContext';
import { PAYMENTS_API_URL } from '../../config/api';
import { createDirectOrder } from '../../services/orderApi';
import { hasCookieConsent } from '../../components/CookieConsent/CookieConsent';
import SEO from '../../components/SEO/SEO';

const CHECKOUT_DETAILS_KEY = 'eliteTCG_checkoutDetails';
const SHIPPING_RATE = 99;
const FREE_SHIPPING_THRESHOLD = 1000;

const formatPrice = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inputClass = "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors";
const labelClass = "text-sm font-medium text-gray-900 leading-none";

const Field = ({ label, optional, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className={labelClass}>
      {label}{optional && <span className="ml-1 font-normal text-gray-400">(optional)</span>}
    </label>
    <input {...props} className={inputClass} />
  </div>
);

const PackCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session } = useCustomerAuth();

  const cards = location.state?.cards || [];
  const setName = location.state?.setName || '';
  const setId = location.state?.setId || '';

  const subtotal = cards.reduce((sum, c) => sum + (c.priceZar || 0), 0);

  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [saveDetails, setSaveDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('payfast');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);

  // Render Turnstile widget
  useEffect(() => {
    if (!turnstileRef.current) return;
    const interval = setInterval(() => {
      if (window.turnstile && turnstileRef.current && turnstileWidgetId.current === null) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAACoC2G7ZIJO4InnC',
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(''),
          theme: 'light',
        });
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const [form, setForm] = useState(() => {
    const defaults = {
      email: user?.email || session?.user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'South Africa',
    };

    try {
      const saved = localStorage.getItem(CHECKOUT_DETAILS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      }
    } catch {}

    return defaults;
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKOUT_DETAILS_KEY);
      setSaveDetails(!!saved);
    } catch {}
  }, []);

  const [shippingQuote, setShippingQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Fetch shipping quote when address fields are complete
  const fetchShippingQuote = useCallback(async (address) => {
    if (!address.address_line1 || !address.city || !address.province || !address.postal_code) return;
    setQuoteLoading(true);
    try {
      const res = await fetch(`${PAYMENTS_API_URL}/shipping/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_line1: address.address_line1,
          city: address.city,
          province: address.province,
          postal_code: address.postal_code,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShippingQuote(data);
      }
    } catch {
      // Fall back to flat rate
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  useEffect(() => {
    const { address_line1, city, province, postal_code } = form;
    if (address_line1 && city && province && postal_code) {
      const timer = setTimeout(() => fetchShippingQuote(form), 600);
      return () => clearTimeout(timer);
    } else {
      setShippingQuote(null);
    }
  }, [form.address_line1, form.city, form.province, form.postal_code, fetchShippingQuote]);

  const dynamicShipping = shippingQuote ? shippingQuote.customer_cost_zar : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE);
  const dynamicTotal = subtotal + dynamicShipping;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cards.length === 0) return;

    if (saveDetails && hasCookieConsent()) {
      localStorage.setItem(CHECKOUT_DETAILS_KEY, JSON.stringify({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        province: form.province,
        postal_code: form.postal_code,
      }));
    } else {
      localStorage.removeItem(CHECKOUT_DETAILS_KEY);
    }

    if (!turnstileToken) {
      toast.error('Please complete the security check');
      return;
    }

    setLoading(true);
    try {
      const result = await createDirectOrder({
        items: cards.map(card => ({
          product_id: card.id,
          name: card.name,
          unit_price_zar: card.priceZar || 0,
          quantity: 1,
          image_url: card.image || null,
        })),
        customer: {
          email: form.email,
          full_name: `${form.first_name} ${form.last_name}`.trim(),
          phone: form.phone || undefined,
        },
        shipping: {
          address_line1: form.address_line1,
          address_line2: form.address_line2 || undefined,
          city: form.city,
          province: form.province,
          postal_code: form.postal_code,
          country: form.country,
          cost_zar: dynamicShipping,
          estimated_days: shippingQuote?.estimated_days || null,
          service_name: shippingQuote?.service_name || null,
        },
        payment_provider: paymentMethod,
        turnstile_token: turnstileToken,
      });

      if (result.order?.id) {
        sessionStorage.setItem('eliteTCG_pendingOrderId', result.order.id);
      }

      if (result.payflex_redirect_url) {
        setRedirecting(true);
        window.location.href = result.payflex_redirect_url;
        return;
      }

      if (result.payment_data && result.payfast_url) {
        setRedirecting(true);
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = result.payfast_url;
        Object.entries(result.payment_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          hiddenForm.appendChild(input);
        });
        document.body.appendChild(hiddenForm);
        hiddenForm.submit();
        return;
      }

      toast.error('Payment gateway unavailable — please try again');
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6">
        <SEO title="Processing" noindex />
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-5" />
          <h1 className="text-xl font-medium text-gray-900 mb-1">Processing your order</h1>
          <p className="text-sm text-gray-500">Redirecting to {paymentMethod === 'payflex' ? 'Payflex' : 'PayFast'} for secure payment...</p>
        </div>
      </section>
    );
  }

  if (cards.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-6">
        <SEO title="Ship Cards" noindex />
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-900 mb-1">No cards to ship</h1>
          <p className="text-sm text-gray-500 mb-6">Open a pack first to get cards</p>
          <Link to="/elite-rips" className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
            Browse Packs
          </Link>
        </div>
      </section>
    );
  }

  const sortedCards = [...cards].sort((a, b) => (b.priceZar || 0) - (a.priceZar || 0));

  return (
    <section className="bg-white min-h-screen">
      <SEO title="Ship Cards — Elite Rips" noindex />

      <div className="container max-w-5xl mx-auto px-6 py-10 md:py-14">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Ship Cards</h1>
            <p className="text-sm text-gray-400 mt-1">{cards.length} {cards.length === 1 ? 'card' : 'cards'} from {setName}</p>
          </div>
          <Link to={`/elite-rips/${setId}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Back to pack
          </Link>
        </div>

        {/* Cards row — full width above form */}
        <div className="mb-10">
          <div className="flex gap-4 overflow-x-auto pb-3">
            {sortedCards.map(card => (
              <div key={card.id} className="shrink-0 w-28 text-center">
                <div className="w-28 aspect-[2.5/3.5] rounded-lg overflow-hidden shadow-sm">
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-gray-800 font-medium mt-1.5">
                  {card.priceZar != null ? `R${formatPrice(card.priceZar)}` : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

            {/* Left — Form */}
            <div className="lg:col-span-7 space-y-10">

              {/* Contact */}
              <div>
                <h2 className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-5">Contact</h2>
                <div className="space-y-4">
                  <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" autoComplete="email" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First name" name="first_name" value={form.first_name} onChange={handleChange} required placeholder="John" autoComplete="given-name" />
                    <Field label="Last name" name="last_name" value={form.last_name} onChange={handleChange} required placeholder="Doe" autoComplete="family-name" />
                  </div>
                  <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+27 12 345 6789" autoComplete="tel" optional />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Shipping */}
              <div>
                <h2 className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-5">Shipping address</h2>
                <div className="space-y-4">
                  <Field label="Address" name="address_line1" value={form.address_line1} onChange={handleChange} required placeholder="Street address" autoComplete="address-line1" />
                  <Field label="Apartment, suite, etc." name="address_line2" value={form.address_line2} onChange={handleChange} placeholder="Apt 4B" autoComplete="address-line2" optional />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City" name="city" value={form.city} onChange={handleChange} required placeholder="Cape Town" autoComplete="address-level2" />
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Province</label>
                      <select name="province" value={form.province} onChange={handleChange} required className={inputClass}>
                        <option value="">Select</option>
                        <option value="Eastern Cape">Eastern Cape</option>
                        <option value="Free State">Free State</option>
                        <option value="Gauteng">Gauteng</option>
                        <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                        <option value="Limpopo">Limpopo</option>
                        <option value="Mpumalanga">Mpumalanga</option>
                        <option value="North West">North West</option>
                        <option value="Northern Cape">Northern Cape</option>
                        <option value="Western Cape">Western Cape</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Postal code" name="postal_code" value={form.postal_code} onChange={handleChange} required placeholder="8001" autoComplete="postal-code" />
                    <div className="flex flex-col gap-2">
                      <label className={labelClass}>Country</label>
                      <input type="text" value="South Africa" disabled className={`${inputClass} bg-gray-50 text-gray-500`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save details */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={saveDetails}
                  onChange={(e) => setSaveDetails(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                  Save my details for next time
                </span>
              </label>

              <div className="border-t border-gray-100" />

              {/* Payment method */}
              <div>
                <h2 className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-5">Payment method</h2>
                <div className="space-y-2.5">
                  <label
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'payfast' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('payfast')}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'payfast'} onChange={() => setPaymentMethod('payfast')} className="w-4 h-4 text-gray-900 focus:ring-gray-900" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">PayFast</p>
                      <p className="text-xs text-gray-400 mt-0.5">Card, EFT, SnapScan, Mobicred</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'payflex' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setPaymentMethod('payflex')}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'payflex'} onChange={() => setPaymentMethod('payflex')} className="w-4 h-4 text-gray-900 focus:ring-gray-900" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Payflex</p>
                      <p className="text-xs text-gray-400 mt-0.5">Pay in 4 interest-free instalments</p>
                    </div>
                    {dynamicTotal > 0 && (
                      <p className="text-xs text-gray-500 whitespace-nowrap">4 x R{Math.ceil(dynamicTotal / 4).toLocaleString()}</p>
                    )}
                  </label>
                </div>
              </div>

              {/* Turnstile */}
              <div ref={turnstileRef} className="flex justify-start" />

              {/* Submit — mobile */}
              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="lg:hidden w-full py-3.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : paymentMethod === 'payflex' ? `Pay in 4 x R${Math.ceil(dynamicTotal / 4).toLocaleString()}` : `Pay R${formatPrice(dynamicTotal)}`}
              </button>
            </div>

            {/* Right — Receipt-style Order summary */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-t-xl px-7 py-8 min-h-[420px]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  {/* Receipt header */}
                  <div className="text-center mb-6">
                    <p className="text-base font-medium tracking-widest uppercase text-gray-800">Elite Rips</p>
                    <p className="text-xs text-gray-400 mt-1.5 tracking-wide">SHIP CARDS</p>
                    <p className="text-[10px] text-gray-300 mt-1 tracking-wider">- - - - - - - - - - - - - - - - - - - -</p>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">SUBTOTAL</span>
                      <span className="text-gray-700">R{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">SHIPPING</span>
                      {quoteLoading ? (
                        <span className="text-gray-400">...</span>
                      ) : dynamicShipping === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        <span className="text-gray-700">R{formatPrice(dynamicShipping)}</span>
                      )}
                    </div>

                    {shippingQuote && (
                      <p className="text-xs text-gray-400 text-right">
                        {shippingQuote.service_name} — Est. {shippingQuote.estimated_days} day{shippingQuote.estimated_days !== 1 ? 's' : ''}
                      </p>
                    )}

                    {!shippingQuote && !quoteLoading && dynamicShipping > 0 && (
                      <p className="text-xs text-gray-400 text-right">
                        Enter address for exact cost
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-300 mt-5 mb-5 tracking-wider text-center">- - - - - - - - - - - - - - - - - - - - - - - -</p>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-900 tracking-wide">TOTAL</span>
                    <span className="text-lg font-medium text-gray-900">R{formatPrice(dynamicTotal)}</span>
                  </div>

                </div>

                {/* Semicircle tear bottom */}
                <div className="relative h-[10px] bg-white" style={{
                  maskImage: 'radial-gradient(circle 8px at 16px 10px, transparent 7.5px, black 8px)',
                  WebkitMaskImage: 'radial-gradient(circle 8px at 16px 10px, transparent 7.5px, black 8px)',
                  maskSize: '32px 10px',
                  WebkitMaskSize: '32px 10px',
                  maskPosition: '0 0',
                  WebkitMaskPosition: '0 0',
                  maskRepeat: 'repeat-x',
                  WebkitMaskRepeat: 'repeat-x',
                }} />

                {/* Submit — desktop */}
                <button
                  type="submit"
                  disabled={loading || !turnstileToken}
                  className="hidden lg:block w-full py-3.5 mt-6 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : paymentMethod === 'payflex' ? `Pay in 4 x R${Math.ceil(dynamicTotal / 4).toLocaleString()}` : `Pay R${formatPrice(dynamicTotal)}`}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </section>
  );
};

export default PackCheckout;
