import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { toast } from 'sonner';
import SEO from '../../components/SEO/SEO';

const CardFanIllustration = () => (
  <svg viewBox="0 0 260 300" fill="none" className="w-64 h-auto mx-auto" style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}>
    {/* Dashed decorative ring */}
    <circle cx="130" cy="148" r="100" stroke="rgba(0,0,0,0.06)" strokeWidth="1.2" strokeDasharray="5 5" fill="none" />

    {/* Soft ground shadow */}
    <ellipse cx="130" cy="260" rx="55" ry="6" fill="rgba(0,0,0,0.04)" />

    {/* Left card */}
    <g transform="rotate(-14 130 240)">
      <rect x="80" y="80" width="100" height="145" rx="12" fill="#1a1a2e" stroke="white" strokeWidth="1.5" opacity="0.88" />
      <rect x="89" y="89" width="82" height="127" rx="8" stroke="white" strokeWidth="0.5" opacity="0.1" fill="none" />
    </g>

    {/* Center card */}
    <g>
      <rect x="80" y="80" width="100" height="145" rx="12" fill="#141428" stroke="white" strokeWidth="1.5" opacity="0.94" />
      <rect x="89" y="89" width="82" height="127" rx="8" stroke="white" strokeWidth="0.5" opacity="0.13" fill="none" />
    </g>

    {/* Right card (front) */}
    <g transform="rotate(14 130 240)">
      <rect x="80" y="80" width="100" height="145" rx="12" fill="#0e0e24" stroke="white" strokeWidth="2" />
      <rect x="89" y="89" width="82" height="127" rx="8" stroke="white" strokeWidth="0.5" opacity="0.18" fill="none" />
      {/* Inner diamond motif */}
      <path d="M130 118 L146 152 L130 186 L114 152Z" stroke="white" strokeWidth="1" opacity="0.18" fill="none" />
      <path d="M130 128 L140 152 L130 176 L120 152Z" fill="white" opacity="0.04" />
      {/* Small star in diamond center */}
      <path d="M130 146 L132 150.5 L130 155 L128 150.5Z" fill="white" opacity="0.2" />
    </g>

    {/* Sparkle accents */}
    <g opacity="0.22">
      <path d="M210 52 L212.5 61 L210 70 L207.5 61Z" fill="#3d2e00" />
      <path d="M42 105 L44 111 L42 117 L40 111Z" fill="#3d2e00" />
      <path d="M228 178 L230 183 L228 188 L226 183Z" fill="#3d2e00" />
    </g>

    {/* Tiny dot accents */}
    <circle cx="195" cy="90" r="1.5" fill="#3d2e00" opacity="0.12" />
    <circle cx="60" cy="180" r="1.5" fill="#3d2e00" opacity="0.12" />
    <circle cx="215" cy="140" r="1" fill="#3d2e00" opacity="0.1" />
  </svg>
);

const STEPS = [
  { title: 'Create account',  sub: 'Start with your basic details' },
  { title: 'Set a password',  sub: 'Keep your account secure' },
  { title: 'Almost done',     sub: 'Just a couple more things' },
];

const inputClass = "w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-[15px] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition-all duration-200";
const labelClass = "block text-[13px] font-medium text-gray-500 mb-2.5";

const Field = ({ label, optional, ...props }) => (
  <div>
    <label className={labelClass}>
      {label}{optional && <span className="ml-1 font-normal text-gray-300">(optional)</span>}
    </label>
    <input {...props} className={inputClass} />
  </div>
);

const Register = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirmPassword: '',
    phone: '', accepts_marketing: false,
  });
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle } = useCustomerAuth();
  const navigate = useNavigate();

  const set = (name, value) => setFormData(p => ({ ...p, [name]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
      if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        accepts_marketing: formData.accepts_marketing,
      });
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-130px)] flex bg-white">
      <SEO title="Create Account" noindex />
      {/* ── Left: Gold Decorative Panel ─────────────────────── */}
      <div
        className="hidden lg:flex w-[45%] relative overflow-hidden items-center justify-center"
        style={{ clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)' }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD54F] via-[#FFCB32] to-[#F9A825]" />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/8" />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-[340px]">
          <h2 className="text-[36px] font-bold text-gray-900 mb-4 leading-tight tracking-tight">
            Join EliteTCG
          </h2>
          <p className="text-gray-800/60 text-[16px] leading-relaxed mb-10">
            Create an account to buy, sell, and collect rare Pokémon cards
          </p>
          <CardFanIllustration />
        </div>
      </div>

      {/* ── Right: Sign Up Form ─────────────────────────────── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-8 py-20 lg:px-16 xl:px-24">
        <div className="w-full max-w-[420px]">

          {/* Step progress */}
          <div className="flex items-center justify-center gap-3 mb-10">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  i <= step
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-10 h-[2px] rounded-full transition-colors duration-300 ${
                    i < step ? 'bg-gray-900' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <h1 className="text-[32px] font-semibold text-gray-900 mb-2 text-center tracking-tight">
            {STEPS[step].title}
          </h1>
          <p className="text-[15px] text-gray-400 mb-10 text-center">
            {STEPS[step].sub}
          </p>

          {/* Step 1 — Name & Email */}
          {step === 0 && (
            <>
              <button
                type="button"
                onClick={() => loginWithGoogle().catch(err => toast.error(err.message))}
                className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 mb-6"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 uppercase tracking-wider font-medium">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <form onSubmit={nextStep} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name" name="first_name" type="text"
                    value={formData.first_name} onChange={handleChange} required placeholder="John" />
                  <Field label="Last name" name="last_name" type="text"
                    value={formData.last_name} onChange={handleChange} required placeholder="Doe" />
                </div>
                <Field label="Email" name="email" type="email"
                  value={formData.email} onChange={handleChange} required
                  autoComplete="email" placeholder="you@example.com" />
                <button type="submit"
                  className="w-full py-3.5 bg-gray-900 text-white text-[15px] font-medium rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 mt-2">
                  Continue
                </button>
              </form>
            </>
          )}

          {/* Step 2 — Password */}
          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-5">
              <Field label="Password" name="password" type="password"
                value={formData.password} onChange={handleChange} required
                autoComplete="new-password" placeholder="At least 8 characters" />
              <Field label="Confirm password" name="confirmPassword" type="password"
                value={formData.confirmPassword} onChange={handleChange} required
                autoComplete="new-password" placeholder="Re-enter your password" />
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setStep(0)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  Back
                </button>
                <button type="submit"
                  className="flex-1 py-3.5 bg-gray-900 text-white text-[15px] font-medium rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all duration-200">
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — Finish */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Phone" name="phone" type="tel" optional
                value={formData.phone} onChange={handleChange} placeholder="+27 12 345 6789" />

              <label className="flex items-start gap-3 cursor-pointer group pt-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={formData.accepts_marketing}
                  onClick={() => set('accepts_marketing', !formData.accepts_marketing)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${
                    formData.accepts_marketing ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-400'
                  }`}
                >
                  {formData.accepts_marketing && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
                <span className="text-[13px] text-gray-400 leading-relaxed">
                  Send me news about new releases and special offers
                </span>
              </label>

              <p className="text-[13px] text-gray-400 leading-relaxed">
                By creating an account you agree to our{' '}
                <Link to="/terms-of-service" className="text-gray-600 underline underline-offset-2">Terms</Link> and{' '}
                <Link to="/privacy-policy" className="text-gray-600 underline underline-offset-2">Privacy Policy</Link>.
              </p>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3.5 bg-gray-900 text-white text-[15px] font-medium rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="mt-12 text-center text-[14px] text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
