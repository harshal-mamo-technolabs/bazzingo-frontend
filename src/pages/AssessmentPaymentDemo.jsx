// src/pages/AssessmentPaymentDemo.tsx
import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { API_CONNECTION_HOST_URL } from '../utils/constant';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Alert({ message }) {
  if (!message) return null;
  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3" role="alert">
      {message}
    </div>
  );
}

function LabeledInput({
  id, label, value, onChange, required, type = 'text', placeholder,
}) {
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

export default function AssessmentPaymentDemo() {
  const [userToken, setUserToken] = useState('');
  const [assessmentId, setAssessmentId] = useState('');
  const [successUrl, setSuccessUrl] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);

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
      console.log('[Frontend] Sending request to backend:', {
        endpoint: `${API_CONNECTION_HOST_URL}/stripe/checkout/session`,
        body: { assessmentId: id, successUrl: suc, cancelUrl: can },
      });

      const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/checkout/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assessmentId: id, successUrl: suc, cancelUrl: can }),
      });

      const payload = await res.json().catch(() => ({}));
      console.log('[Frontend] Raw backend response:', payload);
      if (!res.ok) throw new Error(payload?.message || `Request failed (${res.status})`);

      const resp = payload?.data;
      console.log('[Frontend] Parsed response.data:', resp);

      // A) Checkout fallback -> redirect
      if (resp?.url) {
        console.log('[Frontend] Redirecting to Stripe Checkout:', resp.url);
        window.location.href = resp.url;
        return;
      }

      // B) One-click succeeded / processing
      if (resp?.orderId && (resp.status === 'succeeded' || resp.status === 'processing')) {
        console.log('[Frontend] One-click success, redirecting to success page', { orderId: resp.orderId });
        window.location.href = `${suc}?order_id=${encodeURIComponent(resp.orderId)}`;
        return;
      }

      // C) One-click requires 3DS — MUST pass payment_method
      if (resp?.requiresAction && resp?.clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe not loaded');

        console.log('[Frontend] One-click requires 3DS, confirming PI with:', {
          clientSecretPreview: resp.clientSecret?.slice(0, 24) + '...',
          paymentMethodId: resp.paymentMethodId,
          orderId: resp.orderId,
        });

        if (!resp.paymentMethodId) {
          throw new Error('Missing payment method for 3DS confirmation. Please retry the payment.');
        }

        const result = await stripe.confirmCardPayment(resp.clientSecret, {
          payment_method: resp.paymentMethodId,
        });
        console.log('[Frontend] Stripe confirmCardPayment result:', result);
        if (result.error) throw new Error(result.error.message || 'Authentication failed. Please try again.');

        window.location.href = `${suc}?order_id=${encodeURIComponent(resp.orderId)}`;
        return;
      }

      throw new Error('Unexpected response from server.');
    } catch (err) {
      console.error('[Frontend] Error in handleSubmit:', err);
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12">
          <div className="max-w-[640px] mx-auto pt-8 pb-16">
            <div className="mb-6 text-center">
              <h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 900 }}>Assessment Checkout Demo</h1>
              <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>
                Test card-only Stripe Checkout (with one-click when available)
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6">
              <LabeledInput id="userToken" label="User Token" required value={userToken} onChange={setUserToken} placeholder="JWT or session token" />
              <LabeledInput id="assessmentId" label="Assessment ID" required value={assessmentId} onChange={setAssessmentId} placeholder="e.g. 64fb12c8a1b23d4567890abc" />
              <LabeledInput id="successUrl" label="Success URL" value={successUrl} onChange={setSuccessUrl} placeholder={`${origin}/payment/success`} />
              <LabeledInput id="cancelUrl" label="Cancel URL" value={cancelUrl} onChange={setCancelUrl} placeholder={`${origin}/payment/cancel`} />
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setUserToken(''); setAssessmentId(''); }} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
                  Clear
                </button>
                <button type="submit" disabled={loading} className={`px-4 py-2 rounded-xl text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[#FF6B3E] hover:brightness-95'}`}>
                  {loading ? 'Redirecting…' : 'Start Checkout'}
                </button>
              </div>
              <Alert message={error} />
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
