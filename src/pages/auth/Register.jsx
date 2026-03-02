import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '../../components/SEO/SEO';

const STORAGE = 'https://vqtgpgbifsiokmvwgubh.supabase.co/storage/v1/object/public/images';

const HeroCard = () => {
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const holoRef = useRef(null);
  const sheenRef = useRef(null);
  const sparkleRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current.getBoundingClientRect();
    const cx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const cy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Layer 1: 3D tilt — rotateX increased 25% (from -10 to -12.5)
    const rotY = (cx - 0.5) * 14;
    const rotX = (cy - 0.5) * -12.5;
    if (innerRef.current) {
      innerRef.current.style.transform = `rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      innerRef.current.style.transition = 'transform 0.08s linear';
      innerRef.current.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)';
    }

    // Layer 2: Holographic rainbow gradient
    if (holoRef.current) {
      const angle = Math.round(cx * 360);
      holoRef.current.style.background =
        `linear-gradient(${angle}deg,rgba(255,50,50,0.15),rgba(255,180,50,0.15),rgba(255,255,80,0.15),rgba(50,255,100,0.15),rgba(50,150,255,0.15),rgba(180,50,255,0.15),rgba(255,50,150,0.15))`;
    }

    // Layer 3: Light sheen reflection
    if (sheenRef.current) {
      const px = Math.round(cx * 100);
      const py = Math.round(cy * 100);
      sheenRef.current.style.background =
        `radial-gradient(circle at ${px}% ${py}%,rgba(255,255,255,0.25) 0%,rgba(255,255,255,0.05) 30%,transparent 60%)`;
    }

    // Layer 4: Sparkle texture shift
    if (sparkleRef.current) {
      const ox = Math.round(cx * 20);
      const oy = Math.round(cy * 20);
      sparkleRef.current.style.backgroundPosition = `${ox}px ${oy}px, ${ox + 5}px ${oy + 5}px`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    if (innerRef.current) {
      innerRef.current.style.transform = '';
      innerRef.current.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease-out';
      innerRef.current.style.boxShadow = '';
    }
    if (holoRef.current) holoRef.current.style.background = '';
    if (sheenRef.current) sheenRef.current.style.background = '';
    if (sparkleRef.current) sparkleRef.current.style.backgroundPosition = '';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '800px',
        width: '220px',
        cursor: 'pointer',
        animation: hovered ? 'none' : 'authCardBob 6s ease-in-out infinite',
      }}
      className="mx-auto"
    >
      <div
        ref={innerRef}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s ease',
          borderRadius: '11px',
          position: 'relative',
          filter: hovered ? 'brightness(1.12)' : 'none',
        }}
      >
        <div style={{ borderRadius: '11px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={`${STORAGE}/auth-hero-card-v2.webp`}
            alt="Elite TCG Card"
            draggable="false"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '11px',
              userSelect: 'none',
            }}
          />

          {/* Layer 2: Holographic rainbow gradient */}
          <div
            ref={holoRef}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: '11px',
              opacity: hovered ? 1 : 0,
              mixBlendMode: 'screen',
              zIndex: 3,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Layer 3: Moving light sheen */}
          <div
            ref={sheenRef}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: '11px',
              opacity: hovered ? 1 : 0,
              zIndex: 4,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Layer 4: Sparkle/glitter texture */}
          <div
            ref={sparkleRef}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: '11px',
              opacity: hovered ? 0.6 : 0,
              mixBlendMode: 'overlay',
              zIndex: 5,
              transition: 'opacity 0.3s ease',
              background:
                'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.7) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '12px 12px, 17px 17px',
            }}
          />
        </div>
      </div>

      {/* Layer 5: Glow shadow under card */}
      <div
        style={{
          width: '80%',
          height: '30px',
          margin: '-10px auto 0',
          background: '#EAB308',
          filter: 'blur(22px)',
          opacity: hovered ? 0.55 : 0.15,
          borderRadius: '50%',
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      <style>{`
        @keyframes authCardBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  const handleStep1 = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: wire up auth provider
      toast.error('Auth not yet connected');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-[15px] text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-50 transition-all duration-200';

  return (
    <section className="min-h-[calc(100vh-130px)] flex bg-white">
      <SEO title="Create Account" noindex />

      {/* ── Left: Gold Decorative Panel ────────────────────── */}
      <div
        className="hidden lg:flex w-[45%] relative overflow-hidden items-center justify-center"
        style={{ clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD54F] via-[#FFCB32] to-[#F9A825]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/8" />

        <div className="relative z-10 text-center px-12 max-w-[340px]">
          <h2 className="text-[36px] font-bold text-gray-900 mb-4 leading-tight tracking-tight">
            Join the Elite
          </h2>
          <p className="text-gray-800/60 text-[16px] leading-relaxed mb-10">
            Create your account and start collecting today
          </p>
          <HeroCard />
        </div>
      </div>

      {/* ── Right: Registration Form ──────────────────────── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-8 py-20 lg:px-16 xl:px-24">
        <div className="w-full max-w-[420px]">
          <h1 className="text-[32px] font-semibold text-gray-900 mb-2 tracking-tight">
            Create account
          </h1>
          <p className="text-[15px] text-gray-400 mb-10">
            {step === 1 ? 'Set up your login credentials' : 'Tell us about yourself'}
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-gray-900' : 'bg-gray-100'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-gray-900' : 'bg-gray-100'}`} />
          </div>

          {step === 1 && (
            <>
              {/* Google OAuth */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300 uppercase tracking-wider font-medium">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <form onSubmit={handleStep1} className="space-y-5">
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
                  <label className="block text-[13px] font-medium text-gray-500 mb-2.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-2.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gray-900 text-white text-[15px] font-medium rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 mt-2"
                >
                  Continue
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-2.5">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    placeholder="John"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-500 mb-2.5">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    placeholder="Doe"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-500 mb-2.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="Choose a username"
                  className={inputClass}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-700 text-[15px] font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gray-900 text-white text-[15px] font-medium rounded-full hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
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
