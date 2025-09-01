import React, { useMemo, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const PLANS = [
  {
    key: 'starter',
    title: 'Starter',
    desc: 'Kickstart your cognitive journey',
    monthly: 4.99,
    yearly: 39.99,
    monthlyIntervalMonths: 1,
    features: ['Access to core games', 'Daily brain teaser', 'Basic insights']
  },
  {
    key: 'pro',
    title: 'Pro',
    desc: 'Level up with advanced analytics',
    monthly: 9.99,
    yearly: 79.99,
    monthlyIntervalMonths: 2, // billed every 2 months
    isPopular: true,
    features: [
      'All games & assessments',
      'Personalized training plan',
      'Deep performance analytics',
      'Priority support'
    ]
  },
  {
    key: 'elite',
    title: 'Elite',
    desc: 'Max results with coaching & insights',
    monthly: 19.99,
    yearly: 159.99,
    monthlyIntervalMonths: 3, // billed every 3 months
    features: [
      'Everything in Pro',
      '1:1 expert sessions',
      'Advanced cognitive reports',
      'Exclusive challenges'
    ]
  }
];

function CurrencyAmount({ amount, suffix }) {
  return (
    <div className="flex items-end gap-1">
      <span className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700 }}>
        $
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

const PlanCard = ({ plan, billing, onSelect }) => {
  const perMonth = useMemo(
    () => (billing === 'yearly' ? plan.yearly / 12 : plan.monthly),
    [billing, plan]
  );

  // for Monthly view, we also show the period charge (perMonth * intervalMonths)
  const periodMonths = billing === 'monthly' ? plan.monthlyIntervalMonths || 1 : 12;
  const periodTotal =
    billing === 'monthly'
      ? (plan.monthly * (plan.monthlyIntervalMonths || 1))
      : plan.yearly;

  const priceSuffix =
    billing === 'yearly' ? '/mo billed yearly' : `/mo`;

  return (
    <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-br from-[#FF6B3E] via-[#ffb199] to-[#ffd3c8] transition-transform duration-200 hover:-translate-y-1">
      <div className="relative rounded-2xl overflow-hidden h-full bg-white">
        {plan.isPopular && (
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
              {plan.title}
            </h3>
          </div>

          <p className="text-gray-500 mb-5" style={{ fontSize: '13px' }}>
            {plan.desc}
          </p>

          <CurrencyAmount amount={perMonth.toFixed(2)} suffix={priceSuffix} />

          {/* Secondary line explaining the actual billing period & total */}
          {billing === 'monthly' ? (
            <div className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>
              Billed ${periodTotal.toFixed(2)} every {periodMonths} month{periodMonths > 1 ? 's' : ''}
            </div>
          ) : (
            <div className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>
              Billed ${plan.yearly.toFixed(2)}/yr
            </div>
          )}

          <ul className="mt-5 space-y-2">
            {plan.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-gray-700" style={{ fontSize: '13px' }}>
                <img src="/carbon_checkmark-filled.png" alt="check" className="w-4 h-4 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => onSelect(plan.key, billing)}
            className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition-all shadow ${
              plan.isPopular ? 'bg-[#FF6B3E] hover:brightness-95' : 'bg-gray-900 hover:brightness-110'
            }`}
          >
            Choose {plan.title}
          </button>
        </div>
      </div>
    </div>
  );
};

function Payment() {
  const [billing, setBilling] = useState('monthly');

  const handleSelect = (planKey, currentBilling) => {
    console.log('Selected plan:', { planKey, billing: currentBilling });
    alert(`Selected ${planKey} (${currentBilling})`);
  };

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
              {PLANS.map(p => (
                <PlanCard key={p.key} plan={p} billing={billing} onSelect={handleSelect} />
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
