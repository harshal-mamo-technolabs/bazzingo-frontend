import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
  
  if (response.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }
  
  return response.json();
};

// ============================================
// PAYMENT FORM COMPONENT
// ============================================
function PaymentForm({ orderId, paymentData, onSuccess, onError }) {
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
    setProcessingStep('Processing payment...');

    try {
      const userData = getUserData();
      
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete?orderId=${orderId}`,
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

      // Payment succeeded
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setProcessingStep('Payment successful!');

        // Confirm with backend
        const confirmData = await apiCall('/stripe-elements/confirm-payment', {
          method: 'POST',
          body: JSON.stringify({
            orderId: orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (confirmData.status === 'success') {
          onSuccess?.(confirmData.data);
        } else {
          // Still treat as success if payment went through
          onSuccess?.({
            orderId,
            status: 'succeeded',
            paymentIntentId: paymentIntent.id,
            ...paymentData
          });
        }
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is processing
        setProcessingStep('Payment processing...');
        onSuccess?.({
          orderId,
          status: 'processing',
          paymentIntentId: paymentIntent.id,
          ...paymentData
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      onError?.(err);
    }

    setIsProcessing(false);
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
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 text-sm flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
          ${isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
          }
        `}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay ${paymentData?.amount ? (paymentData.amount / 100).toFixed(2) : ''} ${paymentData?.currency?.toUpperCase() || 'EUR'}`
        )}
      </button>
    </form>
  );
}

// ============================================
// MAIN PAYMENT PAGE COMPONENT
// ============================================
/**
 * StripeElementsPayment Component
 * 
 * Props:
 * @param {string} assessmentId - Required: The assessment ID to purchase
 * @param {string} priceCatalogId - Optional: Specific price to use
 * @param {function} onSuccess - Callback when payment is successful
 * @param {function} onError - Callback when an error occurs
 * @param {string} successRedirectUrl - URL to redirect after success (default: /dashboard)
 */
function StripeElementsPayment({ 
  assessmentId: assessmentIdProp,
  priceCatalogId: priceCatalogIdProp,
  onSuccess: onSuccessCallback,
  onError: onErrorCallback,
  successRedirectUrl = '/dashboard'
}) {
  const [searchParams] = useSearchParams();
  const [stripeInstance, setStripeInstance] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get assessmentId from URL params or props
  const assessmentId = assessmentIdProp || searchParams.get('assessmentId');
  const priceCatalogId = priceCatalogIdProp || searchParams.get('priceCatalogId');

  useEffect(() => {
    // Check authentication first
    const token = getUserToken();
    if (!token) {
      setError('Please log in to continue with your purchase.');
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);

    if (!assessmentId) {
      setError('Assessment ID is required. Please provide it in the URL: /stripe-payment?assessmentId=YOUR_ID');
      setLoading(false);
      return;
    }

    const initialize = async () => {
      try {
        // Get Stripe instance
        const stripe = await getStripe();
        setStripeInstance(stripe);

        // Create PaymentIntent
        const data = await apiCall('/stripe-elements/create-payment', {
          method: 'POST',
          body: JSON.stringify({
            assessmentId,
            ...(priceCatalogId && { priceCatalogId }),
          }),
        });

        if (data.status === 'success') {
          setClientSecret(data.data.clientSecret);
          setOrderId(data.data.orderId);
          setPaymentData(data.data);
        } else {
          setError(data.message || 'Failed to initialize payment');
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message || 'Failed to connect to payment server');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [assessmentId, priceCatalogId]);

  const handleSuccess = (data) => {
    setSuccess(true);
    setPaymentData(data);
    onSuccessCallback?.(data);
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    onErrorCallback?.(error);
  };

  // Login Required State
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
          <p className="text-blue-200 mb-6">{error || 'Please log in to purchase.'}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-blue-200 font-medium text-lg">Loading payment form...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
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

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-left space-y-3 mb-8">
            {paymentData?.assessmentName && (
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70 text-sm">Assessment</span>
                <span className="text-white font-medium">{paymentData.assessmentName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-emerald-200/70 text-sm">Amount</span>
              <span className="text-white font-medium">
                {(paymentData?.amount / 100).toFixed(2)} {paymentData?.currency?.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-200/70 text-sm">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                {paymentData?.status || 'Completed'}
              </span>
            </div>
            {paymentData?.orderId && (
              <div className="flex justify-between items-center">
                <span className="text-emerald-200/70 text-sm">Order ID</span>
                <span className="text-white font-mono text-sm">
                  {paymentData.orderId.toString().slice(0, 12)}...
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => (window.location.href = successRedirectUrl)}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Payment Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Complete Your Purchase</h2>

            {/* Product info */}
            {paymentData && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-white font-medium mb-1">
                  {paymentData.assessmentName || 'Full Assessment'}
                </p>
                <p className="text-blue-200 text-2xl font-bold">
                  {(paymentData.amount / 100).toFixed(2)}{' '}
                  <span className="text-blue-300 text-lg">{paymentData.currency?.toUpperCase()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Stripe Elements */}
          {clientSecret && stripeInstance && (
            <Elements
              stripe={stripeInstance}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#3b82f6',
                    colorBackground: '#1e3a5f',
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
                      border: '1px solid #3b82f6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)',
                    },
                    '.Label': {
                      color: '#93c5fd',
                    },
                    '.Tab': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    '.Tab--selected': {
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid #3b82f6',
                    },
                  },
                },
              }}
            >
              <PaymentForm
                orderId={orderId}
                paymentData={paymentData}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          )}

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-blue-300/60 text-sm">
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
          <p className="text-blue-200/80 text-xs text-center mb-2 font-medium">Test Cards</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-blue-300/60">
              <span className="font-mono text-blue-200">4242 4242 4242 4242</span>
              <span className="block text-blue-300/40">Success</span>
            </div>
            <div className="text-blue-300/60">
              <span className="font-mono text-blue-200">4000 0025 0000 3155</span>
              <span className="block text-blue-300/40">3DS Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StripeElementsPayment;

