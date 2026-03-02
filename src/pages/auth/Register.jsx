import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { toast } from 'sonner';

const STEPS = [
  { title: 'Create account',  sub: 'Start with your basic details' },
  { title: 'Set a password',  sub: 'Keep your account secure' },
  { title: 'Almost done',     sub: 'Just a couple more things' },
];

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 transition-colors";
const labelClass = "block text-xs font-medium text-gray-500 mb-2";

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

  const { register } = useCustomerAuth();
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
    <div className="flex-1 bg-white flex flex-col items-center justify-start pt-24 px-6 pb-20">
      <div className="w-full max-w-[360px]">

        {/* Step progress */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300 ${
                i <= step ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
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
                <div className={`w-8 h-px transition-colors duration-300 ${i < step ? 'bg-gray-900' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2 text-center">{STEPS[step].title}</h1>
        <p className="text-sm text-gray-400 mb-10 text-center">{STEPS[step].sub}</p>

        {/* Step 1 — Name & Email */}
        {step === 0 && (
          <form onSubmit={nextStep} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" name="first_name" type="text"
                value={formData.first_name} onChange={handleChange} required placeholder="John" />
              <Field label="Last name" name="last_name" type="text"
                value={formData.last_name} onChange={handleChange} required placeholder="Doe" />
            </div>
            <Field label="Email" name="email" type="email"
              value={formData.email} onChange={handleChange} required
              autoComplete="email" placeholder="you@example.com" />
            <button type="submit"
              className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors mt-2">
              Continue
            </button>
          </form>
        )}

        {/* Step 2 — Password */}
        {step === 1 && (
          <form onSubmit={nextStep} className="space-y-4">
            <Field label="Password" name="password" type="password"
              value={formData.password} onChange={handleChange} required
              autoComplete="new-password" placeholder="At least 8 characters" />
            <Field label="Confirm password" name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange} required
              autoComplete="new-password" placeholder="Re-enter your password" />
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(0)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button type="submit"
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Step 3 — Finish */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Phone" name="phone" type="tel" optional
              value={formData.phone} onChange={handleChange} placeholder="+27 12 345 6789" />

            <label className="flex items-start gap-3 cursor-pointer group pt-1">
              <button
                type="button"
                role="checkbox"
                aria-checked={formData.accepts_marketing}
                onClick={() => set('accepts_marketing', !formData.accepts_marketing)}
                className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                  formData.accepts_marketing ? 'bg-gray-900 border-gray-900' : 'border-gray-300 group-hover:border-gray-400'
                }`}
              >
                {formData.accepts_marketing && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <span className="text-xs text-gray-400 leading-relaxed">
                Send me news about new releases and special offers
              </span>
            </label>

            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account you agree to our{' '}
              <a href="/terms" className="text-gray-600 underline underline-offset-2">Terms</a> and{' '}
              <a href="/privacy" className="text-gray-600 underline underline-offset-2">Privacy Policy</a>.
            </p>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-10 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 font-medium hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
