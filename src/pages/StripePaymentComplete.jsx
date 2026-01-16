import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { API_CONNECTION_HOST_URL } from '../utils/constant';

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
  
  const response = await fetch(`${API_CONNECTION_HOST_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }
  
  return response.json();
};

/**
 * StripePaymentComplete Component
 * 
 * This page handles the redirect after 3DS authentication or payment completion.
 * It verifies the payment status and shows appropriate success/error UI.
 * 
 * URL Parameters:
 * - orderId: The order ID
 * - payment_intent: Stripe PaymentIntent ID (set by Stripe redirect)
 * - payment_intent_client_secret: PaymentIntent client secret (set by Stripe redirect)
 * - redirect_status: Payment status (succeeded, processing, requires_payment_method)
 */
function StripePaymentComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Check authentication first
        const token = getUserToken();
        if (!token) {
          setError('Please log in to verify your payment.');
          setStatus('auth_required');
          return;
        }

        // Get params from URL
        const orderId = searchParams.get('orderId');
        const paymentIntentId = searchParams.get('payment_intent');
        const clientSecret = searchParams.get('payment_intent_client_secret');
        const redirectStatus = searchParams.get('redirect_status');

        console.log('Payment verification params:', { orderId, paymentIntentId, redirectStatus });

        // If we have redirect status from Stripe
        if (redirectStatus === 'succeeded') {
          // Payment succeeded via redirect
          if (orderId) {
            const confirmData = await apiCall('/stripe-elements/confirm-payment', {
              method: 'POST',
              body: JSON.stringify({ orderId, paymentIntentId }),
            });

            if (confirmData.status === 'success') {
              setOrder(confirmData.data);
              setStatus('success');
              return;
            }
          }
          
          // Still show success if redirect says succeeded
          setOrder({ status: 'succeeded', paymentIntentId });
          setStatus('success');
          return;
        }

        if (redirectStatus === 'processing') {
          setOrder({ status: 'processing', orderId, paymentIntentId });
          setStatus('processing');
          return;
        }

        if (redirectStatus === 'requires_payment_method') {
          setError('Payment failed. Please try again with a different payment method.');
          setStatus('failed');
          return;
        }

        // If we have client secret, verify with Stripe directly
        if (clientSecret) {
          const configResponse = await fetch(`${API_CONNECTION_HOST_URL}/stripe-elements/config`);
          const configData = await configResponse.json();
          const stripe = await loadStripe(configData.data.publishableKey);

          const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
          console.log('PaymentIntent status:', paymentIntent.status);

          if (paymentIntent.status === 'succeeded') {
            // Confirm with backend
            if (orderId) {
              const confirmData = await apiCall('/stripe-elements/confirm-payment', {
                method: 'POST',
                body: JSON.stringify({ orderId, paymentIntentId: paymentIntent.id }),
              });

              if (confirmData.status === 'success') {
                setOrder(confirmData.data);
                setStatus('success');
                return;
              }
            }
            
            setOrder({ status: 'succeeded', paymentIntentId: paymentIntent.id });
            setStatus('success');
            return;
          }

          if (paymentIntent.status === 'processing') {
            setOrder({ status: 'processing', orderId, paymentIntentId: paymentIntent.id });
            setStatus('processing');
            return;
          }

          if (paymentIntent.status === 'requires_payment_method') {
            setError('Payment failed. Please try again.');
            setStatus('failed');
            return;
          }

          if (paymentIntent.status === 'requires_action') {
            // Need 3DS - shouldn't normally happen on this page
            setError('Additional authentication required.');
            setStatus('requires_action');
            return;
          }
        }

        // Just have orderId - check status
        if (orderId) {
          await pollOrderStatus(orderId);
          return;
        }

        // No valid parameters
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

    // Poll order status
    const pollOrderStatus = async (orderId) => {
      let attempts = 0;
      const maxAttempts = 10;

      const checkStatus = async () => {
        try {
          const statusData = await apiCall(`/stripe-elements/payment-status/${orderId}`);
          console.log('Poll attempt', attempts + 1, '- Status:', statusData.data?.status);

          if (statusData.data?.status === 'succeeded') {
            setOrder(statusData.data);
            setStatus('success');
            return true;
          }

          if (statusData.data?.status === 'requires_payment_method' || statusData.data?.status === 'failed') {
            setError('Payment failed. Please try again.');
            setStatus('failed');
            return true;
          }

          if (statusData.data?.status === 'canceled') {
            setError('Payment was canceled.');
            setStatus('failed');
            return true;
          }

          if (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            return checkStatus();
          }

          // Max attempts - show processing
          setOrder(statusData.data);
          setStatus('processing');
          return true;

        } catch (err) {
          console.error('Poll error:', err);
          if (attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            return checkStatus();
          }
          setError('Unable to verify payment status');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-200/20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
          <p className="text-blue-200">Please wait while we confirm your purchase...</p>
        </div>
      </div>
    );
  }

  // Success State
  if (status === 'success') {
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

          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful! 🎉</h2>
          <p className="text-emerald-300 mb-8">
            Your purchase has been completed successfully.
          </p>

          {order && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-left space-y-3 mb-8">
              {order.assessmentName && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/70 text-sm">Assessment</span>
                  <span className="text-white font-medium">{order.assessmentName}</span>
                </div>
              )}
              {order.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/70 text-sm">Amount</span>
                  <span className="text-white font-medium">
                    {(order.amount / 100).toFixed(2)} {order.currency?.toUpperCase() || 'EUR'}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70 text-sm">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Completed
                </span>
              </div>
              {order.orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200/70 text-sm">Order ID</span>
                  <span className="text-white font-mono text-sm">
                    {order.orderId.toString().slice(0, 12)}...
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Processing State
  if (status === 'processing') {
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
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 px-6 bg-amber-500/20 border border-amber-500/30 text-amber-200 rounded-xl font-semibold hover:bg-amber-500/30 transition-all duration-200"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
            >
              Dashboard
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
          <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
          <p className="text-red-300 mb-8">{error || 'Something went wrong with your payment.'}</p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
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

  return null;
}

export default StripePaymentComplete;

