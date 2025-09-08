import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

function useAllQueryParams() {
  // memoize the snapshot of the current search string
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  return useMemo(() => {
    const entries = Object.fromEntries(params.entries());
    return entries; // { session_id, subscription_id, status, type, plan_id, ... }
  }, [params]);
}

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warn: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <span className={`inline-block rounded-md px-2 py-1 text-xs border ${tones[tone] || tones.neutral}`}>
      {children}
    </span>
  );
}

export default function PaymentSuccess() {
  const qp = useAllQueryParams();
  const sessionId = qp.session_id || '';
  const subscriptionId = qp.subscription_id || '';
  const status = (qp.status || '').toLowerCase(); // e.g. active, succeeded, incomplete
  const [persisted, setPersisted] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // Pull any payload we saved before redirect
    const raw = sessionStorage.getItem('lastSubscriptionResponse');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setPersisted(parsed);
        console.log('[Success] Query params:', qp);
        console.log('[Success] Persisted API payload:', parsed);
      } catch (e) {
        console.warn('[Success] Failed to parse persisted payload:', e);
      }
    } else {
      console.log('[Success] No persisted API payload. Query params:', qp);
    }

    // Friendly hint for incomplete statuses
    const unhealthy = ['incomplete', 'past_due', 'unpaid', 'incomplete_expired'];
    if (status && unhealthy.includes(status)) {
      setNotice(
        `Your subscription status is "${status}". You may need to complete authentication or update payment method.`
      );
    }
  }, [status, qp]);

  // Optional: quick helpers for status tone & label
  const statusTone = (() => {
    if (!status) return 'neutral';
    if (['active', 'trialing', 'succeeded', 'processing'].includes(status)) return 'success';
    if (['incomplete', 'past_due', 'unpaid', 'incomplete_expired'].includes(status)) return 'warn';
    return 'neutral';
  })();

  const title = subscriptionId ? 'Subscription result' : 'Payment successful';
  const subtitle = subscriptionId
    ? 'We received your subscription redirect.'
    : 'Your checkout completed successfully.';

  return (
    <MainLayout>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="mx-auto px-4 lg:px-12">
          <div className="max-w-[720px] mx-auto pt-10 pb-16">
            <div className="text-center mb-6">
              <img src="/task-complete-icon.svg" alt="Success" className="w-12 h-12 mx-auto mb-4" />
              <h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 900 }}>{title}</h1>
              <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>{subtitle}</p>
              {status ? (
                <div className="mt-2">
                  <Badge tone={statusTone}>status: {status}</Badge>
                </div>
              ) : null}
              {notice && (
                <div className="mt-3">
                  <Badge tone="warn">{notice}</Badge>
                </div>
              )}
            </div>

            {/* Query params */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <h2 className="text-sm font-semibold mb-2 text-gray-800">Query parameters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-gray-700">
                <div><span className="font-semibold">session_id:</span> <span className="font-mono break-all">{sessionId || '—'}</span></div>
                <div><span className="font-semibold">subscription_id:</span> <span className="font-mono break-all">{subscriptionId || '—'}</span></div>
                <div><span className="font-semibold">type:</span> <span className="font-mono break-all">{qp.type || '—'}</span></div>
                <div><span className="font-semibold">plan_id:</span> <span className="font-mono break-all">{qp.plan_id || '—'}</span></div>
                <div className="sm:col-span-2"><span className="font-semibold">full query:</span>
                  <pre className="mt-1 bg-white border border-gray-200 rounded-lg p-2 overflow-auto">{window.location.search || '—'}</pre>
                </div>
              </div>
            </div>

            {/* Persisted payload (what we saved before redirect) */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold mb-2 text-gray-800">Persisted API payload</h2>
              <pre className="text-[12px] whitespace-pre-wrap">
                {persisted ? JSON.stringify(persisted, null, 2) : '— none —'}
              </pre>
            </div>

            {/* Optional: verification section for Checkout session_id (keep commented until you wire your endpoint) */}
            {false && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h2 className="text-sm font-semibold mb-2 text-gray-800">Verification</h2>
                <p className="text-xs text-gray-600">Add a verification call here if needed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
