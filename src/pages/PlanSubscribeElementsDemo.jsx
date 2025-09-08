import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { API_CONNECTION_HOST_URL } from '../utils/constant';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function Alert({ message }) {
  if (!message) return null;
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3" role="alert">
      {message}
    </div>
  );
}

function LabeledInput({ id, label, value, onChange, required, type = 'text', placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}

function SubscribeForm({ origin }) {
  const stripe = useStripe();
  const elements = useElements();

  const [userToken, setUserToken] = useState('');
  const [recurringPriceId, setRecurringPriceId] = useState('');
  const [oneTimePriceId, setOneTimePriceId] = useState('');
  const [trialDays, setTrialDays] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const stored = JSON.parse(raw);
        const token = stored?.accessToken || stored?.user?.token || '';
        if (token) setUserToken(token);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || loading) return;
    setError('');

    const token = userToken.trim();
    const recId = recurringPriceId.trim();
    const oneId = oneTimePriceId.trim();
    const trial = String(trialDays || '0').trim();
    if (!token || !recId) { setError('User Token and Recurring Price ID are required.'); return; }

    setLoading(true);
    try {
      // Step 1: Create SetupIntent to collect and save card
      const siRes = await fetch(`${API_CONNECTION_HOST_URL}/stripe/plan/setup-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const siPayload = await siRes.json().catch(() => ({}));
      if (!siRes.ok) throw new Error(siPayload?.message || `SetupIntent failed (${siRes.status})`);
      const clientSecret = siPayload?.data?.clientSecret;
      if (!clientSecret) throw new Error('Missing SetupIntent clientSecret');

      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Card element not found');

      const setupRes = await stripe.confirmCardSetup(clientSecret, { payment_method: { card } });
      if (setupRes.error) throw new Error(setupRes.error.message || 'Card setup failed');
      const paymentMethodId = setupRes.setupIntent?.payment_method;
      if (!paymentMethodId) throw new Error('No payment method returned');

      // Step 2: Subscribe using saved payment method
      const subRes = await fetch(`${API_CONNECTION_HOST_URL}/stripe/plan/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recurringPriceId: recId, oneTimePriceId: oneId || undefined, trialDays: Number(trial) || 0, paymentMethodId }),
      });
      const subPayload = await subRes.json().catch(() => ({}));
      if (!subRes.ok) throw new Error(subPayload?.message || `Subscribe failed (${subRes.status})`);
      const data = subPayload?.data || {};

      if (data?.status === 'requires_action' && data?.clientSecret) {
        const confirm = await stripe.confirmCardPayment(data.clientSecret);
        if (confirm.error) throw new Error(confirm.error.message || 'Authentication failed');
        // Optionally re-poll subscribe endpoint if needed, or assume webhook completes activation
      }

      if (data?.subscriptionId) setSubscriptionId(data.subscriptionId);
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6">
      <LabeledInput id="userToken" label="User Token" required value={userToken} onChange={setUserToken} placeholder="JWT or session token" />
      <LabeledInput id="recurringPriceId" label="Recurring Price ID" required value={recurringPriceId} onChange={setRecurringPriceId} placeholder="price_... (subscription)" />
      <LabeledInput id="oneTimePriceId" label="One-time Price ID" value={oneTimePriceId} onChange={setOneTimePriceId} placeholder="price_... (setup/one-time)" />
      <LabeledInput id="trialDays" label="Trial days" type="number" value={trialDays} onChange={setTrialDays} placeholder="0" />
      <div>
        <label className="block text-gray-700 mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>Card details</label>
        <div className="rounded-xl border border-gray-200 p-3 bg-white">
          <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: '16px' } } }} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="submit" disabled={loading || !stripe} className={`px-4 py-2 rounded-xl text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[#FF6B3E] hover:brightness-95'}`}>
          {loading ? 'Processing…' : 'Start subscription'}
        </button>
      </div>
      {subscriptionId && (
        <div className="rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
          Subscription created: <span className="font-mono">{subscriptionId}</span>
        </div>
      )}
      <Alert message={error} />
    </form>
  );
}

export default function PlanSubscribeElementsDemo() {
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);
  return (
    <MainLayout>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12">
          <div className="max-w-[640px] mx-auto pt-8 pb-16">
            <div className="mb-6 text-center">
              <h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 900 }}>Plan Subscribe (Elements)</h1>
              <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>Save a card with SetupIntent and create a subscription</p>
            </div>
            <Elements stripe={stripePromise} options={{ fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap' }] }}>
              <SubscribeForm origin={origin} />
            </Elements>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


