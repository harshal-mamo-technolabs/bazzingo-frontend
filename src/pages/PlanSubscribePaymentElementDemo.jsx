import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { API_CONNECTION_HOST_URL } from '../utils/constant';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

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

function FirstTimeForm({ userToken, recurringPriceId, setRecurringPriceId, trialDays, setTrialDays, oneTimePriceId, setOneTimePriceId, onClientSecret, loading, setLoading, setError, setSubscriptionId }) {
  const createIntent = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    const token = userToken.trim();
    const recId = recurringPriceId.trim();
    const trial = String(trialDays || '0').trim();
    const oneId = (oneTimePriceId || '').trim();
    if (!token || !recId) { setError('User Token and Recurring Price ID are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/plan/subscribe/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recurringPriceId: recId, trialDays: Number(trial) || 0, oneTimePriceId: oneId || undefined }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`);
      const cs = payload?.data?.clientSecret;
      if (!cs) throw new Error('Missing clientSecret');
      if (payload?.data?.subscriptionId) setSubscriptionId(payload.data.subscriptionId);
      onClientSecret(cs);
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={createIntent} className="space-y-4">
      <LabeledInput id="recurringPriceId" label="Recurring Price ID" required value={recurringPriceId} onChange={setRecurringPriceId} placeholder="price_... (subscription)" />
      <LabeledInput id="oneTimePriceId" label="One-time Price ID" value={oneTimePriceId} onChange={setOneTimePriceId} placeholder="price_... (setup/one-time)" />
      <LabeledInput id="trialDays" label="Trial days" type="number" value={trialDays} onChange={setTrialDays} placeholder="0" />
      <div className="flex items-center justify-end pt-2">
        <button type="submit" disabled={loading} className={`px-4 py-2 rounded-xl text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[#FF6B3E] hover:brightness-95'}`}>
          {loading ? 'Preparing…' : 'Create intent'}
        </button>
      </div>
    </form>
  );
}

function FirstTimeConfirm({ clientSecret, setSubscriptionId, setError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await stripe.confirmPayment({ elements, clientSecret });
      if (result.error) throw new Error(result.error.message || 'Payment failed');
      // Optional: attempt to read subscriptionId from PaymentIntent metadata if backend set it
      const subId = result?.paymentIntent?.metadata?.subscriptionId;
      if (subId) setSubscriptionId(subId);
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-6">
      <div className="rounded-xl border border-gray-200 p-3 bg-white">
        <PaymentElement />
      </div>
      <div className="flex items-center justify-end">
        <button type="submit" disabled={loading || !stripe} className={`px-4 py-2 rounded-xl text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[#FF6B3E] hover:brightness-95'}`}>
          {loading ? 'Processing…' : 'Pay now'}
        </button>
      </div>
    </form>
  );
}

function OneClickForm({ userToken, setError, setSubscriptionId }) {
  const [recurringPriceId, setRecurringPriceId] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    const token = userToken.trim();
    const recId = recurringPriceId.trim();
    if (!token || !recId) { setError('User Token and Recurring Price ID are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/plan/oneclick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recurringPriceId: recId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`);
      const data = payload?.data || {};
      if (data?.requiresAction && data?.clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe not loaded');
        const confirm = await stripe.confirmCardPayment(data.clientSecret);
        if (confirm.error) throw new Error(confirm.error.message || 'Authentication failed');
      }
      if (data?.subscriptionId) setSubscriptionId(data.subscriptionId);
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <LabeledInput id="recurringPriceId2" label="Recurring Price ID" required value={recurringPriceId} onChange={setRecurringPriceId} placeholder="price_... (subscription)" />
      <div className="flex items-center justify-end">
        <button type="submit" disabled={loading} className={`px-4 py-2 rounded-xl text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[#FF6B3E] hover:brightness-95'}`}>
          {loading ? 'Processing…' : 'Subscribe with saved card'}
        </button>
      </div>
    </form>
  );
}

function SaveCardForm({ userToken, setError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || loading) return;
    setError('');
    setLoading(true);
    try {
      const token = userToken.trim();
      if (!token) throw new Error('Missing user token');

      const siRes = await fetch(`${API_CONNECTION_HOST_URL}/stripe/plan/setup-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });
      const siPayload = await siRes.json().catch(() => ({}));
      if (!siRes.ok) throw new Error(siPayload?.message || `SetupIntent failed (${siRes.status})`);
      const clientSecret = siPayload?.data?.clientSecret;
      if (!clientSecret) throw new Error('Missing SetupIntent clientSecret');

      const result = await stripe.confirmCardSetup(clientSecret, { payment_method: { card: elements.getElement(PaymentElement) || elements.getElement('card') } });
      if (result.error) throw new Error(result.error.message || 'Card setup failed');
      const paymentMethodId = result?.setupIntent?.payment_method;
      if (!paymentMethodId) throw new Error('No payment method returned');

      const upd = await fetch(`${API_CONNECTION_HOST_URL}/stripe/update-default-payment-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentMethodId }),
      });
      const uPayload = await upd.json().catch(() => ({}));
      if (!upd.ok) throw new Error(uPayload?.message || `Update default payment method failed (${upd.status})`);

      setSaved(true);
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl border border-gray-200 p-3 bg-white">
        <PaymentElement />
      </div>
      <div className="flex items-center justify-end">
        <button type="submit" disabled={loading || !stripe} className={`px-4 py-2 rounded-xl text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[#FF6B3E] hover:brightness-95'}`}>
          {loading ? 'Saving…' : 'Save card'}
        </button>
      </div>
      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
          Default payment method updated.
        </div>
      )}
    </form>
  );
}

