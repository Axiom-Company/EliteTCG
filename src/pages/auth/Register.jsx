import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCustomerAuth } from '../../contexts/AuthContext';
import SEO from '../../components/SEO/SEO';

const STEPS = [
  { title: 'Create an account', sub: 'Enter your details below to create your account' },
  { title: 'Set a password', sub: 'Choose a secure password for your account' },
  { title: 'Almost done', sub: 'Just a couple more things' },
];

const inputClass = "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm shadow-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors";
const labelClass = "text-sm font-medium leading-none";

const Field = ({ label, optional, ...props }) => (
  <div className="flex flex-col gap-2">
    <label className={labelClass}>
      {label}{optional && <span className="ml-1 font-normal text-gray-400">(optional)</span>}
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

  const [confirmationEmail, setConfirmationEmail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signUp(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
        accepts_marketing: formData.accepts_marketing,
      });
      if (result?.needsConfirmation) {
        setConfirmationEmail(result.email);
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white md:bg-gray-50 px-6 lg:px-4 py-12">
      <SEO title="Create Account" noindex />

      <div className="w-full max-w-[380px]">

      {/* Email confirmation screen */}
      {confirmationEmail ? (
        <div className="bg-white rounded-2xl md:shadow-[0_2px_24px_rgba(0,0,0,0.08)] md:border md:border-gray-100 px-8 py-12 flex flex-col items-center gap-5 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-medium tracking-tight">Check your email</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              We've sent a confirmation link to<br />
              <span className="font-medium text-gray-900">{confirmationEmail}</span>
            </p>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-[260px]">
            Click the link in the email to verify your account, then come back and sign in.
          </p>
          <Link
            to="/login"
            className="mt-2 h-10 w-full inline-flex items-center justify-center rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.99] transition-all shadow-xs"
          >
            Go to Sign In
          </Link>
        </div>
      ) : (

      <div className="bg-white rounded-2xl md:shadow-[0_2px_24px_rgba(0,0,0,0.08)] md:border md:border-gray-100 px-8 py-9 flex flex-col gap-7">

        {/* Header */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-medium tracking-tight">{STEPS[step].title}</h1>
          <p className="text-sm text-gray-500">{STEPS[step].sub}</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 -mt-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-gray-900 w-6' : 'bg-gray-200 w-4'
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Name & Email */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <button
              type="button"
              onClick={() => signInWithGoogle().catch(err => toast.error(err.message))}
              className="h-10 w-full inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:border-gray-300 active:scale-[0.99] transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 tracking-wider" style={{ backgroundColor: 'white' }}>Or continue with</span>
              </div>
            </div>

            <form onSubmit={nextStep} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" name="first_name" type="text"
                  value={formData.first_name} onChange={handleChange} required placeholder="John" />
                <Field label="Last name" name="last_name" type="text"
                  value={formData.last_name} onChange={handleChange} required placeholder="Doe" />
              </div>
              <Field label="Email" name="email" type="email"
                value={formData.email} onChange={handleChange} required
                autoComplete="email" placeholder="m@example.com" />
              <button type="submit"
                className="h-10 w-full rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.99] transition-all shadow-xs">
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Step 2 — Password */}
        {step === 1 && (
          <form onSubmit={nextStep} className="flex flex-col gap-5">
            <Field label="Password" name="password" type="password"
              value={formData.password} onChange={handleChange} required
              autoComplete="new-password" placeholder="At least 8 characters" />
            <Field label="Confirm password" name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange} required
              autoComplete="new-password" placeholder="Re-enter your password" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(0)}
                className="h-10 flex-1 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs">
                Back
              </button>
              <button type="submit"
                className="h-10 flex-1 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.99] transition-all shadow-xs">
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Step 3 — Finish */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="Phone" name="phone" type="tel" optional
              value={formData.phone} onChange={handleChange} placeholder="+27 12 345 6789" />

            <label className="flex items-start gap-3 cursor-pointer group">
              <button
                type="button"
                role="checkbox"
                aria-checked={formData.accepts_marketing}
                onClick={() => set('accepts_marketing', !formData.accepts_marketing)}
                className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all ${
                  formData.accepts_marketing ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-500'
                }`}
              >
                {formData.accepts_marketing && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <span className="text-sm text-gray-500 leading-relaxed">
                Send me news about new releases and special offers
              </span>
            </label>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="h-10 flex-1 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="h-10 flex-1 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Creating...' : 'Create account'}
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 leading-relaxed">
              By clicking continue, you agree to our{' '}
              <Link to="/terms-of-service" className="underline underline-offset-4 hover:text-gray-900 transition-colors">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="underline underline-offset-4 hover:text-gray-900 transition-colors">Privacy Policy</Link>.
            </p>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="underline underline-offset-4 text-gray-900 font-medium hover:text-gray-700 transition-colors">
            Sign in
          </Link>
        </p>

        </div>

        )}

        <p className="text-center text-xs text-gray-400 mt-5">
          <Link to="/" className="hover:text-gray-600 transition-colors">← Back to home</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
