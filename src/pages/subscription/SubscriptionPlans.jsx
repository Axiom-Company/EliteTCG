import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, Crown, Package, ArrowRight, Sparkles } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { subscriptionApi } from '../../services/subscriptionApi';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    interval: 'month',
    icon: Package,
    description: 'Perfect for new collectors getting into the TCG scene.',
    color: 'gray',
    features: [
      '1 Mystery Booster Pack per month',
      'Free standard shipping',
      '5% store discount',
      'Early access to new set releases',
      'Monthly newsletter with market insights',
    ],
    highlight: false,
  },
  {
    id: 'collector',
    name: 'Collector',
    price: 599,
    interval: 'month',
    icon: Star,
    description: 'For dedicated collectors who want the best value and exclusive perks.',
    color: 'primary',
    features: [
      '3 Mystery Booster Packs per month',
      'Free express shipping',
      '10% store discount',
      'Priority access to pre-orders',
      'Exclusive promo cards',
      'Monthly collector\'s guide',
      'Access to members-only drops',
    ],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 999,
    interval: 'month',
    icon: Crown,
    description: 'The ultimate TCG experience for serious collectors and competitors.',
    color: 'gold',
    features: [
      '5 Mystery Booster Packs per month',
      '1 Guaranteed rare/ultra-rare card',
      'Free priority shipping',
      '15% store discount',
      'First access to all pre-orders',
      'Exclusive Elite member promo cards',
      'Quarterly Elite Trainer Box bonus',
      'Personal collection advisor',
      'Invite-only community access',
    ],
    highlight: false,
    badge: 'Best Value',
  },
];

const FAQ_ITEMS = [
  {
    q: 'When will I receive my monthly box?',
    a: 'Subscription boxes ship within the first week of each month. You\'ll receive a tracking number via email once your box is dispatched.',
  },
  {
    q: 'Can I change my plan at any time?',
    a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards via PayFast, as well as EFT and instant EFT for South African customers.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'You can cancel at any time from your subscription management page. You\'ll continue to receive benefits until the end of your current billing period.',
  },
  {
    q: 'What are Mystery Booster Packs?',
    a: 'Mystery Booster Packs are curated packs from a mix of the latest and popular Pokemon TCG sets. Each pack is guaranteed to contain authentic, factory-sealed cards.',
  },
  {
    q: 'Do store discounts stack with sales?',
    a: 'Subscriber discounts apply on top of regular prices but do not stack with promotional sale prices. You\'ll always get the best available price.',
  },
];

const PlanCard = ({ plan, currentPlan, onSelect, loading }) => {
  const Icon = plan.icon;
  const isCurrentPlan = currentPlan === plan.id;
  const isHighlighted = plan.highlight;

  const borderColor = isHighlighted
    ? 'border-[#E3350D]'
    : 'border-gray-200';

  const bgColor = isHighlighted
    ? 'bg-gradient-to-b from-white to-red-50/30'
    : 'bg-white';

  return (
    <div
      className={`relative rounded-2xl border-2 ${borderColor} ${bgColor} p-6 md:p-8 flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            plan.badge === 'Most Popular'
              ? 'bg-[#E3350D] text-white'
              : 'bg-[#FFCB32] text-gray-900'
          }`}>
            {plan.badge === 'Most Popular' && <Sparkles className="w-3 h-3" />}
            {plan.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${
          plan.color === 'primary' ? 'bg-red-50 text-[#E3350D]' :
          plan.color === 'gold' ? 'bg-amber-50 text-[#D4AF37]' :
          'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-gray-500">R</span>
          <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
          <span className="text-sm text-gray-500">/{plan.interval}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
              plan.color === 'primary' ? 'text-[#E3350D]' :
              plan.color === 'gold' ? 'text-[#D4AF37]' :
              'text-gray-400'
            }`} />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        disabled={loading || isCurrentPlan}
        className={`w-full py-3 px-6 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-500 cursor-default'
            : isHighlighted
              ? 'bg-[#E3350D] text-white hover:bg-[#CC2D0A] shadow-sm hover:shadow-md'
              : 'bg-gray-900 text-white hover:bg-gray-800'
        } disabled:opacity-60`}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : (
          <>
            Get Started
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

const FAQItem = ({ item, isOpen, onToggle }) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left"
    >
      <span className="text-sm font-medium text-gray-900 pr-4">{item.q}</span>
      <svg
        className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && (
      <p className="pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
    )}
  </div>
);

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getToken } = useCustomerAuth();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      if (!isAuthenticated) return;
      try {
        const token = getToken();
        const data = await subscriptionApi.getMySubscription(token);
        if (data.subscription?.plan_id) {
          setCurrentPlan(data.subscription.plan_id);
        }
      } catch {
        // No active subscription, that's fine
      }
    };
    fetchCurrentSubscription();
  }, [isAuthenticated, getToken]);

  const handleSelectPlan = async (planId) => {
    if (!isAuthenticated) {
      toast('Please sign in to subscribe', { description: 'You need an account to manage subscriptions.' });
      navigate('/login');
      return;
    }

    setSelectedPlan(planId);
    setLoading(true);

    try {
      const token = getToken();
      const data = await subscriptionApi.subscribe(token, planId);

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }

      toast.success('Subscription activated!', {
        description: `Welcome to the ${PLANS.find(p => p.id === planId)?.name} plan.`
      });
      setCurrentPlan(planId);
      navigate('/subscription/manage');
    } catch (err) {
      toast.error('Something went wrong', { description: err.message });
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 mb-6">
            <Zap className="w-3.5 h-3.5" />
            Subscription Boxes
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Monthly Box
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
            Get curated Pokemon TCG products delivered to your door every month.
            Exclusive cards, discounts, and early access to new releases.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-16 md:pb-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currentPlan={currentPlan}
                onSelect={handleSelectPlan}
                loading={loading && selectedPlan === plan.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '1', title: 'Choose a Plan', desc: 'Pick the subscription tier that fits your collecting goals.' },
              { step: '2', title: 'We Curate & Ship', desc: 'Our team hand-picks products and ships your box monthly.' },
              { step: '3', title: 'Open & Enjoy', desc: 'Unbox exclusive cards and products delivered to your door.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white text-sm font-medium flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 px-6">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPlans;
