import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_CONNECTION_HOST_URL } from '../utils/constant';

// API URL
const API_URL = API_CONNECTION_HOST_URL;

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
    const response = await fetch(`${API_URL}/stripe-elements/config`);
    const data = await response.json();
    stripePromise = loadStripe(data.data.publishableKey);
  }
  return stripePromise;
};

// Helper for authenticated API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getUserToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
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
function CheckoutForm({ setupIntentId, subscriptionData, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingStep, setProcessingStep] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStep('Confirming card details...');

    try {
      // Step 1: Confirm the SetupIntent (collects card + handles 3DS for card setup)
      const userData = getUserData();
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/stripe-payment-success?setupIntentId=${setupIntentId}&recurringPriceId=${subscriptionData.recurringPriceId}&withTrial=${subscriptionData.withTrial}`,
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
        setProcessingStep(subscriptionData.withTrial ? 'Processing trial payment...' : 'Activating subscription...');

        const activateData = await apiCall('/stripe-elements/activate-subscription', {
          method: 'POST',
          body: JSON.stringify({
            setupIntentId: setupIntent.id,
            // These are optional - backend will use metadata from SetupIntent
            // but passing them ensures consistency
            recurringPriceId: subscriptionData.recurringPriceId,
            withTrial: subscriptionData.withTrial,
            trialPriceId: subscriptionData.trialPriceId,
            trialDays: subscriptionData.trialDays,
          }),
        });


        // Check if we have a clientSecret that needs confirmation (3DS for payment)
        if (activateData.data?.clientSecret && activateData.status === 'requires_action') {
          setProcessingStep('Completing 3D Secure authentication...');

          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            activateData.data.clientSecret
          );

          if (confirmError) {
            console.error('Payment confirmation error:', confirmError);
            setErrorMessage(confirmError.message);
            onError?.(confirmError);
            setIsProcessing(false);
            return;
          }


          // Payment succeeded - poll for subscription to become active/trialing
          if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
            setProcessingStep('Finalizing subscription...');
            await pollForSubscriptionActivation(activateData.data, paymentIntent);
          }
        }
        // Success without additional action needed (subscription already active or trialing)
        else if (activateData.status === 'success' || activateData.data?.status === 'active' || activateData.data?.status === 'trialing') {
          onSuccess?.(activateData.data);
        }
        // Error case
        else {
          console.error('Activation failed:', activateData);
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

  // Poll for subscription status to become active or trialing
  const pollForSubscriptionActivation = async (data, paymentIntent) => {
    let attempts = 0;
    const maxAttempts = 10;

    const checkSubscription = async () => {
      try {
        const statusData = await apiCall(`/stripe-elements/subscription-status/${data.subscriptionId}`);


        // Check for active or trialing status
        if (statusData.data?.status === 'active' || statusData.data?.status === 'trialing') {
          onSuccess?.(statusData.data);
          return true;
        }

        if (attempts < maxAttempts) {
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return checkSubscription();
        }

        // After max attempts, still return success if payment went through
        if (paymentIntent.status === 'succeeded') {
          onSuccess?.({
            ...data,
            status: data.withTrial ? 'trialing' : 'active',
            message: 'Payment successful, subscription activating...',
          });
          return true;
        }

        return false;
      } catch (err) {
        console.error('Status check error:', err);
        return false;
      }
    };

    const success = await checkSubscription();
    if (!success) {
      setErrorMessage(
        'Payment processed but subscription activation is taking longer than expected. Please check your dashboard.'
      );
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
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        </div>
      )}

      {isProcessing && processingStep && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-purple-600 text-sm flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {processingStep}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`
          mt-6 w-full py-3.5 px-6 rounded-xl font-semibold text-base
          transition-all duration-200 ease-out
          ${
            isProcessing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]'
          }
        `}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : subscriptionData?.withTrial ? (
          `Start ${subscriptionData.trialDays}-Day Trial`
        ) : (
          'Subscribe Now'
        )}
      </button>
    </form>
  );
}

// ============================================
// MAIN SUBSCRIPTION PAGE COMPONENT
// ============================================
/**
 * StripeElementsSubscription Component
 * 
 * Props:
 * @param {boolean} withTrial - Enable paid trial flow (default: true)
 * @param {string} recurringPriceId - Stripe recurring price ID (optional if set in env)
 * @param {string} trialPriceId - Stripe one-time trial price ID (optional if set in env)
 * @param {number} trialDays - Trial period in days (default: 3)
 * @param {function} onSuccess - Callback when subscription is successful
 * @param {function} onError - Callback when an error occurs
 * @param {string} successRedirectUrl - URL to redirect after success (default: /dashboard)
 */
function StripeElementsSubscription({ 
  withTrial = true,
  recurringPriceId,
  trialPriceId,
  trialDays,
  onSuccess: onSuccessCallback,
  onError: onErrorCallback,
  successRedirectUrl = '/dashboard'
}) {
  const [stripeInstance, setStripeInstance] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [setupIntentId, setSetupIntentId] = useState('');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingSubscription, setCreatingSubscription] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState(withTrial ? 'trial' : 'monthly');

  // Fetch plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Get Stripe instance
        const stripe = await getStripe();
        setStripeInstance(stripe);

        // Fetch plans to get the correct price IDs
        const plansResponse = await apiCall('/plans', { method: 'GET' });
        
        if (plansResponse.status !== 'success' || !plansResponse.data?.plans?.length) {
          throw new Error('Failed to fetch subscription plans');
        }

        const plan = plansResponse.data.plans[0];
        setPlanData(plan);


      } catch (err) {
        console.error('Fetch plans error:', err);
        setError(err.message || 'Failed to fetch subscription plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Create subscription when plan type changes or planData is loaded
  useEffect(() => {
    if (!planData || !stripeInstance) return;

    const createSubscription = async () => {
      setCreatingSubscription(true);
      setError('');
      
      try {
        const monthlyPriceId = planData.prices?.monthly?.priceId?.stripePriceId;
        const trialPriceIdFromPlan = planData.prices?.trial?.stripePriceId;

        if (!monthlyPriceId) {
          throw new Error('Monthly price not found in plan');
        }

        const isWithTrial = selectedPlanType === 'trial';

        const data = await apiCall('/stripe-elements/create-subscription', {
          method: 'POST',
          body: JSON.stringify({
            withTrial: isWithTrial,
            recurringPriceId: recurringPriceId || monthlyPriceId,
            ...(isWithTrial && { trialPriceId: trialPriceId || trialPriceIdFromPlan }),
            ...(trialDays && { trialDays }),
          }),
        });

        if (data.status === 'success') {
          setClientSecret(data.data.clientSecret);
          setSetupIntentId(data.data.setupIntentId);
          setSubscriptionData({
            ...data.data,
            withTrial: isWithTrial,
            planName: planData.name,
            monthlyAmount: planData.prices?.monthly?.priceId?.unitAmount,
            trialAmount: planData.prices?.trial?.unitAmount,
            currency: planData.prices?.monthly?.priceId?.currency || 'EUR',
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
  }, [planData, stripeInstance, selectedPlanType, recurringPriceId, trialPriceId, trialDays]);

  const handlePlanTypeChange = (type) => {
    if (type !== selectedPlanType) {
      setSelectedPlanType(type);
      setClientSecret(''); // Reset to trigger new subscription creation
    }
  };

  const handleSuccess = (subscription) => {
    setSuccess(true);
    setSubscriptionData(subscription);
    onSuccessCallback?.(subscription);
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    onErrorCallback?.(error);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-purple-200 font-medium text-lg">Loading payment form...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (success) {
    const isTrialing = subscriptionData?.status === 'trialing';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {isTrialing ? 'Trial Started! 🎉' : 'Subscription Active! 🎉'}
          </h2>
          <p className="text-emerald-300 mb-8">
            {isTrialing 
              ? `Your ${subscriptionData.trialDays || 3}-day trial has started. Enjoy full access!`
              : 'Your subscription has been created successfully.'
            }
          </p>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-emerald-200/70 text-sm">Subscription ID</span>
              <span className="text-white font-mono text-sm">
                {subscriptionData?.subscriptionId?.slice(0, 20)}...
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-200/70 text-sm">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                {subscriptionData?.status}
              </span>
            </div>
            {isTrialing && subscriptionData?.trialEnd && (
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70 text-sm">Trial Ends</span>
                <span className="text-white text-sm">
                  {new Date(subscriptionData.trialEnd).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {subscriptionData?.currentPeriodEnd && !isTrialing && (
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70 text-sm">Next Billing</span>
                <span className="text-white text-sm">
                  {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => (window.location.href = successRedirectUrl)}
            className="mt-8 w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Payment Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {planData?.name || 'Choose Your Plan'}
            </h2>
            <p className="text-purple-300/70 text-sm">Select your preferred subscription option</p>
          </div>

          {/* Plan Type Selector */}
          {planData && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              {/* Trial Option */}
              <button
                type="button"
                onClick={() => handlePlanTypeChange('trial')}
                disabled={creatingSubscription}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedPlanType === 'trial'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                } ${creatingSubscription ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {selectedPlanType === 'trial' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-medium text-sm">Start with Trial</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {planData.prices?.trial?.unitAmount?.toFixed(2) || '1.99'}{' '}
                  <span className="text-sm font-normal text-purple-300">
                    {planData.prices?.trial?.currency || 'EUR'}
                  </span>
                </div>
                <p className="text-purple-300/60 text-xs mt-1">
                  for 3 days, then {planData.prices?.monthly?.priceId?.unitAmount?.toFixed(2) || '35.00'}/mo
                </p>
              </button>

              {/* Monthly Option */}
              <button
                type="button"
                onClick={() => handlePlanTypeChange('monthly')}
                disabled={creatingSubscription}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedPlanType === 'monthly'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                } ${creatingSubscription ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {selectedPlanType === 'monthly' && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white font-medium text-sm">Monthly</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {planData.prices?.monthly?.priceId?.unitAmount?.toFixed(2) || '35.00'}{' '}
                  <span className="text-sm font-normal text-purple-300">
                    {planData.prices?.monthly?.priceId?.currency || 'EUR'}
                  </span>
                </div>
                <p className="text-purple-300/60 text-xs mt-1">
                  billed monthly
                </p>
              </button>
            </div>
          )}

          {/* Loading indicator when switching plans */}
          {creatingSubscription && (
            <div className="mb-6 flex items-center justify-center gap-2 text-purple-300">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Preparing payment...</span>
            </div>
          )}

          {/* Stripe Elements */}
          {clientSecret && stripeInstance && (
            <Elements
              stripe={stripeInstance}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#8b5cf6',
                    colorBackground: '#1e1b4b',
                    colorText: '#e2e8f0',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '12px',
                    colorTextPlaceholder: '#94a3b8',
                  },
                  rules: {
                    '.Input': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    '.Input:focus': {
                      border: '1px solid #8b5cf6',
                      boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.2)',
                    },
                    '.Label': {
                      color: '#c4b5fd',
                    },
                    '.Tab': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    '.Tab--selected': {
                      backgroundColor: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid #8b5cf6',
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
              />
            </Elements>
          )}

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-purple-300/60 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Secured by Stripe</span>
          </div>
        </div>

        {/* Test cards info */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5">
          <p className="text-purple-200/80 text-xs text-center mb-2 font-medium">Test Cards</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-purple-300/60">
              <span className="font-mono text-purple-200">4242 4242 4242 4242</span>
              <span className="block text-purple-300/40">Success</span>
            </div>
            <div className="text-purple-300/60">
              <span className="font-mono text-purple-200">4000 0025 0000 3155</span>
              <span className="block text-purple-300/40">3DS Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StripeElementsSubscription;

// ============================================
// USAGE EXAMPLE
// ============================================
/*
// Basic usage with trial (uses backend env defaults for prices)
<StripeElementsSubscription />

// Direct subscription without trial
<StripeElementsSubscription withTrial={false} />

// Custom configuration
<StripeElementsSubscription 
  withTrial={true}
  recurringPriceId="price_xxx"  // Your monthly plan price ID
  trialPriceId="price_yyy"      // Your one-time trial price ID
  trialDays={7}                 // Custom trial period
  successRedirectUrl="/welcome"
/>

// IMPORTANT: Make sure getAuthToken() returns your JWT token
// Update the function at the top of this file to match your auth implementation
*/
