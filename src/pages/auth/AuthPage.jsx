import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import bannerVideo from '../../assets/videos/banner_home_page.mp4';
import './AuthPage.css';

const AuthPage = ({ initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accepts_marketing: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const isSignIn = mode === 'signin';

  // ── Switch mode ────────────────────────────────────────────
  const switchMode = useCallback(() => {
    setError('');
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
  }, []);

  // ── Sign In submit ─────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // ── Sign Up submit ─────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (registerData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        email: registerData.email,
        password: registerData.password,
        phone: registerData.phone || undefined,
        accepts_marketing: registerData.accepts_marketing,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="auth-page">
      {/* Noise overlay */}
      <div className="auth-page__noise" aria-hidden="true" />

      {/* Floating particles */}
      <div className="auth-page__particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className={`auth-particle auth-particle--${i % 3}`}
            style={{
              left: `${((i * 23 + 7) % 100)}%`,
              bottom: '0px',
              animationDelay: `${(i * 1.7) % 10}s`,
              animationDuration: `${8 + (i % 4)}s`,
              width: `${2 + (i % 2)}px`,
              height: `${2 + (i % 2)}px`,
            }}
          />
        ))}
      </div>

      {/* ─── Video Panel (slides between sides) ──────────── */}
      <div
        className={`auth-page__video-panel ${
          isSignIn ? 'auth-page__video-panel--signin' : 'auth-page__video-panel--signup'
        }`}
      >
        <video
          className="auth-page__video"
          src={bannerVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="auth-page__video-overlay" />
        <div className="auth-page__video-content">
          <h2 className="auth-page__video-title">
            {isSignIn ? 'New Here?' : 'Welcome Back'}
          </h2>
          <p className="auth-page__video-subtitle">
            {isSignIn
              ? 'Create an account to start collecting premium Pokémon cards from South Africa\'s finest.'
              : 'Sign in to access your collection, orders, and exclusive drops.'}
          </p>
          <button
            className="auth-page__switch-btn"
            onClick={switchMode}
            type="button"
          >
            {isSignIn ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>

      {/* ─── Form Panels ─────────────────────────────────── */}
      <div className="auth-page__forms">
        {/* Sign In Form (LEFT side) */}
        <div
          className={`auth-page__form-panel auth-page__form-panel--signin ${
            isSignIn ? 'auth-page__form-panel--active' : 'auth-page__form-panel--hidden'
          }`}
        >
          <div className="auth-form">
            <h1 className="auth-form__title">Welcome back</h1>
            <p className="auth-form__subtitle">Sign in to your EliteTCG account</p>

            {error && isSignIn && (
              <div className="auth-form__error">{error}</div>
            )}

            <form onSubmit={handleLogin}>
              <div className="auth-form__field">
                <label htmlFor="login-email" className="auth-form__label">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
                  required
                  autoComplete="email"
                  className="auth-form__input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="auth-form__field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="login-password" className="auth-form__label" style={{ marginBottom: 0 }}>Password</label>
                  <Link to="/forgot-password" className="auth-form__forgot">Forgot password?</Link>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="auth-form__input"
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" disabled={loading} className="auth-form__submit">
                {loading && isSignIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-form__footer">
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchMode(); }}>Create one</a>
            </p>
          </div>
        </div>

        {/* Sign Up Form (RIGHT side) */}
        <div
          className={`auth-page__form-panel auth-page__form-panel--signup ${
            !isSignIn ? 'auth-page__form-panel--active' : 'auth-page__form-panel--hidden'
          }`}
        >
          <div className="auth-form">
            <h1 className="auth-form__title">Create account</h1>
            <p className="auth-form__subtitle">Join EliteTCG and start collecting</p>

            {error && !isSignIn && (
              <div className="auth-form__error">{error}</div>
            )}

            <form onSubmit={handleRegister}>
              <div className="auth-form__row">
                <div className="auth-form__field">
                  <label htmlFor="reg-first" className="auth-form__label">First Name</label>
                  <input
                    id="reg-first"
                    name="first_name"
                    type="text"
                    value={registerData.first_name}
                    onChange={handleRegisterChange}
                    required
                    autoComplete="given-name"
                    className="auth-form__input"
                    placeholder="John"
                  />
                </div>
                <div className="auth-form__field">
                  <label htmlFor="reg-last" className="auth-form__label">Last Name</label>
                  <input
                    id="reg-last"
                    name="last_name"
                    type="text"
                    value={registerData.last_name}
                    onChange={handleRegisterChange}
                    required
                    autoComplete="family-name"
                    className="auth-form__input"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="auth-form__field">
                <label htmlFor="reg-email" className="auth-form__label">Email</label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                  autoComplete="email"
                  className="auth-form__input"
                  placeholder="you@example.com"
                />
              </div>

              <div className="auth-form__field">
                <label htmlFor="reg-phone" className="auth-form__label">
                  Phone <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  autoComplete="tel"
                  className="auth-form__input"
                  placeholder="+27 12 345 6789"
                />
              </div>

              <div className="auth-form__field">
                <label htmlFor="reg-password" className="auth-form__label">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="auth-form__input"
                  placeholder="At least 8 characters"
                />
              </div>

              <div className="auth-form__field">
                <label htmlFor="reg-confirm" className="auth-form__label">Confirm Password</label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  autoComplete="new-password"
                  className="auth-form__input"
                  placeholder="Re-enter your password"
                />
              </div>

              <div className="auth-form__checkbox-row">
                <input
                  id="reg-marketing"
                  name="accepts_marketing"
                  type="checkbox"
                  checked={registerData.accepts_marketing}
                  onChange={handleRegisterChange}
                  className="auth-form__checkbox"
                />
                <label htmlFor="reg-marketing" className="auth-form__checkbox-label">
                  Send me news about new releases and special offers
                </label>
              </div>

              <p className="auth-form__terms">
                By creating an account, you agree to our{' '}
                <a href="/terms">Terms</a> and{' '}
                <a href="/privacy">Privacy Policy</a>.
              </p>

              <button type="submit" disabled={loading} className="auth-form__submit">
                {loading && !isSignIn ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-form__footer">
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchMode(); }}>Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