export default function PlanSubscribePaymentElementDemo() {
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);
  const [userToken, setUserToken] = useState('');
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [recurringPriceId, setRecurringPriceId] = useState('');
  const [oneTimePriceId, setOneTimePriceId] = useState('');
  const [trialDays, setTrialDays] = useState('0');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('first'); // 'first' | 'oneclick' | 'savecard'

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

  return (
    <MainLayout>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12">
          <div className="max-w-[720px] mx-auto pt-8 pb-16">
            <div className="mb-6 text-center">
              <h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 900 }}>Plan Subscribe (PaymentElement)</h1>
              <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>First‑time (PaymentElement), One‑click, and Save card flows</p>
            </div>

            <div className="mb-4">
              <LabeledInput id="userToken" label="User Token" required value={userToken} onChange={setUserToken} placeholder="JWT or session token" />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="mode" value="first" checked={mode==='first'} onChange={() => setMode('first')} />
                <span>First‑time (PaymentElement)</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="mode" value="oneclick" checked={mode==='oneclick'} onChange={() => setMode('oneclick')} />
                <span>One‑click</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="radio" name="mode" value="savecard" checked={mode==='savecard'} onChange={() => setMode('savecard')} />
                <span>Save card</span>
              </label>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {mode === 'first' && (
                <>
                  <FirstTimeForm
                    userToken={userToken}
                    recurringPriceId={recurringPriceId}
                    setRecurringPriceId={setRecurringPriceId}
                    trialDays={trialDays}
                    setTrialDays={setTrialDays}
                    oneTimePriceId={oneTimePriceId}
                    setOneTimePriceId={setOneTimePriceId}
                    onClientSecret={setClientSecret}
                    loading={loading}
                    setLoading={setLoading}
                    setError={setError}
                    setSubscriptionId={setSubscriptionId}
                  />
                  {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret, fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap' }] }}>
                      <FirstTimeConfirm clientSecret={clientSecret} setSubscriptionId={setSubscriptionId} setError={setError} />
                    </Elements>
                  )}
                </>
              )}

              {mode === 'oneclick' && (
                <OneClickForm userToken={userToken} setError={setError} setSubscriptionId={setSubscriptionId} />
              )}

              {mode === 'savecard' && (
                <Elements stripe={stripePromise}>
                  <SaveCardForm userToken={userToken} setError={setError} />
                </Elements>
              )}

              {subscriptionId && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
                  Subscription created: <span className="font-mono">{subscriptionId}</span>
                </div>
              )}

              <Alert message={error} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


