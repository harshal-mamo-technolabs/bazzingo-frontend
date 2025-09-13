import React, { useMemo, useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { getPlansData } from '../services/dashbaordService';
import { API_CONNECTION_HOST_URL } from '../utils/constant';

// Alert Component
function Alert({ message }) {
  if (!message) return null;
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3" role="alert">
      {message}
    </div>
  );
}

// Hint Component
function Hint({ text }) {
  if (!text) return null;
  return (
    <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 text-xs">
      {text}
    </div>
  );
}

// Currency Amount Display Component
function CurrencyAmount({ amount, suffix }) {
  return (
    <div className="flex items-end gap-1">
      <span className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>
        €
      </span>
      <span className="text-gray-900" style={{ fontSize: '44px', fontWeight: 800, lineHeight: 1 }}>
        {amount}
      </span>
      <span className="text-gray-500" style={{ fontSize: '14px', fontWeight: 500 }}>
        {suffix}
      </span>
    </div>
  );
}

// Toggle Component
const Toggle = ({ value, onChange }) => {
  const isMonthly = value === 'monthly';
  return (
    <div className="flex items-center justify-center mb-8">
      <div
        role="tablist"
        aria-label="Billing period"
        className="relative w-[260px] h-[42px] rounded-full bg-gray-100 flex"
      >
        <span
          aria-hidden="true"
          className={`absolute top-0 left-0 h-full w-1/2 rounded-full bg-white shadow transition-transform duration-300 ${
            isMonthly ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ transition: 'transform 0.3s ease' }}
        />
        <button
          role="tab"
          aria-selected={isMonthly}
          onClick={() => onChange('monthly')}
          className={`flex-1 z-10 text-sm font-semibold rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 transition-colors ${
            isMonthly ? 'text-gray-900' : 'text-gray-600'
          }`}
        >
          Monthly
        </button>
        <button
          role="tab"
          aria-selected={!isMonthly}
          onClick={() => onChange('yearly')}
          className={`flex-1 z-10 text-sm font-semibold rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 transition-colors ${
            !isMonthly ? 'text-gray-900' : 'text-gray-600'
          }`}
        >
          Yearly
        </button>
      </div>
    </div>
  );
};

const PlanCard = ({ plan, billing, onSelect, onTrialSelect, loading, userSubscription, isLoggedIn }) => {
  // Get the price based on billing period
  const priceData = plan.prices[billing === 'monthly' ? 'monthly' : 'yearly'];
  const trialPriceData = plan.prices.trial;
  
  // Check if user already has this plan
  const hasPlan = userSubscription && userSubscription.planId === plan._id;
  const isTrial = userSubscription && userSubscription.status === 'trialing' && userSubscription.planId === plan._id;
  
  // Calculate per month price - handle cases where intervalCount might be missing or 0
  const perMonth = useMemo(() => {
    if (!priceData || !priceData.priceId) return 0;
    
    if (billing === 'yearly') {
      return priceData.priceId.unitAmount / 12;
    }
    
    const intervalCount = priceData.intervalCount || 1;
    return priceData.priceId.unitAmount / intervalCount;
  }, [billing, priceData]);

  // Calculate period total
  const periodTotal = useMemo(() => {
    if (!priceData || !priceData.priceId) return 0;
    return priceData.priceId.unitAmount;
  }, [priceData]);

  const priceSuffix = billing === 'yearly' ? '/mo billed yearly' : `/mo`;

  // Features array - keeping the static features as per your requirement
  const features = [
    'Access to core games', 
    'Daily brain teaser', 
    'Basic insights'
  ];
  
  // Add more features for higher plans
  if (plan.name.includes('Gold') || plan.name.includes('Diamond')) {
    features.push('All games & assessments', 'Personalized training plan');
  }
  
  if (plan.name.includes('Diamond')) {
    features.push('1:1 expert sessions', 'Advanced cognitive reports');
  }

  // Get interval count for display
  const intervalCount = priceData?.intervalCount || 1;

  return (
    <div className={`relative p-[1.5px] rounded-2xl bg-gradient-to-br from-[#FF6B3E] via-[#ffb199] to-[#ffd3c8] transition-transform duration-200 hover:-translate-y-1 ${hasPlan ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
      <div className="relative rounded-2xl overflow-hidden h-full bg-white">
        {plan.name.includes('Gold') && (
          <div className="absolute -right-10 top-4 rotate-45 bg-[#FF6B3E] text-white text-xs px-10 py-1 font-semibold">
            POPULAR
          </div>
        )}
        
        {hasPlan && (
          <div className="absolute -left-2 top-4 rotate-[315deg] bg-green-500 text-white text-xs px-10 py-1 font-semibold z-10">
            {isTrial ? 'ACTIVE TRIAL' : 'CURRENT PLAN'}
          </div>
        )}
        
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(1200px 300px at -10% -20%, rgba(255,107,62,0.06), transparent 60%)'
          }}
        />
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-900" style={{ fontSize: '20px', fontWeight: 800 }}>
              {plan.name}
            </h3>
          </div>

          <p className="text-gray-500 mb-5" style={{ fontSize: '13px' }}>
            {plan.description}
          </p>

          {priceData && priceData.priceId ? (
            <>
              <CurrencyAmount amount={perMonth.toFixed(2)} suffix={priceSuffix} />

              {/* Secondary line explaining the actual billing period & total */}
              {billing === 'monthly' ? (
                <div className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>
                  Billed €{periodTotal.toFixed(2)} every {intervalCount} month{intervalCount > 1 ? 's' : ''}
                </div>
              ) : (
                <div className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>
                  Billed €{periodTotal.toFixed(2)}/yr
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 mt-4" style={{ fontSize: '14px' }}>
              Pricing not available
            </div>
          )}

          <ul className="mt-5 space-y-2">
            {features.map(f => (
              <li key={f} className="flex items-start gap-2 text-gray-700" style={{ fontSize: '13px' }}>
                <img src="/carbon_checkmark-filled.png" alt="check" className="w-4 h-4 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {priceData && priceData.priceId ? (
            <>
              {hasPlan ? (
                <button
                  className="mt-4 w-full py-3 rounded-xl bg-green-500 text-white font-semibold cursor-default"
                  disabled
                >
                  {isTrial ? 'Trial Active' : 'Current Plan'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onSelect(plan, billing)}
                    disabled={loading || !isLoggedIn}
                    className={`mt-4 w-full py-3 rounded-xl text-white font-semibold transition-all shadow ${
                      plan.name.includes('Gold') ? 'bg-[#FF6B3E] hover:brightness-95' : 'bg-gray-900 hover:brightness-110'
                    } ${loading || !isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {!isLoggedIn ? 'Login to Subscribe' : loading ? 'Processing...' : `Choose ${plan.name}`}
                  </button>
                  
                  {trialPriceData && trialPriceData.unitAmount && !hasPlan && (
                    <button
                      onClick={() => onTrialSelect(plan, 'trial')}
                      disabled={loading || !isLoggedIn}
                      className={`mt-2 w-full py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold transition-all hover:bg-gray-50 ${
                        loading || !isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {!isLoggedIn ? 'Login for Trial' : loading ? 'Processing...' : `Try ${plan.name} Trial - €${trialPriceData.unitAmount}`}
                    </button>
                  )}
                </>
              )}
            </>
          ) : (
            <button
              className="mt-4 w-full py-3 rounded-xl bg-gray-400 text-white font-semibold cursor-not-allowed"
              disabled
            >
              Currently unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function Payment() {
  const [billing, setBilling] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hint, setHint] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Get user token from localStorage and check login status
  const getUserToken = () => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const stored = JSON.parse(raw);
        setIsLoggedIn(true);
        return stored?.accessToken || stored?.user?.token || '';
      }
    } catch (e) {
      console.error('Error getting user token:', e);
    }
    setIsLoggedIn(false);
    return '';
  };

  // Check if user has an active subscription
  const checkUserSubscription = () => {
    try {
      const subscriptionData = sessionStorage.getItem('lastSubscriptionResponse');
      if (subscriptionData) {
        const subscription = JSON.parse(subscriptionData);
        if (subscription.payload && subscription.payload.data) {
          setUserSubscription({
            planId: subscription.payload.data.plan?.id,
            status: subscription.payload.data.status,
            subscriptionId: subscription.payload.data.subscriptionId
          });
        }
      }
    } catch (e) {
      console.error('Error checking user subscription:', e);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await getPlansData();
        setPlans(response.data.plans);
        checkUserSubscription();
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    getUserToken(); // Check login status on component mount
  }, []);

  // ---------- Stripe Subscription Integration ----------
  const validTypes = ['trial', 'monthly', 'yearly'];

  const validateSameOrigin = (url) => {
    try { 
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return !!url && url.startsWith(origin); 
    } catch { 
      return false; 
    }
  };

  const authHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getUserToken().trim()}`,
  });

  const persistAndLog = (obj) => {
    try {
      const wrapped = { when: Date.now(), ...obj };
      sessionStorage.setItem('lastSubscriptionResponse', JSON.stringify(wrapped, null, 2));
      console.log('[FE] Persisted payload:', wrapped);
    } catch (e) {
      console.warn('Failed to persist payload:', e);
    }
  };

  const isHealthySubStatus = (s) => {
    if (!s) return false;
    const ok = ['active', 'trialing', 'succeeded', 'processing'];
    return ok.includes(String(s).toLowerCase());
  };

  const isIncompleteSubStatus = (s) => {
    if (!s) return false;
    const incomplete = ['incomplete', 'incomplete_expired', 'past_due', 'unpaid'];
    return incomplete.includes(String(s).toLowerCase());
  };

  const handle3DSecureAuthentication = async (clientSecret, paymentMethodId, subscriptionId, suc, subType) => {
    try {
      setHint('🔐 Completing 3D Secure authentication...');

      if (typeof window.Stripe === 'undefined') {
        throw new Error('Stripe.js not loaded. Please include Stripe.js in your project.');
      }

      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

      console.log('[FE] 🔐 Starting 3D Secure authentication:', {
        clientSecret: clientSecret?.slice(0, 20) + '...',
        paymentMethodId,
        subscriptionId
      });

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (error) {
        console.error('[FE] 3D Secure error:', error);
        setError(`3D Secure authentication failed: ${error.message}`);
        setHint('');
        return;
      }

      console.log('[FE] 🔐 3D Secure result:', {
        status: paymentIntent?.status,
        id: paymentIntent?.id
      });

      if (paymentIntent?.status === 'succeeded') {
        setHint('✅ Authentication successful! Subscription created.');
        
        const qp = new URLSearchParams({
          subscription_id: subscriptionId || '',
          status: 'succeeded',
          type: subType || '',
          authenticated: 'true'
        }).toString();

        // Persist 3DS success info for success page
        try {
          const toPersist = { 
            clientSecret, 
            paymentIntent, 
            subscriptionId,
            reason: '3ds_success_redirect' 
          };
          sessionStorage.setItem('lastSubscriptionResponse', JSON.stringify({ 
            when: Date.now(), 
            ...toPersist 
          }, null, 2));
          console.log('[FE] Persisted 3DS success payload:', toPersist);
        } catch (e) {
          console.warn('Failed to persist 3DS success:', e);
        }

        console.log('[FE] ✅ Redirecting after 3DS success:', `${suc}?${qp}`);
        
        // Small delay to show success message
        setTimeout(() => {
          window.location.href = `${suc}?${qp}`;
        }, 1000);
        
      } else if (paymentIntent?.status === 'requires_action') {
        // This shouldn't happen after confirmCardPayment, but handle it
        console.warn('[FE] Payment still requires action after 3D Secure');
        setError('Payment authentication was not completed successfully. Please try again.');
        setHint('');
      } else {
        console.warn('[FE] Unexpected payment intent status:', paymentIntent?.status);
        setError(`Payment authentication resulted in unexpected status: ${paymentIntent?.status}`);
        setHint('');
      }
    } catch (err) {
      console.error('[FE] 3D Secure error:', err);
      setError(`3D Secure authentication failed: ${err.message}`);
      setHint('');
    }
  };

  const handleSubscription = async (plan, type) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setError('Please log in to subscribe to a plan.');
      return;
    }
    
    setSubscriptionLoading(true);
    setError('');
    setHint('');

    const token = getUserToken().trim();
    const planId = plan._id;
    const subType = type;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${origin}/payment/success`;
    const cancelUrl = `${origin}/payment/cancel`;

    console.log('[FE] submit /stripe/subscription', {
      tokenMasked: token ? token.slice(0, 6) + '…' : '(empty)',
      planId: planId,
      type: subType,
      successUrl: successUrl,
      cancelUrl: cancelUrl
    });

    if (!token) {
      setError('Please log in to subscribe to a plan.');
      setSubscriptionLoading(false);
      return;
    }
    
    if (!planId) {
      setError('Please select a plan.');
      setSubscriptionLoading(false);
      return;
    }
    
    if (!validTypes.includes(subType)) {
      setError(`Type must be one of: ${validTypes.join(', ')}`);
      setSubscriptionLoading(false);
      return;
    }
    
    if (!validateSameOrigin(successUrl) || !validateSameOrigin(cancelUrl)) {
      setError('Success and Cancel URLs must start with this site origin.');
      setSubscriptionLoading(false);
      return;
    }

    setHint('Processing subscription...');

    try {
      const body = { planId: planId, type: subType, successUrl: successUrl, cancelUrl: cancelUrl };
      console.log('[FE] ➜ POST', `${API_CONNECTION_HOST_URL}/stripe/subscription`, body);

      const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/subscription`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(body),
      });

      const payload = await res.json().catch(() => ({}));

      // Full logging of server response
      console.log('[FE] ⬅ /stripe/subscription', res.status, payload);
      console.log('[FE] RAW PAYLOAD ===\n' + JSON.stringify(payload, null, 2));

      if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`);

      const topStatus = payload?.status; // "success" | "requires_action" | etc.
      const data = payload?.data || {};
      const dataStatus = data?.status || data?.state;

      // ✅ 1) One-click / saved-card success-like response
      // { status: "success", data: { subscriptionId:"...", status:"active" | "incomplete" | ... } }
      if (topStatus === 'success' && data?.subscriptionId) {
        const finalStatus = (dataStatus || '').toLowerCase();

        // Handle incomplete status - this means 3D Secure is required
        if (isIncompleteSubStatus(finalStatus)) {
          console.log('[FE] 🔐 Subscription incomplete - 3D Secure likely required');
          persistAndLog({ payload, reason: 'incomplete_status_detected' });
          
          // Show user-friendly message and suggest retry or contact support
          setError(
            `Subscription created but requires additional authentication. ` +
            `This usually happens with 3D Secure cards. Please try again or contact support if the issue persists.`
          );
          setHint('💡 Tip: Try using a different card or contact your bank to enable 3D Secure authentication.');
          return;
        }

        // Block redirect on other unhealthy statuses
        if (!isHealthySubStatus(finalStatus)) {
          persistAndLog({ payload, reason: 'unhealthy_status_blocked_redirect' });
          setError(
            `Subscription created but status is "${dataStatus}". ` +
            `Please complete required steps or contact support.`
          );
          return;
        }

        // Healthy → redirect to success, but persist first
        const qp = new URLSearchParams({
          subscription_id: data.subscriptionId,
          status: dataStatus || 'active',
          type: subType,
          plan_id: data.plan?.id || planId,
        }).toString();

        persistAndLog({ payload, reason: 'redirect_success' });
        console.log('[FE] ✅ Redirecting to success:', `${successUrl}?${qp}`);
        window.location.href = `${successUrl}?${qp}`;
        return;
      }

      // 🔐 2) Requires action (3DS) - explicit response
      // { status: "requires_action", data: { requiresAction:true, clientSecret, paymentMethodId, subscriptionId } }
      const requiresAction =
        topStatus === 'requires_action' || data?.requiresAction === true;

      if (requiresAction && data?.clientSecret) {
        console.log('[FE] 🔐 3D Secure authentication required');
        setHint('🔐 3D Secure authentication required. Please complete authentication...');
        persistAndLog({ payload, reason: 'requires_action' });
        
        await handle3DSecureAuthentication(
          data.clientSecret,
          data.paymentMethodId,
          data.subscriptionId,
          successUrl,
          subType
        );
        return;
      }

      // ↪️ 3) Checkout fallback
      if (data?.url) {
        persistAndLog({ payload, reason: 'checkout_fallback_redirect' });
        console.log('[FE] ↪ Redirecting to Checkout:', data.url);
        window.location.href = data.url;
        return;
      }

      // 🧪 4) Session without URL → error (persist for diagnostics)
      if (data?.sessionId && !data?.url) {
        persistAndLog({ payload, reason: 'session_without_url' });
        throw new Error('Session created but missing redirect URL.');
      }

      // ❓ 5) Anything else
      persistAndLog({ payload, reason: 'unexpected_shape' });
      throw new Error('Unexpected response from subscription API.');
    } catch (err) {
      console.error('[FE] Error:', err);
      setError(err?.message || 'Something went wrong.');
    } finally {
      setSubscriptionLoading(false);
      setHint('');
    }
  };

  const handleSelect = (plan, currentBilling) => {
    console.log('Selected plan:', { plan, billing: currentBilling });
    handleSubscription(plan, currentBilling);
  };

  const handleTrialSelect = (plan, type) => {
    console.log('Selected trial:', { plan, type });
    handleSubscription(plan, type);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading plans...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="relative min-h-screen overflow-hidden" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fff7f4] to-white" />
        <div className="pointer-events-none absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full bg-[#ffd8cc] opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-[#ffb199] opacity-40 blur-3xl" />

        <div className="relative mx-auto px-4 lg:px-12">
          <div className="max-w-[1100px] mx-auto pt-10 pb-16">
            <div className="text-center mb-6">
              <h1 className="text-gray-900" style={{ fontSize: '32px', fontWeight: 900 }}>
                Upgrade your brain training
              </h1>
              <p className="text-gray-500 mt-2" style={{ fontSize: '14px' }}>
                Choose a plan that fits your goals. Switch anytime.
              </p>
              
              {userSubscription && (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg inline-block">
                  <strong>Current Plan:</strong> {plans.find(p => p._id === userSubscription.planId)?.name || 'Unknown'} 
                  {userSubscription.status === 'trialing' && ' (Trial)'}
                </div>
              )}
            </div>

            <Toggle value={billing} onChange={setBilling} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map(plan => (
                <PlanCard 
                  key={plan._id} 
                  plan={plan} 
                  billing={billing} 
                  onSelect={handleSelect}
                  onTrialSelect={handleTrialSelect}
                  loading={subscriptionLoading}
                  userSubscription={userSubscription}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-600">
              <div className="flex items-center justify-center gap-2 bg-white/70 rounded-xl border border-gray-200 py-3">
                <img src="/task-complete-icon.svg" alt="guarantee" className="w-5 h-5" />
                <span className="text-sm">30-day money back guarantee</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/70 rounded-xl border border-gray-200 py-3">
                <img src="/carbon_checkmark-filled.png" alt="cancel" className="w-5 h-5" />
                <span className="text-sm">Cancel anytime</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/70 rounded-xl border border-gray-200 py-3">
                <img src="/carbon_checkmark-filled.png" alt="secure" className="w-5 h-5" />
                <span className="text-sm">Secure payments</span>
              </div>
            </div>

            {/* Display subscription process alerts and hints */}
            <div className="mt-6 max-w-md mx-auto">
              <Alert message={error} />
              <Hint text={hint} />
            </div>
            
            {!isLoggedIn && (
              <div className="mt-6 text-center">
                <p className="text-gray-600">Please log in to subscribe to a plan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Payment;