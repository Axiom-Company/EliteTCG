import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const STEPS = [
  { title: 'Create account', description: 'Start with your basic details' },
  { title: 'Set a password',  description: 'Keep your account secure' },
  { title: 'Almost done',     description: 'Just a couple more things' },
];

const inputClass = "rounded-none border-gray-300 bg-white";
const fieldLabel = "text-xs text-gray-500 uppercase tracking-wide";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
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
    <div className="flex-1 bg-white flex flex-col items-center justify-start pt-16 px-4 pb-12">
      <Card className="w-full max-w-sm rounded-none shadow-none">
        <CardHeader className="pb-4">
          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 transition-colors duration-300 ${i <= step ? 'bg-gray-900' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <CardTitle className="text-xl font-normal text-gray-900">{STEPS[step].title}</CardTitle>
          <CardDescription className="text-sm text-gray-400">{STEPS[step].description}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 1 — Google button only on first step */}
          {step === 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-none border-gray-300 flex items-center gap-2"
                onClick={() => toast.error('Google sign-up coming soon')}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </>
          )}

          {/* Step 1 — Name & Email */}
          {step === 0 && (
            <form onSubmit={nextStep} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="first_name" className={fieldLabel}>First Name</Label>
                  <Input id="first_name" name="first_name" type="text"
                    value={formData.first_name} onChange={handleChange} required
                    placeholder="John" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="last_name" className={fieldLabel}>Last Name</Label>
                  <Input id="last_name" name="last_name" type="text"
                    value={formData.last_name} onChange={handleChange} required
                    placeholder="Doe" className={inputClass} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className={fieldLabel}>Email</Label>
                <Input id="email" name="email" type="email"
                  value={formData.email} onChange={handleChange} required autoComplete="email"
                  placeholder="you@example.com" className={inputClass} />
              </div>
              <Button type="submit" className="w-full rounded-none">Continue</Button>
            </form>
          )}

          {/* Step 2 — Password */}
          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className={fieldLabel}>Password</Label>
                <Input id="password" name="password" type="password"
                  value={formData.password} onChange={handleChange} required autoComplete="new-password"
                  placeholder="At least 8 characters" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className={fieldLabel}>Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password"
                  value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password"
                  placeholder="Re-enter your password" className={inputClass} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 rounded-none border-gray-300"
                  onClick={() => setStep(0)}>Back</Button>
                <Button type="submit" className="flex-1 rounded-none">Continue</Button>
              </div>
            </form>
          )}

          {/* Step 3 — Finish */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className={fieldLabel}>
                  Phone <span className="normal-case text-gray-300">(optional)</span>
                </Label>
                <Input id="phone" name="phone" type="tel"
                  value={formData.phone} onChange={handleChange}
                  placeholder="+27 12 345 6789" className={inputClass} />
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="accepts_marketing"
                  checked={formData.accepts_marketing}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, accepts_marketing: checked }))
                  }
                  className="mt-0.5"
                />
                <label htmlFor="accepts_marketing" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                  Send me news about new releases and special offers
                </label>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                By creating an account you agree to our{' '}
                <a href="/terms" className="text-gray-600 underline">Terms</a> and{' '}
                <a href="/privacy" className="text-gray-600 underline">Privacy Policy</a>.
              </p>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 rounded-none border-gray-300"
                  onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" disabled={loading} className="flex-1 rounded-none">
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-gray-900 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
