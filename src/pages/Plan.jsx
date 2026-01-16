import React, { useMemo, useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { getPlansData } from '../services/dashbaordService';
import StripeElementsCheckoutModal from '../components/Payment/StripeElementsCheckoutModal';

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
    <div className="flex items-end gap-1 flex-wrap">
      <span className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>
        €
      </span>
      <span className="text-gray-900" style={{ fontSize: '44px', fontWeight: 800, lineHeight: 1 }}>
        {amount}
      </span>
      <span className="text-gray-500 flex-shrink-0" style={{ fontSize: '14px', fontWeight: 500 }}>
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

const PlanCard = ({ plan, billing, onSelect, onTrialSelect, userSubscription, isLoggedIn }) => {
  const priceData = plan.prices[billing === 'monthly' ? 'monthly' : 'yearly'];
  const trialPriceData = plan.prices.trial;
  
  const hasPlan = userSubscription && userSubscription.planId === plan._id;
  const isTrial = userSubscription && userSubscription.status === 'trialing' && userSubscription.planId === plan._id;
  
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
    <div className={`relative p-[1.5px] rounded-2xl bg-gradient-to-br from-[#FF6B3E] via-[#ffb199] to-[#ffd3c8] transition-transform duration-200 hover:-translate-y-1 max-w-[320px] mx-auto ${hasPlan ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
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
              <div className="text-gray-500 mt-1 min-h-[16px]" style={{ fontSize: '12px' }}>
                {billing === 'monthly' ? (
                  <>Billed €{periodTotal.toFixed(2)} every {intervalCount} month{intervalCount > 1 ? 's' : ''}</>
                ) : (
                  <>Billed €{periodTotal.toFixed(2)}/yr</>
                )}
              </div>
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
                    disabled={!isLoggedIn}
                    className={`mt-4 w-full py-3 rounded-xl text-white font-semibold transition-all shadow ${
                      plan.name.includes('Gold') ? 'bg-[#FF6B3E] hover:brightness-95' : 'bg-gray-900 hover:brightness-110'
                    } ${!isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {!isLoggedIn ? 'Login to Subscribe' : `Choose ${plan.name}`}
                  </button>
                  
                  {trialPriceData && trialPriceData.unitAmount && !hasPlan && billing !== 'yearly' && (
                    <button
                      onClick={() => onTrialSelect(plan)}
                      disabled={!isLoggedIn}
                      className={`mt-2 w-full py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold transition-all hover:bg-gray-50 ${
                        !isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {!isLoggedIn ? 'Login for Trial' : `Try ${plan.name} Trial - €${trialPriceData.unitAmount}`}
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
  const [error, setError] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Stripe Elements Modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanType, setSelectedPlanType] = useState('monthly');


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

    const checkLoggedIn = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const stored = JSON.parse(raw);
          const token = stored?.accessToken || stored?.user?.token || '';
          setIsLoggedIn(!!token);
        } else {
          setIsLoggedIn(false);
        }
      } catch (e) {
        console.error('Error checking login status:', e);
        setIsLoggedIn(false);
      }
    };

    fetchPlans();
    checkLoggedIn();
  }, []);

  // Open checkout modal with selected plan
  const handleSelect = (plan, currentBilling) => {
    if (!isLoggedIn) {
      setError('Please log in to subscribe to a plan.');
      return;
    }
    console.log('Selected plan:', { plan, billing: currentBilling });
    setSelectedPlan(plan);
    setSelectedPlanType(currentBilling);
    setCheckoutModalOpen(true);
  };

  const handleTrialSelect = (plan) => {
    if (!isLoggedIn) {
      setError('Please log in to subscribe to a plan.');
      return;
    }
    console.log('Selected trial:', { plan });
    setSelectedPlan(plan);
    setSelectedPlanType('trial');
    setCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setCheckoutModalOpen(false);
    setSelectedPlan(null);
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

            <div className={`grid gap-6 ${plans.length === 1 ? 'justify-items-center md:grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {plans.map(plan => (
                <PlanCard 
                  key={plan._id} 
                  plan={plan} 
                  billing={billing} 
                  onSelect={handleSelect}
                  onTrialSelect={handleTrialSelect}
                  userSubscription={userSubscription}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>

            {/* Stripe Elements Checkout Modal */}
            <StripeElementsCheckoutModal
              isOpen={checkoutModalOpen}
              onClose={handleCloseCheckoutModal}
              plan={selectedPlan}
              initialPlanType={selectedPlanType}
            />

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