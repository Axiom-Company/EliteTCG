import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomerAuth } from '../../contexts/AuthContext';
import SEO from '../../components/SEO/SEO';
import charizardImage from '../../assets/images/mew-ex-card.webp';
import marillImage from '../../assets/images/auth-hero-card.webp';

/* ------------------------------------------------------------------ */
/*  Showcase Card (always-on holo + sway, hover = mouse-track override) */
/* ------------------------------------------------------------------ */
const ShowcaseCard = ({ src, alt, animationName, duration, delay }) => {
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const holoRef = useRef(null);
  const sheenRef = useRef(null);
  const sparkleRef = useRef(null);
  const shadowRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const cx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const cy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const rotY = (cx - 0.5) * 14;
    const rotX = (cy - 0.5) * -10;
    if (innerRef.current) {
      innerRef.current.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      innerRef.current.style.transition = 'transform 0.08s linear';
    }

    if (holoRef.current) {
      const angle = Math.round(cx * 360);
      holoRef.current.style.background =
        `linear-gradient(${angle}deg,rgba(255,50,50,0.15),rgba(255,180,50,0.15),rgba(255,255,80,0.15),rgba(50,255,100,0.15),rgba(50,150,255,0.15),rgba(180,50,255,0.15),rgba(255,50,150,0.15))`;
      holoRef.current.style.opacity = '0.7';
      holoRef.current.style.animation = 'none';
    }

    if (sheenRef.current) {
      const px = Math.round(cx * 100);
      const py = Math.round(cy * 100);
      sheenRef.current.style.background =
        `radial-gradient(circle at ${px}% ${py}%,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0.05) 30%,transparent 60%)`;
      sheenRef.current.style.opacity = '1';
      sheenRef.current.style.animation = 'none';
    }

    if (sparkleRef.current) {
      const ox = Math.round(cx * 20);
      const oy = Math.round(cy * 20);
      sparkleRef.current.style.backgroundPosition = `${ox}px ${oy}px, ${ox + 5}px ${oy + 5}px`;
      sparkleRef.current.style.opacity = '0.6';
      sparkleRef.current.style.animation = 'none';
    }

    if (shadowRef.current) {
      const shiftX = (cx - 0.5) * 16;
      const shiftY = 4 + cy * 12;
      shadowRef.current.style.transform = `translateX(${shiftX}px) translateY(${shiftY}px) scaleX(${0.9 + cx * 0.2})`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    if (innerRef.current) {
      innerRef.current.style.transform = '';
      innerRef.current.style.transition = 'transform 0.4s ease-out';
    }
    if (holoRef.current) {
      holoRef.current.style.background = '';
      holoRef.current.style.opacity = '';
      holoRef.current.style.animation = '';
    }
    if (sheenRef.current) {
      sheenRef.current.style.background = '';
      sheenRef.current.style.opacity = '';
      sheenRef.current.style.animation = '';
    }
    if (sparkleRef.current) {
      sparkleRef.current.style.backgroundPosition = '';
      sparkleRef.current.style.opacity = '';
      sparkleRef.current.style.animation = '';
    }
    if (shadowRef.current) {
      shadowRef.current.style.transform = '';
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '900px',
        width: '202px',
        cursor: 'pointer',
      }}
    >
      <div
        ref={innerRef}
        style={{
          transformStyle: 'preserve-3d',
          animation: hovered ? 'none' : `${animationName} ${duration}s ease-in-out infinite`,
          animationDelay: hovered ? '0s' : delay,
          transition: hovered ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '11px',
          position: 'relative',
          filter: hovered ? 'brightness(1.12)' : 'none',
          boxShadow: '0 4px 6px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.15), 0 24px 48px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ borderRadius: '11px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={src}
            alt={alt}
            draggable="false"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '11px',
              userSelect: 'none',
            }}
          />

          {/* Always-on holographic rainbow gradient */}
          <div
            ref={holoRef}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '11px',
              opacity: 0.3,
              mixBlendMode: 'screen',
              zIndex: 3,
              background: 'linear-gradient(90deg,rgba(255,50,50,0.15),rgba(255,180,50,0.15),rgba(255,255,80,0.15),rgba(50,255,100,0.15),rgba(50,150,255,0.15),rgba(180,50,255,0.15),rgba(255,50,150,0.15))',
              backgroundSize: '200% 200%',
              animation: 'holoShimmer 8s ease-in-out infinite',
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Always-on moving sheen */}
          <div
            ref={sheenRef}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '11px',
              zIndex: 4,
              overflow: 'hidden',
              opacity: 0.35,
              animation: 'sheenMove 8s ease-in-out infinite',
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Always-on sparkle texture */}
          <div
            ref={sparkleRef}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '11px',
              opacity: 0.25,
              mixBlendMode: 'overlay',
              zIndex: 5,
              background:
                'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.7) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '12px 12px, 17px 17px',
              animation: 'sparkleShift 10s linear infinite',
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 3D shadow that animates with sway */}
      <div
        ref={shadowRef}
        style={{
          width: '80%',
          height: '24px',
          margin: '-8px auto 0',
          background: 'rgba(0,0,0,0.25)',
          filter: 'blur(18px)',
          borderRadius: '50%',
          pointerEvents: 'none',
          transition: 'transform 0.4s ease-out',
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Eye icons for password toggle                                       */
/* ------------------------------------------------------------------ */
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Google SVG Icon (reused in both forms)                              */
/* ------------------------------------------------------------------ */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Register form helpers                                               */
/* ------------------------------------------------------------------ */
const REG_STEPS = [
  { title: 'Create account', sub: 'Start with your basic details' },
  { title: 'Set a password', sub: 'Keep your account secure' },
  { title: 'Almost done', sub: 'Just a couple more things' },
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

/* ------------------------------------------------------------------ */
/*  LoginForm                                                           */
/* ------------------------------------------------------------------ */
const LoginForm = ({ onFlipToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signInWithGoogle } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="text-[32px] font-semibold text-gray-900 mb-2 tracking-tight text-center">
        Welcome back
      </h1>
      <p className="text-[15px] text-gray-400 mb-10 text-center">
        Sign in to your EliteTCG account
      </p>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={() => signInWithGoogle().catch(err => toast.error(err.message))}
        className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-300 uppercase tracking-wider font-medium">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-500 mb-2.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-[13px] font-medium text-gray-500">Password</label>
            <Link to="/forgot-password" className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gray-900 text-white text-[15px] font-medium rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed mt-[11px]"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-[14px] text-gray-400" style={{ marginTop: '51px' }}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onFlipToRegister}
          className="text-gray-900 font-medium hover:underline underline-offset-4 bg-transparent border-none cursor-pointer p-0"
        >
          Create one
        </button>
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  RegisterForm                                                        */
/* ------------------------------------------------------------------ */
const RegisterForm = ({ onFlipToLogin }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirmPassword: '',
    phone: '', accepts_marketing: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { signUp, signInWithGoogle } = useCustomerAuth();
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
      await signUp(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name,
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
    <div className="w-full max-w-[420px]">
      {/* Step progress */}
      <div className="flex items-center justify-center gap-3 mb-10">
        {REG_STEPS.map((_, i) => (
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
            {i < REG_STEPS.length - 1 && (
              <div className={`w-10 h-[2px] rounded-full transition-colors duration-300 ${
                i < step ? 'bg-gray-900' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <h1 className="text-[32px] font-semibold text-gray-900 mb-2 text-center tracking-tight">
        {REG_STEPS[step].title}
      </h1>
      <p className="text-[15px] text-gray-400 mb-10 text-center">
        {REG_STEPS[step].sub}
      </p>

      {/* Step 0 - Name & Email */}
      {step === 0 && (
        <>
          <button
            type="button"
            onClick={() => signInWithGoogle().catch(err => toast.error(err.message))}
            className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 mb-6"
          >
            <GoogleIcon />
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
              className="w-full py-3.5 bg-gray-900 text-white text-[15px] font-medium rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 mt-[11px]">
              Continue
            </button>
          </form>
        </>
      )}

      {/* Step 1 - Password */}
      {step === 1 && (
        <form onSubmit={nextStep} className="space-y-5">
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange} required
                autoComplete="new-password" placeholder="At least 8 characters"
                className={`${inputClass} pr-10`} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Confirm password</label>
            <div className="relative">
              <input name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword} onChange={handleChange} required
                autoComplete="new-password" placeholder="Re-enter your password"
                className={`${inputClass} pr-10`} />
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-[15px]">
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

      {/* Step 2 - Finish */}
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

          <div className="flex gap-3 pt-[7px]">
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

      <p className="text-center text-[14px] text-gray-400" style={{ marginTop: '51px' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onFlipToLogin}
          className="text-gray-900 font-medium hover:underline underline-offset-4 bg-transparent border-none cursor-pointer p-0"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  AuthPage - Combined Login/Register with page flip                   */
/* ------------------------------------------------------------------ */
const AuthPage = () => {
  const location = useLocation();
  const initialMode = location.pathname === '/register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [flipped, setFlipped] = useState(initialMode === 'register');
  const navigate = useNavigate();

  // Sync with route changes (browser back/forward)
  useEffect(() => {
    const newMode = location.pathname === '/register' ? 'register' : 'login';
    if (newMode !== mode) {
      setMode(newMode);
      setFlipped(newMode === 'register');
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFlip = useCallback((newMode) => {
    setFlipped(newMode === 'register');
    setMode(newMode);
    navigate(newMode === 'register' ? '/register' : '/login', { replace: true });
  }, [navigate]);

  return (
    <section className="min-h-[calc(100vh-130px)] flex bg-white">
      <SEO title={mode === 'login' ? 'Login' : 'Create Account'} noindex />

      {/* Left: Decorative Panel — navy for login, yellow for register */}
      <div
        className="hidden lg:flex w-[45%] relative overflow-hidden items-center justify-center order-1 transition-colors duration-700"
        style={{ clipPath: 'polygon(0% 0, 100% 0, 92% 100%, 0 100%)' }}
      >
        <div className={`absolute inset-0 transition-all duration-700 ${mode === 'login' ? 'bg-gradient-to-br from-[#1a2f55] via-[#1b3464] to-[#0f1f3a]' : 'bg-gradient-to-br from-[#FFD54F] via-[#FFCB32] to-[#F9A825]'}`} />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/8" />

        <div className="relative z-10 text-center px-8">
          <h2 className={`text-[36px] font-bold mb-4 leading-tight tracking-tight transition-colors duration-700 ${mode === 'login' ? 'text-white' : 'text-gray-900'}`}>
            Start Collecting
          </h2>
          <p className={`text-[16px] leading-relaxed mb-10 max-w-85 mx-auto transition-colors duration-700 ${mode === 'login' ? 'text-white/60' : 'text-gray-800/60'}`}>
            {`Join thousands of collectors trading Pok\u00e9mon cards on EliteTCG`}
          </p>

          {/* Two showcase cards side by side */}
          <div className="flex items-center justify-center gap-6">
            <ShowcaseCard
              src={charizardImage}
              alt="Mew EX"
              animationName="cardShowcaseLeft"
              duration={10}
              delay="0s"
            />
            <ShowcaseCard
              src={marillImage}
              alt="Auth Hero Card"
              animationName="cardShowcaseRight"
              duration={12}
              delay="-4s"
            />
          </div>
        </div>
      </div>

      {/* Right: Navy Flipping Form Panel */}
      <div
        className="w-full lg:w-[55%] flex items-center justify-center px-8 py-20 lg:px-16 xl:px-24 order-2 bg-gradient-to-br from-[#1a2f55] via-[#1b3464] to-[#0f1f3a]"
        style={{ perspective: '1200px' }}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl px-10 py-12 w-full max-w-[460px]"
          style={{
            position: 'relative',
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            transform: flipped ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.7s cubic-bezier(0.645, 0.045, 0.355, 1)',
          }}
        >
          {/* Front face - Login (always rendered, CSS hides when flipped) */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <LoginForm onFlipToRegister={() => handleFlip('register')} />
          </div>

          {/* Back face - Register (always rendered, pre-rotated 180deg) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '3rem 2.5rem',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <RegisterForm onFlipToLogin={() => handleFlip('login')} />
          </div>
        </div>
      </div>

      {/* All keyframes */}
      <style>{`
        @keyframes cardShowcaseLeft {
          0%, 100% { transform: rotateY(-3deg) rotateX(0.8deg) translateZ(0px) translateY(0px); }
          20% { transform: rotateY(3.5deg) rotateX(-0.5deg) translateZ(10px) translateY(-1px); }
          45% { transform: rotateY(-2deg) rotateX(0.3deg) translateZ(4px) translateY(1px); }
          70% { transform: rotateY(4deg) rotateX(-0.8deg) translateZ(12px) translateY(-2px); }
          90% { transform: rotateY(-1deg) rotateX(0.5deg) translateZ(6px) translateY(0px); }
        }

        @keyframes cardShowcaseRight {
          0%, 100% { transform: rotateY(3deg) rotateX(-0.5deg) translateZ(0px) translateY(0px); }
          25% { transform: rotateY(-3.5deg) rotateX(0.8deg) translateZ(8px) translateY(1px); }
          50% { transform: rotateY(2deg) rotateX(-0.3deg) translateZ(12px) translateY(-1px); }
          75% { transform: rotateY(-4deg) rotateX(0.6deg) translateZ(5px) translateY(2px); }
        }

        @keyframes holoShimmer {
          0% { background-position: 0% 50%; opacity: 0.3; }
          50% { background-position: 100% 50%; opacity: 0.45; }
          100% { background-position: 0% 50%; opacity: 0.3; }
        }

        @keyframes sheenMove {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        @keyframes sparkleShift {
          0% { background-position: 0px 0px, 5px 5px; }
          100% { background-position: 20px 20px, 25px 25px; }
        }
      `}</style>
    </section>
  );
};

export default AuthPage;
