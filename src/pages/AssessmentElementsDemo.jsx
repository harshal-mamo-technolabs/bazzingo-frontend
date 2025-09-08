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

function ElementsForm({ origin }) {
  const stripe = useStripe();
  const elements = useElements();

  const [userToken, setUserToken] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [successUrl, setSuccessUrl] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [payMethod, setPayMethod] = useState('elements'); // 'elements' | 'oneclick'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!origin) return;
    setSuccessUrl(`${origin}/payment/success`);
    setCancelUrl(`${origin}/payment/cancel`);
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const stored = JSON.parse(raw);
        const token = stored?.accessToken || stored?.user?.token || '';
        if (token) setUserToken(token);
      }
    } catch {}
  }, [origin]);

  const validateSameOrigin = (url) => {
    try { return !!url && url.startsWith(origin); } catch { return false; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const token = userToken.trim();
    const id = assessmentId.trim();
    const suc = successUrl.trim();
    const can = cancelUrl.trim();

    if (!token || !id) { setError('Please provide both User Token and Assessment ID.'); return; }
    if (!validateSameOrigin(suc) || !validateSameOrigin(can)) { setError('Success and Cancel URLs must start with current site origin.'); return; }

    setLoading(true);
    try {
      if (payMethod === 'oneclick') {
        // One‑click flow
        const r = await fetch(`${API_CONNECTION_HOST_URL}/stripe/oneclick`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ assessmentId: id }),
        });
        const pl = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(pl?.message || `Request failed (${r.status})`);
        const resp = pl?.data || {};

        if (resp?.status === 'success' || resp?.status === 'succeeded' || resp?.status === 'processing') {
          window.location.href = `${suc}?order_id=${encodeURIComponent(resp?.orderId || '')}`;
          return;
        }
        if (resp?.requiresAction && resp?.clientSecret) {
          const s = await stripePromise;
          if (!s) throw new Error('Stripe not loaded');
          const confirm = await s.confirmCardPayment(resp.clientSecret);
          if (confirm.error) throw new Error(confirm.error.message || 'Authentication failed');
          window.location.href = `${suc}?order_id=${encodeURIComponent(resp?.orderId || '')}`;
          return;
        }
        if (resp?.status === 'no_saved_method') {
          setPayMethod('elements');
          setError('No saved card found. Please enter card details below.');
          return;
        }
        if (resp?.url) {
          window.location.href = resp.url;
          return;
        }
        throw new Error('Unexpected one‑click response.');
      } else {
        // Elements flow (card only), ensure Stripe is ready
        if (!stripe || !elements) throw new Error('Stripe not loaded');

        const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/elements/intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ assessmentId: id, saveCard: true }),
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`);
        const data = payload?.data || {};
        const clientSecret = data.clientSecret;
        if (!clientSecret) throw new Error('Missing clientSecret for Elements payment.');

        const card = elements.getElement(CardElement);
        if (!card) throw new Error('Card element not found');

        // First attempt confirms and handles actions
        let result = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: { card } },
          { handleActions: true }
        );
        if (result.error) throw new Error(result.error.message || 'Payment failed');

        if (result.paymentIntent?.status === 'requires_action') {
          // If still requires action, call again without params
          result = await stripe.confirmCardPayment(clientSecret);
          if (result.error) throw new Error(result.error.message || 'Authentication failed');
        }

        window.location.href = `${suc}?order_id=${encodeURIComponent(data?.orderId || '')}`;
        return;
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="radio" name="payMethod" value="elements" checked={payMethod==='elements'} onChange={() => setPayMethod('elements')} />
          <span>Pay with card (Elements)</span>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="radio" name="payMethod" value="oneclick" checked={payMethod==='oneclick'} onChange={() => setPayMethod('oneclick')} />
          <span>One‑click (saved card)</span>
        </label>
      </div>
      <LabeledInput id="userToken" label="User Token" required value={userToken} onChange={setUserToken} placeholder="JWT or session token" />
      <LabeledInput id="assessmentId" label="Assessment ID" required value={assessmentId} onChange={setAssessmentId} placeholder="e.g. 64fb12..." />
      <LabeledInput id="successUrl" label="Success URL" value={successUrl} onChange={setSuccessUrl} placeholder={`${origin}/payment/success`} />
      <LabeledInput id="cancelUrl" label="Cancel URL" value={cancelUrl} onChange={setCancelUrl} placeholder={`${origin}/payment/cancel`} />
      {payMethod==='elements' && (
        <div>
          <label className="block text-gray-700 mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>Card details</label>
          <div className="rounded-xl border border-gray-200 p-3 bg-white">
            <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: '16px' } } }} />
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={() => { setUserToken(''); setAssessmentId(''); }} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
          Clear
        </button>
        <button type="submit" disabled={loading || (payMethod==='elements' && (!stripe || !elements))} className={`px-4 py-2 rounded-xl text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[#FF6B3E] hover:brightness-95'}`}>
          {loading ? 'Processing…' : (payMethod==='elements' ? 'Pay with card' : 'Pay with saved card')}
        </button>
      </div>
      <Alert message={error} />
    </form>
  );
}

export default function AssessmentElementsDemo() {
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);

  return (
    <MainLayout>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12">
          <div className="max-w-[640px] mx-auto pt-8 pb-16">
            <div className="mb-6 text-center">
              <h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 900 }}>Assessment Elements Demo</h1>
              <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>
                Pay with card using Stripe Elements (saves card for one‑click)
              </p>
            </div>
            <Elements stripe={stripePromise} options={{ fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap' }] }}>
              <ElementsForm origin={origin} />
            </Elements>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


