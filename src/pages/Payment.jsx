import React, { useMemo, useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { getPlansData } from '../services/dashbaordService';

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

// fixed pill toggle (no overflow)
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

const PlanCard = ({ plan, billing, onSelect, onTrialSelect }) => {
  // Get the price based on billing period
  const priceData = plan.prices[billing === 'monthly' ? 'monthly' : 'yearly'];
  const trialPriceData = plan.prices.trial;
  
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
    <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-br from-[#FF6B3E] via-[#ffb199] to-[#ffd3c8] transition-transform duration-200 hover:-translate-y-1">
      <div className="relative rounded-2xl overflow-hidden h-full bg-white">
        {plan.name.includes('Gold') && (
          <div className="absolute -right-10 top-4 rotate-45 bg-[#FF6B3E] text-white text-xs px-10 py-1 font-semibold">
            POPULAR
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
              <button
                onClick={() => onSelect(plan, billing)}
                className={`mt-4 w-full py-3 rounded-xl text-white font-semibold transition-all shadow ${
                  plan.name.includes('Gold') ? 'bg-[#FF6B3E] hover:brightness-95' : 'bg-gray-900 hover:brightness-110'
                }`}
              >
                Choose {plan.name}
              </button>
              
              {trialPriceData && trialPriceData.unitAmount && (
                <button
                  onClick={() => onTrialSelect(plan, 'trial')}
                  className="mt-2 w-full py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold transition-all hover:bg-gray-50"
                >
                  Try {plan.name} Trial - €{trialPriceData.unitAmount}
                </button>
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

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await getPlansData();
        setPlans(response.data.plans);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelect = (plan, currentBilling) => {
    console.log('Selected plan:', { plan, billing: currentBilling });
    const priceData = plan.prices[currentBilling === 'monthly' ? 'monthly' : 'yearly'];
    if (priceData && priceData.priceId) {
      alert(`Selected ${plan.name} (${currentBilling}) for €${priceData.priceId.unitAmount}`);
    } else {
      alert(`Pricing not available for ${plan.name} (${currentBilling})`);
    }
  };

  const handleTrialSelect = (plan, type) => {
    console.log('Selected trial:', { plan, type });
    if (plan.prices.trial && plan.prices.trial.unitAmount) {
      alert(`Selected ${plan.name} trial for €${plan.prices.trial.unitAmount}`);
    } else {
      alert(`Trial not available for ${plan.name}`);
    }
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

  if (error) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error: {error}</p>
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Payment;