import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
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

function StripePaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Check authentication first
        const token = getAuthToken();
        if (!token) {
          setError('Please log in to verify your payment.');
          setStatus('auth_required');
          return;
        }

        // Get params from URL
        const setupIntentId = searchParams.get('setupIntentId');
        const recurringPriceId = searchParams.get('recurringPriceId');
        const withTrialParam = searchParams.get('withTrial');
        const setupIntentClientSecret = searchParams.get('setup_intent_client_secret');
        const subscriptionId = searchParams.get('subscriptionId');

        // Parse withTrial parameter
        const withTrial = withTrialParam === 'true';

        // Get Stripe instance (config endpoint is public)
        const configResponse = await fetch(`${API_URL}/stripe-elements/config`);
        const configData = await configResponse.json();
        const stripe = await loadStripe(configData.data.publishableKey);

        // CASE 1: Redirected after SetupIntent confirmation (3DS flow)
        if (setupIntentClientSecret) {

          const { setupIntent } = await stripe.retrieveSetupIntent(setupIntentClientSecret);

          if (setupIntent.status === 'succeeded') {
            // SetupIntent succeeded, now activate the subscription

            const activateData = await apiCall('/stripe-elements/activate-subscription', {
              method: 'POST',
              body: JSON.stringify({
                setupIntentId: setupIntent.id,
                recurringPriceId: recurringPriceId,
                withTrial: withTrial,
              }),
            });


            // Check if payment requires 3DS confirmation
            if (activateData.data?.requiresAction && activateData.data?.clientSecret) {
              const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                activateData.data.clientSecret
              );

              if (confirmError) {
                setError(confirmError.message);
                setStatus('failed');
                return;
              }


              // Poll for subscription status
              if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
                await pollSubscriptionStatus(activateData.data.subscriptionId, stripe);
                return;
              }
            }

            // Check for success statuses (active or trialing)
            if (
              activateData.status === 'success' ||
              activateData.data?.status === 'active' ||
              activateData.data?.status === 'trialing'
            ) {
              setSubscription(activateData.data);
              setStatus('success');
              return;
            }

            // Handle other statuses
            if (activateData.status === 'error') {
              setError(activateData.message || 'Failed to activate subscription');
              setStatus('failed');
              return;
            }

            // Pending or unknown - poll for status
            if (activateData.data?.subscriptionId) {
              await pollSubscriptionStatus(activateData.data.subscriptionId, stripe);
              return;
            }

            setError(activateData.message || 'Failed to activate subscription');
            setStatus('failed');
            return;
          } else if (setupIntent.status === 'requires_payment_method') {
            setError('Card setup failed. Please try again with a different card.');
            setStatus('failed');
            return;
          } else if (setupIntent.status === 'requires_action') {
            setError('Additional authentication required.');
            setStatus('requires_action');
            return;
          } else {
            setError(`Unexpected status: ${setupIntent.status}`);
            setStatus('failed');
            return;
          }
        }

        // CASE 2: Direct subscription ID check (for already activated subscriptions)
        if (subscriptionId) {
          await pollSubscriptionStatus(subscriptionId, stripe);
          return;
        }

        // CASE 3: SetupIntent ID without client secret (manual verification)
        if (setupIntentId) {

          const activateData = await apiCall('/stripe-elements/activate-subscription', {
            method: 'POST',
            body: JSON.stringify({
              setupIntentId: setupIntentId,
              recurringPriceId: recurringPriceId,
              withTrial: withTrial,
            }),
          });


          // Check if payment requires 3DS confirmation
          if (activateData.data?.requiresAction && activateData.data?.clientSecret) {
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
              activateData.data.clientSecret
            );

            if (confirmError) {
              setError(confirmError.message);
              setStatus('failed');
              return;
            }


            // Poll for subscription status
            if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
              await pollSubscriptionStatus(activateData.data.subscriptionId, stripe);
              return;
            }
          }

          // Check for success statuses
          if (
            activateData.status === 'success' ||
            activateData.data?.status === 'active' ||
            activateData.data?.status === 'trialing'
          ) {
            setSubscription(activateData.data);
            setStatus('success');
            return;
          }

          // Handle other statuses
          if (activateData.status === 'error') {
            setError(activateData.message || 'Failed to activate subscription');
            setStatus('failed');
            return;
          }

          // Pending or unknown - poll for status
          if (activateData.data?.subscriptionId) {
            await pollSubscriptionStatus(activateData.data.subscriptionId, stripe);
            return;
          }

          setError(activateData.message || 'Failed to activate subscription');
          setStatus('failed');
          return;
        }

        // No valid parameters found
        setError('Invalid payment verification request');
        setStatus('failed');
      } catch (err) {
        console.error('Payment verification error:', err);
        if (err.message.includes('Authentication required') || err.message.includes('Session expired')) {
          setError(err.message);
          setStatus('auth_required');
        } else {
          setError(err.message || 'An error occurred during payment verification');
          setStatus('failed');
        }
      }
    };

    // Poll for subscription status to become active or trialing
    const pollSubscriptionStatus = async (subId, stripe) => {
      let attempts = 0;
      const maxAttempts = 15;

      const checkStatus = async () => {
        try {
          const statusData = await apiCall(`/stripe-elements/subscription-status/${subId}`);


          // Check for success statuses
          if (statusData.data?.status === 'active' || statusData.data?.status === 'trialing') {
            setSubscription(statusData.data);
            setStatus('success');
            return true;
          }

          // Check for failed payment
          if (statusData.data?.paymentStatus === 'requires_payment_method') {
            setError('Payment failed. Please try again with a different card.');
            setStatus('failed');
            return true;
          }

          // Check if 3DS is still required
          if (statusData.data?.requiresAction && statusData.data?.actionClientSecret) {
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
              statusData.data.actionClientSecret
            );

            if (confirmError) {
              setError(confirmError.message);
              setStatus('failed');
              return true;
            }

            // Continue polling after 3DS
          }

          if (attempts < maxAttempts) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return checkStatus();
          }

          // Max attempts reached
          // Still treat as "pending" if subscription exists
          if (statusData.data?.subscriptionId) {
            setSubscription({
              ...statusData.data,
              message: 'Subscription created. Final status may take a moment to update.',
            });
            setStatus('pending');
          } else {
            setError('Unable to verify subscription status. Please check your dashboard.');
            setStatus('failed');
          }
          return true;
        } catch (err) {
          console.error('Poll error:', err);
          if (attempts < maxAttempts) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return checkStatus();
          }
          setError('Failed to verify subscription status');
          setStatus('failed');
          return true;
        }
      };

      await checkStatus();
    };

    verifyPayment();
  }, [searchParams]);

  // Auth Required State
  if (status === 'auth_required') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-yellow-300 mb-8">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-purple-200/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
          <p className="text-purple-200">Please wait while we confirm your subscription...</p>
        </div>
      </div>
    );
  }

  // Success State
  if (status === 'success') {
    const isTrialing = subscription?.status === 'trialing' || subscription?.isInTrial;

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
            {isTrialing ? 'Trial Started! 🎉' : 'Payment Successful! 🎉'}
          </h2>
          <p className="text-emerald-300 mb-8">
            {isTrialing
              ? 'Your trial period has started. Enjoy full access to all features!'
              : 'Your subscription is now active. Thank you for your purchase!'
            }
          </p>

          {subscription && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70 text-sm">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  {subscription.status}
                </span>
              </div>

              {subscription.subscriptionId && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/70 text-sm">Subscription ID</span>
                  <span className="text-white font-mono text-sm">
                    {subscription.subscriptionId.slice(0, 18)}...
                  </span>
                </div>
              )}

              {isTrialing && subscription.trialEnd && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/70 text-sm">Trial Ends</span>
                  <span className="text-white text-sm">
                    {new Date(subscription.trialEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {!isTrialing && subscription.currentPeriodEnd && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/70 text-sm">Next Billing</span>
                  <span className="text-white text-sm">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pending State
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
          <p className="text-amber-300 mb-8">
            Your payment is being processed. This may take a few moments.
            {subscription?.message && <span className="block mt-2 text-amber-200/70 text-sm">{subscription.message}</span>}
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 px-6 bg-amber-500/20 border border-amber-500/30 text-amber-200 rounded-xl font-semibold hover:bg-amber-500/30 transition-all duration-200"
            >
              Refresh Status
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed State
  if (status === 'failed' || status === 'requires_action') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {status === 'requires_action' ? 'Action Required' : 'Payment Failed'}
          </h2>
          <p className="text-red-300 mb-8">{error || 'Something went wrong with your payment.'}</p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/subscribe')}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 px-6 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}

export default StripePaymentSuccess;
