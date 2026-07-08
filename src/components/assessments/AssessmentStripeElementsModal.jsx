import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { API_CONNECTION_HOST_URL } from '../../utils/constant';
import { isStripePaymentEnabled } from '../../config/accessControl';

/* ----------------------------------
   Helpers
----------------------------------- */

const getUserToken = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.accessToken || parsed?.user?.token || '';
  } catch {
    return '';
  }
};

const getUserData = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return { name: '', email: '', phone: '' };
    const parsed = JSON.parse(raw);
    const user = parsed?.user || parsed || {};
    return {
      name: user.name || user.fullName || '',
      email: user.email || '',
      phone: user.phone || user.mobile || '',
    };
  } catch {
    return { name: '', email: '', phone: '' };
  }
};

const apiCall = async (endpoint, options = {}) => {
  const token = getUserToken();

  const res = await fetch(`${API_CONNECTION_HOST_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  return res.json();
};

/* ----------------------------------
   Stripe Loader
----------------------------------- */

let stripePromise = null;

const getStripe = async () => {
  if (!stripePromise) {
    const res = await fetch(
      `${API_CONNECTION_HOST_URL}/stripe-elements/config`
    );
    const data = await res.json();
    stripePromise = loadStripe(data.data.publishableKey);
  }
  return stripePromise;
};

/* ----------------------------------
   Payment Form
----------------------------------- */

function PaymentForm({
  orderId,
  amount,
  currency,
  onSuccess,
  onClose,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      const userData = getUserData();
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete?orderId=${orderId}`,
          payment_method_data: {
            billing_details: {
              name: userData.name || 'Customer',
              email: userData.email || '',
              phone: userData.phone || '',
              address: {
                line1: '',
                line2: '',
                city: '',
                state: '',
                postal_code: '',
                country: 'US',
              },
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        setError(error.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess({
          orderId,
          paymentIntentId: paymentIntent.id,
          status: 'succeeded',
        });
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Hide non-card payment methods
  useEffect(() => {
    const hideNonCardMethods = () => {
      try {
        // Hide all tabs/buttons that are not card-related
        const allButtons = document.querySelectorAll('button, [role="tab"], [role="button"]');
        allButtons.forEach(button => {
          const text = (button.textContent || '').toLowerCase();
          const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
          const id = (button.getAttribute('id') || '').toLowerCase();
          const className = (button.getAttribute('class') || '').toLowerCase();
          
          const isCard = text.includes('card') || ariaLabel.includes('card') || 
                        id.includes('card') || className.includes('card');
          
          const isNonCardPayment = 
            text.includes('bancontact') || ariaLabel.includes('bancontact') ||
            text.includes('ideal') || ariaLabel.includes('ideal') ||
            text.includes('sofort') || ariaLabel.includes('sofort') ||
            text.includes('giropay') || ariaLabel.includes('giropay') ||
            text.includes('eps') || ariaLabel.includes('eps') ||
            text.includes('p24') || ariaLabel.includes('p24');
          
          if (isNonCardPayment || (!isCard && (button.getAttribute('role') === 'tab' || button.closest('[role="tablist"]')))) {
            button.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; overflow: hidden !important; position: absolute !important;';
          }
        });
      } catch (e) {
        // Ignore errors
      }
    };

    hideNonCardMethods();
    const observer = new MutationObserver(() => {
      hideNonCardMethods();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'data-testid', 'role', 'aria-label'],
    });

    const interval = setInterval(hideNonCardMethods, 25);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card'],
          fields: {
            billingDetails: 'never',
          },
          wallets: {
            applePay: 'never',
            googlePay: 'never',
            link: 'never',
          },
        }}
      />

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-3 rounded-xl border"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 py-3 rounded-xl bg-[#FF6B3E] text-white font-semibold"
        >
          {loading
            ? 'Processing...'
            : `Pay ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`}
        </button>
      </div>
    </form>
  );
}

/* ----------------------------------
   Main Modal
----------------------------------- */

function AssessmentStripeElementsModal({
  isOpen,
  onClose,
  assessment,
}) {
  const [stripe, setStripe] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('eur');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('Preparing secure payment…');
  const [error, setError] = useState('');

  const handleSuccess = ({ orderId: paidOrderId }) => {
    const assessmentId = assessment._id || assessment.id;
    localStorage.setItem('autoStartAssessmentId', assessmentId);
    if (assessment?.mainCategory) {
      localStorage.setItem('autoStartAssessmentMainCategory', assessment.mainCategory);
    }

    window.location.href = `/payment/success?order_id=${paidOrderId}&status=succeeded`;
  };

  useEffect(() => {
    if (!isOpen || !assessment) return;

    // Guard against setting state after the modal closes / assessment changes.
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError('');
      setClientSecret('');
      setStatusMsg('Preparing secure payment…');

      try {
        const stripeInstance = await getStripe();
        if (cancelled) return;
        setStripe(stripeInstance);

        // One-click first: this charges the user's saved card instantly when
        // there is one, and only asks for card details when there isn't.
        const res = await apiCall('/stripe-elements/pay', {
          method: 'POST',
          body: JSON.stringify({
            assessmentId: assessment._id || assessment.id,
          }),
        });
        if (cancelled) return;

        if (res.status !== 'success' && res.status !== 'requires_action') {
          throw new Error(res.message || 'Payment init failed');
        }

        const data = res.data || {};
        if (data.orderId) setOrderId(data.orderId);
        if (data.amount != null) setAmount(data.amount);
        if (data.currency) setCurrency(data.currency);

        switch (data.outcome) {
          case 'paid':
            // Saved card was charged — nothing to enter, go straight to success.
            setStatusMsg('Payment successful! Redirecting…');
            handleSuccess({ orderId: data.orderId });
            return;

          case 'requires_action': {
            // Saved card needs 3-D Secure. An off-session charge that fails with
            // `authentication_required` leaves the PaymentIntent in
            // `requires_payment_method` (NOT `requires_action`), so handleNextAction
            // would reject. confirmCardPayment re-confirms the saved card on-session
            // and runs the 3DS challenge — it works from either state.
            setStatusMsg('Confirming your card…');
            const confirmOptions = data.paymentMethodId
              ? { payment_method: data.paymentMethodId }
              : undefined;
            const { error: actionError, paymentIntent } =
              await stripeInstance.confirmCardPayment(data.clientSecret, confirmOptions);
            if (cancelled) return;

            if (actionError) {
              setError(actionError.message || 'Card authentication failed. Please try another card.');
              setLoading(false);
              return;
            }

            // Sync order status server-side (the webhook does this too).
            await apiCall('/stripe-elements/confirm-payment', {
              method: 'POST',
              body: JSON.stringify({ orderId: data.orderId }),
            });
            if (cancelled) return;

            if (paymentIntent?.status === 'succeeded') {
              setStatusMsg('Payment successful! Redirecting…');
              handleSuccess({ orderId: data.orderId });
            } else {
              setError('Payment could not be completed. Please try again.');
              setLoading(false);
            }
            return;
          }

          case 'collect_payment_method':
          default:
            // No saved card (or it was declined) — show the card form once.
            // The card gets saved so the next payment is true one-click.
            setClientSecret(data.clientSecret);
            setLoading(false);
            return;
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load payment');
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isOpen, assessment]);

  if (!isStripePaymentEnabled() || !isOpen || !assessment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >


        {loading && !error && (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-[#FF6B3E] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-600">{statusMsg}</p>
          </div>
        )}

        {error && (
          <>
            <p className="mt-8 text-center text-red-600">
              {error}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl border font-semibold"
            >
              Close
            </button>
          </>
        )}

        {!loading && !error && stripe && clientSecret && (
          <>
            

            <Elements 
              stripe={stripe} 
              options={{ 
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#FF6B3E',
                    colorBackground: '#ffffff',
                    colorText: '#1f2937',
                    colorDanger: '#dc2626',
                    fontFamily: 'Roboto, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '12px',
                  },
                  rules: {
                    '.Input': {
                      border: '1px solid #e5e7eb',
                      boxShadow: 'none',
                    },
                    '.Input:focus': {
                      border: '1px solid #FF6B3E',
                      boxShadow: '0 0 0 3px rgba(255, 107, 62, 0.1)',
                    },
                    '.Label': {
                      color: '#374151',
                      fontWeight: '500',
                    },
                  },
                },
              }}
            >
              <PaymentForm
                orderId={orderId}
                amount={amount}
                currency={currency}
                onSuccess={handleSuccess}
                onClose={onClose}
              />
            </Elements>
            
            {/* CSS to hide non-card payment methods */}
            <style>{`
              button[data-testid*="bancontact"],
              button[data-testid*="ideal"],
              button[data-testid*="sofort"],
              button[data-testid*="giropay"],
              button[data-testid*="eps"],
              button[data-testid*="p24"],
              [class*="bancontact"],
              [class*="ideal"],
              [class*="sofort"],
              [class*="giropay"],
              [class*="eps"],
              [class*="p24"],
              [id*="bancontact"],
              [id*="ideal"],
              [role="tab"]:not([aria-label*="card"]):not([aria-label*="Card"]):not([aria-label*="CARD"]),
              [role="tablist"] > [role="tab"]:not([aria-label*="card"]):not([aria-label*="Card"]) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                pointer-events: none !important;
              }
            `}</style>

            <p className="mt-4 text-xs text-center text-gray-400">
              🔒 Secured by Stripe
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AssessmentStripeElementsModal;
