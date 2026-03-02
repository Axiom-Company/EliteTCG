import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Calendar, CreditCard, ArrowUpRight, AlertCircle, Check, ChevronRight, Truck } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { subscriptionApi } from '../../services/subscriptionApi';
import { toast } from 'sonner';

const PLAN_DETAILS = {
  starter: { name: 'Starter', price: 299, color: 'gray' },
  collector: { name: 'Collector', price: 599, color: 'primary' },
  elite: { name: 'Elite', price: 999, color: 'gold' },
};

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-50 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
    past_due: 'bg-amber-50 text-amber-700',
    paused: 'bg-blue-50 text-blue-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
      {status === 'active' && <Check className="w-3 h-3 mr-1" />}
      {status === 'past_due' && <AlertCircle className="w-3 h-3 mr-1" />}
      {status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Active'}
    </span>
  );
};

const SubscriptionManage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, getToken } = useCustomerAuth();
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const token = getToken();
        const [subData, histData] = await Promise.all([
          subscriptionApi.getMySubscription(token).catch(() => ({ subscription: null })),
          subscriptionApi.getSubscriptionHistory(token).catch(() => ({ history: [] })),
        ]);
        setSubscription(subData.subscription);
        setHistory(histData.history || []);
      } catch {
        // handled by individual catches
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, authLoading, getToken, navigate]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const token = getToken();
      await subscriptionApi.cancelSubscription(token);
      toast.success('Subscription cancelled', {
        description: 'You\'ll keep your benefits until the end of the billing period.'
      });
      setSubscription(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setShowCancelConfirm(false);
    } catch (err) {
      toast.error('Failed to cancel', { description: err.message });
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  // No active subscription
  if (!subscription) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            You don't have an active subscription yet. Browse our plans and start receiving curated Pokemon TCG products monthly.
          </p>
          <Link
            to="/subscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            View Plans
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const plan = PLAN_DETAILS[subscription.plan_id] || { name: subscription.plan_id, price: 0, color: 'gray' };
  const isActive = subscription.status === 'active';
  const nextBillingDate = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-ZA', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-white py-12 md:py-16">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Subscription</p>
          <h1 className="text-2xl font-bold text-gray-900">Manage Your Plan</h1>
        </div>

        {/* Current Plan Card */}
        <div className="rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-semibold text-gray-900">{plan.name} Plan</h2>
                <StatusBadge status={subscription.status} />
              </div>
              <p className="text-sm text-gray-500">
                R{plan.price}/month
              </p>
            </div>
            {isActive && (
              <Link
                to="/subscription"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                Change Plan
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Next Billing</p>
                <p className="text-sm font-medium text-gray-900">{nextBillingDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Payment</p>
                <p className="text-sm font-medium text-gray-900">
                  {subscription.payment_method || 'PayFast'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <Truck className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Next Box</p>
                <p className="text-sm font-medium text-gray-900">
                  {subscription.next_shipment_date
                    ? new Date(subscription.next_shipment_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
                    : 'Processing'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Box History</h3>
            <div className="divide-y divide-gray-100">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.description || `${plan.name} Box`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.date).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">R{entry.amount || plan.price}</p>
                    <p className={`text-xs ${
                      entry.status === 'delivered' ? 'text-green-600' :
                      entry.status === 'shipped' ? 'text-blue-600' :
                      'text-gray-400'
                    }`}>
                      {entry.status?.replace(/\b\w/g, c => c.toUpperCase()) || 'Completed'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel section */}
        {isActive && (
          <div className="rounded-2xl border border-gray-200 p-6 md:p-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Cancel Subscription</h3>
            <p className="text-sm text-gray-500 mb-4">
              You'll keep your benefits until {nextBillingDate}. After that, your plan won't renew.
            </p>

            {showCancelConfirm ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {cancelling ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Keep Subscription
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
              >
                Cancel my subscription
              </button>
            )}
          </div>
        )}

        {/* Cancelled notice */}
        {subscription.status === 'cancelled' && (
          <div className="rounded-2xl border border-gray-200 p-6 md:p-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Your subscription has been cancelled. You can resubscribe at any time.
            </p>
            <Link
              to="/subscription"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              View Plans
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManage;
