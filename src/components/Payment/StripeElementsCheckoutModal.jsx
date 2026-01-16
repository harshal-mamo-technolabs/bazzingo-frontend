import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_CONNECTION_HOST_URL } from '../../utils/constant';

// Get user token from localStorage
const getUserToken = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const stored = JSON.parse(raw);
      return stored?.accessToken || stored?.user?.token || '';
    }
  } catch (e) {
    console.error('Error getting user token:', e);
  }
  return '';
};

// Get user data from localStorage
const getUserData = () => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const stored = JSON.parse(raw);
      return {
        name: stored?.user?.name || stored?.name || 'Customer',
        email: stored?.user?.email || stored?.email || 'customer@example.com',
      };
    }
  } catch (e) {
    console.error('Error getting user data:', e);
  }
  return { name: 'Customer', email: 'customer@example.com' };
};

// Will be set dynamically from /config endpoint
let stripePromise = null;

// Get Stripe instance
const getStripe = async () => {
  if (!stripePromise) {
    const response = await fetch(`${API_CONNECTION_HOST_URL}/stripe-elements/config`);
    const data = await response.json();
    stripePromise = loadStripe(data.data.publishableKey);
  }
  return stripePromise;
};

// Helper for authenticated API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getUserToken();
  
  const response = await fetch(`${API_CONNECTION_HOST_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  return response.json();
};

// ============================================
// CHECKOUT FORM COMPONENT
// ============================================
function CheckoutForm({ setupIntentId, subscriptionData, onSuccess, onError, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingStep, setProcessingStep] = useState('');

  // Hide all non-card payment methods aggressively
  useEffect(() => {
    const hideNonCardMethods = () => {
      // Hide Bancontact and other payment methods using multiple strategies
      const selectors = [
        'button[data-testid*="bancontact"]',
        'button[data-testid*="ideal"]',
        'button[data-testid*="sofort"]',
        'button[data-testid*="giropay"]',
        'button[data-testid*="eps"]',
        'button[data-testid*="p24"]',
        '[class*="bancontact"]',
        '[class*="ideal"]',
        '[class*="sofort"]',
        '[class*="giropay"]',
        '[class*="eps"]',
        '[class*="p24"]',
        '[id*="bancontact"]',
        '[id*="ideal"]',
        '[id*="sofort"]',
        '[id*="giropay"]',
        '[id*="eps"]',
        '[id*="p24"]',
      ];

      // Strategy 1: Hide by selectors
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el) {
              el.style.display = 'none !important';
              el.style.visibility = 'hidden !important';
              el.style.opacity = '0 !important';
              el.style.height = '0 !important';
              el.style.width = '0 !important';
              el.style.overflow = 'hidden !important';
              if (el.parentElement) {
                el.parentElement.style.display = 'none !important';
              }
            }
          });
        } catch (e) {
          // Ignore errors
        }
      });

      // Strategy 2: Hide buttons that contain "Bancontact" text
      try {
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(button => {
          const text = button.textContent?.toLowerCase() || '';
          const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
          if (
            (text.includes('bancontact') || ariaLabel.includes('bancontact')) &&
            !text.includes('card') && !ariaLabel.includes('card')
          ) {
            button.style.display = 'none !important';
            button.style.visibility = 'hidden !important';
            if (button.parentElement) {
              button.parentElement.style.display = 'none !important';
            }
          }
        });
      } catch (e) {
        // Ignore errors
      }

      // Strategy 3: Hide any tab or button that's not explicitly for cards
      try {
        const tabs = document.querySelectorAll('[role="tab"]');
        tabs.forEach(tab => {
          const label = (tab.getAttribute('aria-label') || tab.textContent || '').toLowerCase();
          if (!label.includes('card') && label.length > 0) {
            tab.style.display = 'none !important';
            tab.style.visibility = 'hidden !important';
          }
        });
      } catch (e) {
        // Ignore errors
      }
    };

    // Run immediately
    hideNonCardMethods();

    // Use MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      hideNonCardMethods();
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id', 'data-testid'],
    });

    // Also run on interval as backup
    const interval = setInterval(hideNonCardMethods, 50);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStep('Confirming card details...');

    try {
      // Step 1: Confirm the SetupIntent
      const userData = getUserData();
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?setupIntentId=${setupIntentId}&subscriptionType=${subscriptionData.withTrial ? 'trial' : 'monthly'}`,
          payment_method_data: {
            billing_details: {
              name: userData.name,
              email: userData.email,
              phone: '',
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
        setErrorMessage(error.message);
        onError?.(error);
        setIsProcessing(false);
        return;
      }

      // Step 2: SetupIntent succeeded - now activate the subscription
      if (setupIntent && setupIntent.status === 'succeeded') {
        setProcessingStep(subscriptionData.withTrial ? 'Starting your trial...' : 'Activating subscription...');

        const activateData = await apiCall('/stripe-elements/activate-subscription', {
          method: 'POST',
          body: JSON.stringify({
            setupIntentId: setupIntent.id,
            recurringPriceId: subscriptionData.recurringPriceId,
            withTrial: subscriptionData.withTrial,
            trialPriceId: subscriptionData.trialPriceId,
            trialDays: subscriptionData.trialDays,
          }),
        });

        // Check if we need 3DS for payment
        if (activateData.data?.clientSecret && activateData.status === 'requires_action') {
          setProcessingStep('Completing 3D Secure authentication...');

          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            activateData.data.clientSecret
          );

          if (confirmError) {
            setErrorMessage(confirmError.message);
            onError?.(confirmError);
            setIsProcessing(false);
            return;
          }

          if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
            setProcessingStep('Finalizing subscription...');
            await pollForSubscriptionActivation(activateData.data);
          }
        }
        else if (activateData.status === 'success' || activateData.data?.status === 'active' || activateData.data?.status === 'trialing') {
          onSuccess?.(activateData.data);
        }
        else {
          setErrorMessage(activateData.message || 'Failed to activate subscription. Please try again.');
          onError?.(new Error(activateData.message || 'Activation failed'));
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      onError?.(err);
    }

    setIsProcessing(false);
  };

  const pollForSubscriptionActivation = async (data) => {
    let attempts = 0;
    const maxAttempts = 10;

    const checkSubscription = async () => {
      try {
        const statusData = await apiCall(`/stripe-elements/subscription-status/${data.subscriptionId}`);

        if (statusData.data?.status === 'active' || statusData.data?.status === 'trialing') {
          onSuccess?.(statusData.data);
          return true;
        }

        if (attempts < maxAttempts) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return checkSubscription();
        }

        // After max attempts, still consider it success if we got here
        onSuccess?.({
          ...data,
          status: data.withTrial ? 'trialing' : 'active',
        });
        return true;
      } catch (err) {
        console.error('Status check error:', err);
        return false;
      }
    };

    const success = await checkSubscription();
    if (!success) {
      setErrorMessage('Payment processed but subscription activation is taking longer than expected.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
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

      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </p>
        </div>
      )}

      {isProcessing && processingStep && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <p className="text-orange-700 text-sm flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {processingStep}
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`flex-1 py-3 rounded-xl text-white font-semibold transition-all ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#FF6B3E] hover:brightness-95'
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : subscriptionData?.withTrial ? (
            'Start Trial'
          ) : (
            'Subscribe Now'
          )}
        </button>
      </div>
    </form>
  );
}

// ============================================
// MAIN MODAL COMPONENT
// ============================================
function StripeElementsCheckoutModal({ 
  isOpen, 
  onClose, 
  plan, 
  initialPlanType = 'monthly', // 'trial' or 'monthly' or 'yearly'
  onSuccess 
}) {
  const [stripeInstance, setStripeInstance] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [setupIntentId, setSetupIntentId] = useState('');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingSubscription, setCreatingSubscription] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState(initialPlanType);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && plan) {
      setSelectedPlanType(initialPlanType);
      setError('');
      setClientSecret('');
      initializeStripe();
    }
  }, [isOpen, plan, initialPlanType]);

  const initializeStripe = async () => {
    setLoading(true);
    try {
      const stripe = await getStripe();
      setStripeInstance(stripe);
    } catch (err) {
      setError('Failed to initialize payment system');
    } finally {
      setLoading(false);
    }
  };

  // Create subscription when plan type changes
  useEffect(() => {
    if (!stripeInstance || !plan || !isOpen) return;

    const createSubscription = async () => {
      setCreatingSubscription(true);
      setError('');
      
      try {
        const monthlyPriceId = plan.prices?.monthly?.priceId?.stripePriceId;
        const yearlyPriceId = plan.prices?.yearly?.priceId?.stripePriceId;
        const trialPriceId = plan.prices?.trial?.stripePriceId;

        const isWithTrial = selectedPlanType === 'trial';
        const recurringPriceId = selectedPlanType === 'yearly' ? yearlyPriceId : monthlyPriceId;

        if (!recurringPriceId) {
          throw new Error('Price not found for selected plan');
        }

        const data = await apiCall('/stripe-elements/create-subscription', {
          method: 'POST',
          body: JSON.stringify({
            withTrial: isWithTrial,
            recurringPriceId: recurringPriceId,
            ...(isWithTrial && trialPriceId && { trialPriceId }),
            trialDays: 3,
          }),
        });

        if (data.status === 'success') {
          setClientSecret(data.data.clientSecret);
          setSetupIntentId(data.data.setupIntentId);
          setSubscriptionData({
            ...data.data,
            withTrial: isWithTrial,
            recurringPriceId: recurringPriceId,
            trialPriceId: trialPriceId,
            planName: plan.name,
            monthlyAmount: plan.prices?.monthly?.priceId?.unitAmount,
            yearlyAmount: plan.prices?.yearly?.priceId?.unitAmount,
            trialAmount: plan.prices?.trial?.unitAmount,
            currency: plan.prices?.monthly?.priceId?.currency || 'EUR',
          });
        } else {
          setError(data.message || 'Failed to initialize payment');
        }
      } catch (err) {
        console.error('Create subscription error:', err);
        setError(err.message || 'Failed to create subscription');
      } finally {
        setCreatingSubscription(false);
      }
    };

    createSubscription();
  }, [stripeInstance, plan, selectedPlanType, isOpen]);

  const handleSuccess = (data) => {
    // Navigate to success page
    const params = new URLSearchParams({
      subscription_id: data.subscriptionId || '',
      status: data.status || 'active',
      type: selectedPlanType,
      plan_name: plan?.name || '',
    }).toString();
    
    window.location.href = `/payment/success?${params}`;
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
  };

  if (!isOpen) return null;

  const trialAmount = plan?.prices?.trial?.unitAmount;
  const monthlyAmount = plan?.prices?.monthly?.priceId?.unitAmount;
  const yearlyAmount = plan?.prices?.yearly?.priceId?.unitAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="relative p-6">
          {/* Header */}
          {/* <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {plan?.name || 'Subscribe'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {plan?.description || 'Complete your subscription'}
            </p>
          </div> */}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#FF6B3E] rounded-full animate-spin" />
              <p className="mt-4 text-gray-500 text-sm">Loading payment form...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  initializeStripe();
                }}
                className="px-4 py-2 bg-[#FF6B3E] text-white rounded-lg font-semibold hover:brightness-95"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Payment Form */}
          {!loading && !error && plan && (
            <>
              {/* Pricing Summary */}
              {/* <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {selectedPlanType === 'trial' ? '3-Day Trial' : selectedPlanType === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                    </p>
                    {selectedPlanType === 'trial' && (
                      <p className="text-gray-500 text-xs mt-1">Then €{monthlyAmount?.toFixed(2)}/month</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      €{selectedPlanType === 'trial' ? trialAmount?.toFixed(2) : selectedPlanType === 'yearly' ? yearlyAmount?.toFixed(2) : monthlyAmount?.toFixed(2)}
                    </p>
                    {selectedPlanType !== 'trial' && (
                      <p className="text-gray-500 text-xs">/{selectedPlanType === 'yearly' ? 'year' : 'month'}</p>
                    )}
                  </div>
                </div>
              </div> */}

              {/* Loading indicator when preparing payment */}
              {creatingSubscription && (
                <div className="mb-4 flex items-center justify-center gap-2 text-gray-500 py-4">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Preparing payment...</span>
                </div>
              )}

              {/* Stripe Elements */}
              {clientSecret && stripeInstance && !creatingSubscription && (
                <>
                  <Elements
                    stripe={stripeInstance}
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
                    <CheckoutForm
                      setupIntentId={setupIntentId}
                      subscriptionData={subscriptionData}
                      onSuccess={handleSuccess}
                      onError={handleError}
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
                    div[data-testid*="bancontact"],
                    div[data-testid*="ideal"],
                    div[data-testid*="sofort"],
                    div[data-testid*="giropay"],
                    div[data-testid*="eps"],
                    div[data-testid*="p24"],
                    [class*="bancontact"],
                    [class*="ideal"],
                    [class*="sofort"],
                    [class*="giropay"],
                    [class*="eps"],
                    [class*="p24"] {
                      display: none !important;
                    }
                  `}</style>
                </>
              )}

              {/* Security badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secured by Stripe</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StripeElementsCheckoutModal;

