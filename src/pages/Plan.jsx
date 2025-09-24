import React, { useMemo, useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { getPlansData } from '../services/dashbaordService';
import { API_CONNECTION_HOST_URL } from '../utils/constant';
import { loadStripe } from '@stripe/stripe-js';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <MainLayout>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-4">
                There was an error loading the plan page. Please refresh the page to try again.
              </div>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </MainLayout>
      );
    }

    return this.props.children;
  }
}

function Alert({ message }) {
  if (!message) return null;
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3" role="alert">
      {message}
    </div>
  );
}

function Hint({ text }) {
  if (!text) return null;
  return (
    <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 px-4 py-2 text-xs">
      {text}
    </div>
  );
}

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

const PlanCard = ({ plan, billing, onSelect, onTrialSelect, loading, userSubscription, isLoggedIn, processingPlanId }) => {
  const priceData = plan.prices[billing === 'monthly' ? 'monthly' : 'yearly'];
  const trialPriceData = plan.prices.trial;
  
  const hasPlan = userSubscription && userSubscription.planId === plan._id;
  const isTrial = userSubscription && userSubscription.status === 'trialing' && userSubscription.planId === plan._id;
  const isProcessing = processingPlanId === plan._id;
  
  const perMonth = useMemo(() => {
    if (!priceData || !priceData.priceId) return 0;
    
    if (billing === 'yearly') {
      return priceData.priceId.unitAmount / 12;
    }
    
    const intervalCount = priceData.intervalCount || 1;
    return priceData.priceId.unitAmount / intervalCount;
  }, [billing, priceData]);

  const periodTotal = useMemo(() => {
    if (!priceData || !priceData.priceId) return 0;
    return priceData.priceId.unitAmount;
  }, [priceData]);

  const priceSuffix = billing === 'yearly' ? '/mo billed yearly' : `/mo`;

  const features = [
    'Access to core games', 
    'Daily brain teaser', 
    'Basic insights'
  ];
  
  if (plan.name.includes('Gold') || plan.name.includes('Diamond')) {
    features.push('All games & assessments', 'Personalized training plan');
  }
  
  if (plan.name.includes('Diamond')) {
    features.push('1:1 expert sessions', 'Advanced cognitive reports');
  }

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
                    disabled={isProcessing || !isLoggedIn}
                    className={`mt-4 w-full py-3 rounded-xl text-white font-semibold transition-all shadow ${
                      plan.name.includes('Gold') ? 'bg-[#FF6B3E] hover:brightness-95' : 'bg-gray-900 hover:brightness-110'
                    } ${isProcessing || !isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {!isLoggedIn ? 'Login to Subscribe' : isProcessing ? 'Processing...' : `Choose ${plan.name}`}
                  </button>
                  
                  {trialPriceData && trialPriceData.unitAmount && !hasPlan && billing !== 'yearly' && (
                    <button
                      onClick={() => onTrialSelect(plan, 'trial')}
                      disabled={isProcessing || !isLoggedIn}
                      className={`mt-2 w-full py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold transition-all hover:bg-gray-50 ${
                        isProcessing || !isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {!isLoggedIn ? 'Login for Trial' : isProcessing ? 'Processing...' : `Try ${plan.name} Trial - €${trialPriceData.unitAmount}`}
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
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [error, setError] = useState(null);
  const [hint, setHint] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);
  const [userToken, setUserToken] = useState('');


  const checkUserSubscription = () => {
    try {
      const subscriptionData = sessionStorage.getItem('lastSubscriptionResponse');
      if (subscriptionData) {
        const subscription = JSON.parse(subscriptionData);
        if (subscription.payload && subscription.payload.data) {
          const status = subscription.payload.data.status;
          const subscriptionId = subscription.payload.data.subscriptionId;
          
          const isHealthyStatus = ['active', 'trialing', 'succeeded', 'processing'].includes(status?.toLowerCase());
          const hasValidSubscriptionId = subscriptionId && subscriptionId.trim() !== '';
          const isSuccessReason = !subscription.reason || 
            ['redirect_success', '3ds_success_redirect'].includes(subscription.reason);
          
          if (isHealthyStatus && hasValidSubscriptionId && isSuccessReason) {
          setUserSubscription({
            planId: subscription.payload.data.plan?.id,
              status: status,
              subscriptionId: subscriptionId
            });
          } else {
            setUserSubscription(null);
          }
        }
      }
    } catch (e) {
      console.error('Error checking user subscription:', e);
      setUserSubscription(null);
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

    const initializeStripe = async () => {
      try {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');
        setStripePromise(stripe);
      } catch (err) {
        console.error('Failed to initialize Stripe:', err);
      }
    };

    const initializeUserToken = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const stored = JSON.parse(raw);
          const token = stored?.accessToken || stored?.user?.token || '';
          setIsLoggedIn(true);
          setUserToken(token);
        } else {
          setIsLoggedIn(false);
          setUserToken('');
        }
      } catch (e) {
        console.error('Error getting user token:', e);
        setIsLoggedIn(false);
        setUserToken('');
      }
    };

    fetchPlans();
    initializeUserToken(); 
    initializeStripe();
  }, []);

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
    Authorization: `Bearer ${userToken.trim()}`,
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

  const clearInvalidSubscriptionData = () => {
    try {
      sessionStorage.removeItem('lastSubscriptionResponse');
      setUserSubscription(null);
      console.log('[FE] Cleared invalid subscription data');
    } catch (e) {
      console.warn('Failed to clear subscription data:', e);
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

  const handle3DSecureAuthenticationNewFlow = async (clientSecret, paymentMethodId, paymentIntentId, planId, subType, successUrl) => {
    try {
      if (!stripePromise) {
        console.error('❌ [3DS NEW FLOW] Stripe promise not available');
        throw new Error('Stripe not loaded. Please refresh the page and try again.');
      }

      const stripe = await stripePromise;
    
      if (!paymentMethodId) {
        console.error('❌ [3DS NEW FLOW] Payment method ID is missing');
        throw new Error('Missing payment method for 3DS confirmation. Please retry the payment.');
      }

      if (!clientSecret) {
        console.error('❌ [3DS NEW FLOW] Client secret is missing');
        throw new Error('Missing client secret for 3DS confirmation. Please retry the payment.');
      }

      if (!paymentIntentId) {
        console.error('❌ [3DS NEW FLOW] Payment intent ID is missing');
        throw new Error('Missing payment intent ID for confirmation. Please retry the payment.');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (error) {
        console.error('❌ [3DS NEW FLOW] Stripe error occurred:', error);
        throw new Error(error.message || 'Authentication failed. Please try again.');
      }
      
      await confirmSubscription(paymentIntentId, planId, subType, successUrl);
      
    } catch (err) {
      console.error('❌ [3DS NEW FLOW] 3D Secure authentication failed:', {
        timestamp: new Date().toISOString(),
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        },
        context: {
          clientSecretPreview: clientSecret?.slice(0, 20) + '...',
          paymentMethodId,
          paymentIntentId,
          planId,
          subType,
          successUrl
        }
      });
      
      setError(`Payment authentication failed: ${err.message}`);
        setHint('');
      setSubscriptionLoading(false);
    }
  };

  const confirmSubscription = async (paymentIntentId, planId, subType, successUrl) => {
    try {
      const body = { paymentIntentId, planId, type: subType };
      const headers = authHeader();

      const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/subscription/confirm`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ [CONFIRM] HTTP Error:', {
          status: res.status,
          statusText: res.statusText,
          errorText: errorText,
          url: res.url
        });
        throw new Error(`Subscription confirmation failed: ${res.status} - ${errorText}`);
      }

      const payload = await res.json().catch((parseError) => {
        console.error('❌ [CONFIRM] JSON Parse Error:', parseError);
        return {};
      });

      // Handle successful confirmation
      if (payload?.status === 'success' && payload?.data?.subscriptionId) {
        
        const qp = new URLSearchParams({
          subscription_id: payload.data.subscriptionId,
          status: payload.data.status || 'active',
          type: subType,
          plan_id: planId,
        }).toString();

        persistAndLog({ payload, reason: 'subscription_confirmed_success' });
        
        window.location.href = `${successUrl}?${qp}`;
        return;
      } else {
        throw new Error('Subscription confirmation failed: Invalid response from server');
      }

    } catch (err) {
      console.error('❌ [CONFIRM] Subscription confirmation failed:', {
        timestamp: new Date().toISOString(),
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        },
        context: {
          paymentIntentId,
          planId,
          subType,
          successUrl
        }
      });
      
      setError(`Subscription confirmation failed: ${err.message}`);
      setHint('');
      setSubscriptionLoading(false);
    }
  };

  const handle3DSecureAuthentication = async (clientSecret, paymentMethodId, subscriptionId, suc, subType) => {
    try {
      if (!stripePromise) {
        console.error('❌ [3DS AUTH] Stripe promise not available');
        throw new Error('Stripe not loaded. Please refresh the page and try again.');
      }

      const stripe = await stripePromise;

      if (!paymentMethodId) {
        console.error('❌ [3DS AUTH] Payment method ID is missing');
        throw new Error('Missing payment method for 3DS confirmation. Please retry the payment.');
      }

      if (!clientSecret) {
        console.error('❌ [3DS AUTH] Client secret is missing');
        throw new Error('Missing client secret for 3DS confirmation. Please retry the payment.');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (error) {
        console.error('❌ [3DS AUTH] Stripe error occurred:', error);
        throw new Error(error.message || 'Authentication failed. Please try again.');
      }

        const qp = new URLSearchParams({
          subscription_id: subscriptionId || '',
          status: 'succeeded',
          type: subType || '',
          authenticated: 'true'
        }).toString();

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
        } catch (e) {
        console.warn('⚠️ [3DS AUTH] Failed to persist 3DS success:', e);
        }

      const redirectUrl = `${suc}?${qp}`;
        
        setTimeout(() => {
        window.location.href = redirectUrl;
        }, 1000);
        
    } catch (err) {
      console.error('❌ [3DS AUTH] 3D Secure authentication failed:', {
        timestamp: new Date().toISOString(),
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        },
        context: {
          clientSecretPreview: clientSecret?.slice(0, 20) + '...',
          paymentMethodId,
          subscriptionId,
          successUrl: suc,
          subType
        }
      });
      
      setError(`Payment authentication failed: ${err.message}`);
      setHint('');
      setSubscriptionLoading(false);
    }
  };

  const handleSubscription = async (plan, type) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setError('Please log in to subscribe to a plan.');
      return;
    }
    
    const token = userToken.trim();
    const planId = plan._id;
    const subType = type;
    
    setSubscriptionLoading(true);
    setProcessingPlanId(planId);
    setError('');
    setHint('');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${origin}/payment/success`;
    const cancelUrl = `${origin}/payment/cancel`;

    if (!token) {
      console.error('❌ [PLAN PAYMENT] Validation failed: No user token');
      setError('Please log in to subscribe to a plan.');
      setSubscriptionLoading(false);
      return;
    }
    
    if (!planId) {
      console.error('❌ [PLAN PAYMENT] Validation failed: No plan ID');
      setError('Please select a plan.');
      setSubscriptionLoading(false);
      return;
    }
    
    if (!validTypes.includes(subType)) {
      console.error('❌ [PLAN PAYMENT] Validation failed: Invalid subscription type', { subType, validTypes });
      setError(`Type must be one of: ${validTypes.join(', ')}`);
      setSubscriptionLoading(false);
      return;
    }
    
    if (!validateSameOrigin(successUrl) || !validateSameOrigin(cancelUrl)) {
      console.error('❌ [PLAN PAYMENT] Validation failed: Invalid URLs', { successUrl, cancelUrl });
      setError('Success and Cancel URLs must start with this site origin.');
      setSubscriptionLoading(false);
      return;
    }

    try {
      const body = { planId: planId, type: subType, successUrl: successUrl, cancelUrl: cancelUrl };
      const headers = authHeader();

      const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/subscription`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ [PLAN PAYMENT] HTTP Error - API LEVEL ISSUE:', {
          timestamp: new Date().toISOString(),
          status: res.status,
          statusText: res.statusText,
          errorText: errorText,
          url: res.url,
          requestBody: body,
          requestHeaders: headers,
          issueType: 'API_ERROR',
          recommendation: 'Check server logs and API endpoint'
        });
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }

      const payload = await res.json().catch((parseError) => {
        console.error('❌ [PLAN PAYMENT] JSON Parse Error - FRONTEND ISSUE:', {
          timestamp: new Date().toISOString(),
          error: parseError,
          issueType: 'FRONTEND_PARSE_ERROR',
          recommendation: 'Check response format from server'
        });
        return {};
      });

      const topStatus = payload?.status; // "success" | "requires_action" | etc.
      const data = payload?.data || {};
      const dataStatus = data?.status || data?.state;

      if (topStatus === 'success' && data?.subscriptionId && !data?.requiresAction) {
        const finalStatus = (dataStatus || '').toLowerCase();

        if (!isHealthySubStatus(finalStatus)) {
          persistAndLog({ payload, reason: 'unhealthy_status_blocked_redirect' });
          setError(
            `Payment failed with status "${dataStatus}". ` +
            `Please try again or contact support if the issue persists.`
          );
          setSubscriptionLoading(false);
          return;
        }

        const qp = new URLSearchParams({
          subscription_id: data.subscriptionId,
          status: dataStatus || 'active',
          type: subType,
          plan_id: data.plan?.id || planId,
        }).toString();

        persistAndLog({ payload, reason: 'direct_success_redirect' });
        console.log('✅ [PLAN PAYMENT] Redirecting to success:', `${successUrl}?${qp}`);
        window.location.href = `${successUrl}?${qp}`;
        return;
      }

      const requiresAction = data?.requiresAction === true;

      if (requiresAction && data?.clientSecret && data?.paymentMethodId && data?.paymentIntentId) {
        console.log('🔐 [PLAN PAYMENT] 3D Secure authentication required - starting NEW FLOW process');
        
        if (!stripePromise) {
          console.error('❌ [PLAN PAYMENT] Stripe not loaded');
          throw new Error('Stripe not loaded. Please refresh the page and try again.');
        }
        
        persistAndLog({ payload, reason: 'requires_action_new_flow' });
        
        await handle3DSecureAuthenticationNewFlow(
          data.clientSecret,
          data.paymentMethodId,
          data.paymentIntentId,
          planId,
          subType,
          successUrl
        );
        return;
      }

      if (data?.url) {
        persistAndLog({ payload, reason: 'checkout_fallback_redirect' });
        console.log('[FE] ↪ Redirecting to Checkout:', data.url);
        window.location.href = data.url;
        return;
      }

      if (data?.sessionId && !data?.url) {
        persistAndLog({ payload, reason: 'session_without_url' });
        throw new Error('Session created but missing redirect URL.');
      }

      persistAndLog({ payload, reason: 'unexpected_shape' });
      throw new Error('Unexpected response from subscription API.');
    } catch (err) {
      console.error('❌ [PLAN PAYMENT] Subscription process failed - DETAILED ERROR ANALYSIS:', {
        timestamp: new Date().toISOString(),
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack,
          cause: err.cause
        },
        context: {
          planId,
          subType,
          isLoggedIn,
          stripeLoaded: !!stripePromise,
          userTokenLength: token.length,
          apiUrl: `${API_CONNECTION_HOST_URL}/stripe/subscription`
        },
        issueType: err.message.includes('Server error') ? 'API_ISSUE' : 'FRONTEND_ISSUE',
        recommendation: err.message.includes('Server error') 
          ? 'Check API server logs and endpoint availability' 
          : 'Check frontend code and network connectivity'
      });
      
      setError(err?.message || 'Something went wrong.');
      clearInvalidSubscriptionData();
    } finally {
      console.log('🏁 [PLAN PAYMENT] Subscription process completed, cleaning up');
      setSubscriptionLoading(false);
      setProcessingPlanId(null);
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

  const refreshSubscriptionStatus = () => {
    checkUserSubscription();
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
                  processingPlanId={processingPlanId}
                  userSubscription={userSubscription}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-600">
              <div className="flex items-center justify-center gap-2 bg-white/70 rounded-xl border border-gray-200 py-3">
                <img src="/task-complete-icon.svg" alt="guarantee" className="w-5 h-5" />
                <span className="text-sm">Smooth payment experience</span>
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

// Wrap Payment component with ErrorBoundary
const PaymentWithErrorBoundary = () => (
  <ErrorBoundary>
    <Payment />
  </ErrorBoundary>
);

export default PaymentWithErrorBoundary;