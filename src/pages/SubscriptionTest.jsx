import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import { API_CONNECTION_HOST_URL } from '../utils/constant';

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

function LabeledSelect({ id, label, value, onChange, options = [], required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubscriptionCheckoutOnlyForm({ origin }) {
  const [userToken, setUserToken] = useState('');
  const [planId, setPlanId] = useState('');
  const [type, setType] = useState('monthly'); // 'trial' | 'monthly' | 'yearly'
  const [successUrl, setSuccessUrl] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState('');

  const validTypes = ['trial', 'monthly', 'yearly'];

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

  const authHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${userToken.trim()}`,
  });

  // ---------- helpers: persistence + healthy-status guard ----------
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
  // ----------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setHint('');

    const token = userToken.trim();
    const plan = planId.trim();
    const subType = type.trim();
    const suc = successUrl.trim();
    const can = cancelUrl.trim();

    console.log('[FE] submit /stripe/subscription', {
      tokenMasked: token ? token.slice(0, 6) + '…' : '(empty)',
      planId: plan,
      type: subType,
      successUrl: suc,
      cancelUrl: can
    });

    if (!token || !plan) return setError('Please provide both User Token and Plan ID.');
    if (!validTypes.includes(subType)) return setError(`Type must be one of: ${validTypes.join(', ')}`);
    if (!validateSameOrigin(suc) || !validateSameOrigin(can)) return setError('Success and Cancel URLs must start with this site origin.');

    setLoading(true);
    setHint('Processing subscription...');

    try {
      const body = { planId: plan, type: subType, successUrl: suc, cancelUrl: can };
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
          plan_id: data.plan?.id || plan,
        }).toString();

        persistAndLog({ payload, reason: 'redirect_success' });
        console.log('[FE] ✅ Redirecting to success:', `${suc}?${qp}`);
        window.location.href = `${suc}?${qp}`;
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
          suc,
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
      setLoading(false);
      setHint('');
    }
  };

  // Enhanced 3D Secure authentication handler
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

  const submitCta =
    type === 'trial'
      ? 'Start paid trial (Checkout)'
      : `Start ${type} subscription (Checkout)`;

  const typeHelp =
    type === 'trial'
      ? 'Will create a subscription with the plan\'s trial one-time fee and pair it with the plan\'s recurring price (monthly preferred, then yearly).'
      : `Will create a ${type} subscription for the selected plan.`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6">
      <LabeledInput
        id="userToken"
        label="User Token"
        required
        value={userToken}
        onChange={setUserToken}
        placeholder="JWT or session token"
      />
      <LabeledInput
        id="planId"
        label="Plan ID"
        required
        value={planId}
        onChange={setPlanId}
        placeholder="e.g. 66e6c1f8a1b2c3d4e5f67890 (Plan _id)"
      />

      <LabeledSelect
        id="type"
        label="Subscription Type"
        required
        value={type}
        onChange={setType}
        options={[
          { value: 'trial', label: 'Trial (paid trial + recurring)' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
      <Hint text={typeHelp} />

      <LabeledInput
        id="successUrl"
        label="Success URL"
        value={successUrl}
        onChange={setSuccessUrl}
        placeholder={`${origin}/payment/success`}
      />
      <LabeledInput
        id="cancelUrl"
        label="Cancel URL"
        value={cancelUrl}
        onChange={setCancelUrl}
        placeholder={`${origin}/payment/cancel`}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => { setPlanId(''); setType('monthly'); setError(''); setHint(''); }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-xl text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-[#FF6B3E] hover:brightness-95'}`}
        >
          {loading ? 'Processing…' : submitCta}
        </button>
      </div>

      <Alert message={error} />
      <Hint text={hint} />
    </form>
  );
}

export default function SubscriptionCheckoutOnlyPage() {
  const origin = useMemo(() => (typeof window !== 'undefined' ? window.location.origin : ''), []);
  return (
    <MainLayout>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12">
          <div className="max-w-[640px] mx-auto pt-8 pb-16">
            <div className="mb-6 text-center">
              <h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 900 }}>
                Subscription via Stripe Checkout (Plan-based)
              </h1>
              <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>
                Creates a subscription using a selected plan and type (trial, monthly, yearly).
                Supports one-click payments for returning customers with 3D Secure authentication.
              </p>
            </div>
            <SubscriptionCheckoutOnlyForm origin={origin} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}