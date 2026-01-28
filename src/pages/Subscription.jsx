import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from '../components/Layout/MainLayout';
import { API_CONNECTION_HOST_URL } from '../utils/constant';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { 
  fetchSubscriptionStatus, 
  selectSubscriptionData, 
  selectSubscriptionLoading,
  selectSubscriptionError 
} from '../app/subscriptionSlice';
import { toast } from 'react-hot-toast';

const Subscription = () => {
  const dispatch = useDispatch();
  const subscriptionData = useSelector(selectSubscriptionData);
  const isLoading = useSelector(selectSubscriptionLoading);
  const error = useSelector(selectSubscriptionError);
  
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isEndingTrial, setIsEndingTrial] = useState(false);
  const actionsRef = useRef(null);
  const location = useLocation();

  // Fetch subscription status on component mount
  useEffect(() => {
    dispatch(fetchSubscriptionStatus());
  }, [dispatch]);

  // Focus actions if linked with action=end-trial
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'end-trial' && actionsRef.current) {
      try {
        actionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {}
      if (subscriptionData.status === 'trialing') {
        toast((t) => (
          <span>
            You can end your trial below.
            <button onClick={() => toast.dismiss(t.id)} className="ml-2 underline">Dismiss</button>
          </span>
        ));
      }
    }
  }, [location.search, subscriptionData.status]);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    
    try {
      const token = localStorage.getItem('user');
      if (!token) {
        toast.error('Please log in to cancel subscription');
        return;
      }

      const userData = JSON.parse(token);
      const accessToken = userData?.accessToken || userData?.user?.token;

      const response = await fetch(`${API_CONNECTION_HOST_URL}/stripe/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel subscription: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        toast.success('Subscription cancelled successfully. You will retain access until the end of your current billing period.');
        setShowCancelConfirm(false);
        // Refresh subscription status
        dispatch(fetchSubscriptionStatus());
      } else {
        throw new Error(result.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEndTrial = async () => {
    setIsEndingTrial(true);
    try {
      const stored = localStorage.getItem('user');
      if (!stored) {
        toast.error('Please log in to manage your subscription');
        return;
      }

      const userData = JSON.parse(stored);
      const accessToken = userData?.accessToken || userData?.user?.token;
      if (!accessToken) {
        toast.error('Authentication token missing. Please log in again.');
        return;
      }

      const payload = { timestamp: new Date().toISOString(), source: 'frontend' };

      const res = await fetch(`${API_CONNECTION_HOST_URL}/stripe/end-trial-pro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = result?.message || `Failed to end trial: ${res.status}`;
        throw new Error(msg);
      }

      const requestId = result?.data?.requestId;
      if (requestId) {
        try { sessionStorage.setItem('endTrialRequestId', requestId); } catch {}
      }

      if (result.status !== 'success') {
        const msg = result?.message || 'Unable to process request';
        console.error('Action Required:', result?.data?.action, 'Request ID:', requestId);
        toast.error(`${msg}${requestId ? ` (Ref: ${requestId})` : ''}`);
        return;
      }

      const action = result?.data?.action;

      if (action === 'requires_3ds_authentication') {
        const auth = result?.data?.authentication || {};
        const clientSecret = auth.clientSecret;
        if (!clientSecret) {
          throw new Error('Missing client secret for 3DS authentication');
        }

        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        if (!stripe) throw new Error('Stripe failed to initialize');

        const { error } = await stripe.confirmCardPayment(clientSecret);
        if (error) {
          throw new Error(error.message || 'Authentication failed. Please try again.');
        }

        // After successful 3DS, call API again to finalize
        const retryRes = await fetch(`${API_CONNECTION_HOST_URL}/stripe/end-trial-pro`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ timestamp: new Date().toISOString(), source: 'frontend' })
        });
        const retryJson = await retryRes.json().catch(() => ({}));

        const retryRequestId = retryJson?.data?.requestId;
        if (retryRequestId) {
          try { sessionStorage.setItem('endTrialRequestId', retryRequestId); } catch {}
        }

        if (!retryRes.ok || retryJson?.status !== 'success') {
          const msg = retryJson?.message || `Failed to finalize end trial: ${retryRes.status}`;
          throw new Error(`${msg}${retryRequestId ? ` (Ref: ${retryRequestId})` : ''}`);
        }

        const retryAction = retryJson?.data?.action;
        if (retryAction === 'trial_ended_successfully') {
          toast.success(retryJson?.message || 'Trial ended successfully. Subscription is now active.');
          dispatch(fetchSubscriptionStatus());
          return;
        }
        if (retryAction === 'payment_failed') {
          const reason = retryJson?.data?.paymentIssue?.lastError?.message || 'Payment failed.';
          toast.error(`${retryJson?.message || 'Payment failed.'} ${reason ? `- ${reason}` : ''}`);
          return;
        }
        if (retryAction === 'unknown') {
          toast.error(`${retryJson?.message || 'Unknown state.'}${retryRequestId ? ` (Ref: ${retryRequestId})` : ''}`);
          return;
        }

        // Fallback
        toast.success(retryJson?.message || 'Trial ended successfully.');
        dispatch(fetchSubscriptionStatus());
        return;
      }

      if (action === 'trial_ended_successfully') {
        toast.success(result?.message || 'Trial ended successfully. Subscription is now active.');
        dispatch(fetchSubscriptionStatus());
        return;
      }

      if (action === 'payment_failed') {
        const reason = result?.data?.paymentIssue?.lastError?.message || 'Payment failed.';
        toast.error(`${result?.message || 'Payment failed.'} ${reason ? `- ${reason}` : ''}`);
        return;
      }

      if (action === 'unknown') {
        toast.error(`${result?.message || 'Unknown state.'}${requestId ? ` (Ref: ${requestId})` : ''}`);
        return;
      }

      // Fallback for any other shape
      toast.success(result?.message || 'Trial ended successfully.');
      dispatch(fetchSubscriptionStatus());
    } catch (err) {
      console.error('Error ending trial (pro):', err);
      toast.error(err.message || 'Failed to end trial. Please try again.');
    } finally {
      setIsEndingTrial(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial Period';
      case 'cancelled':
      case 'canceled':
        return 'Cancelled';
      case 'past_due':
        return 'Past Due';
      default:
        return 'Inactive';
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration.charAt(0).toUpperCase() + duration.slice(1);
  };

  const formatCancellationDate = (cancelAt) => {
    if (!cancelAt) return 'N/A';
    try {
      const date = new Date(cancelAt);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage your Bazzingo subscription and billing details</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading subscription</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Status */}
          {subscriptionData.subscriptionStatus === 'none' || !subscriptionData.planName ? (
            // No Active Subscription
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
                <p className="text-gray-600 mb-6">You don't have an active subscription. Choose a plan to get started with Bazzingo.</p>
                <a
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                >
                  View Plans
                </a>
              </div>
            </div>
          ) : (
            // Active Subscription
            <div className="space-y-6">
              {/* Subscription Overview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 mr-3">{subscriptionData.planName}</h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscriptionData.status)}`}>
                        {getStatusText(subscriptionData.status)}
                      </span>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                       <div>
                         <dt className="text-sm font-medium text-gray-500">Billing Cycle</dt>
                         <dd className="mt-1 text-sm text-gray-900">{formatDuration(subscriptionData.planDuration)}</dd>
                       </div>
                       <div>
                         <dt className="text-sm font-medium text-gray-500">Status</dt>
                         <dd className="mt-1 text-sm text-gray-900">{getStatusText(subscriptionData.status)}</dd>
                       </div>
                     </div>

                     {/* Cancellation Status */}
                     {subscriptionData.cancelAtPeriodEnd && (
                       <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                         <div className="flex items-start">
                           <div className="flex-shrink-0">
                             <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                             </svg>
                           </div>
                           <div className="ml-3">
                             <h3 className="text-sm font-medium text-yellow-800">Subscription Cancelled</h3>
                             <div className="mt-2 text-sm text-yellow-700">
                               <p>Your subscription will end on <strong>{formatCancellationDate(subscriptionData.cancelAt)}</strong>. You will retain access until then.</p>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}

                    {/* Features */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Access to core games
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Daily brain teaser
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Basic insights
                        </div>
                        {(subscriptionData.planName?.includes('Gold') || subscriptionData.planName?.includes('Diamond')) && (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              All games & assessments
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Personalized training plan
                            </div>
                          </>
                        )}
                        {subscriptionData.planName?.includes('Diamond') && (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              1:1 expert sessions
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Advanced cognitive reports
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div ref={actionsRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Actions</h3>
                 <div className="flex flex-col sm:flex-row gap-4">
                   {subscriptionData.status === 'trialing' && (
                     <button
                       onClick={handleEndTrial}
                       disabled={isEndingTrial}
                       className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                     >
                       {isEndingTrial ? 'Ending trial...' : 'End Trial & Activate Monthly'}
                     </button>
                   )}
                   {(subscriptionData.status === 'active' || subscriptionData.status === 'trialing') && !subscriptionData.cancelAtPeriodEnd && (
                     <button
                       onClick={() => setShowCancelConfirm(true)}
                       className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                     >
                       Cancel Subscription
                     </button>
                   )}
                   {subscriptionData.cancelAtPeriodEnd && (
                     <div className="text-sm text-gray-600">
                       <p>Your subscription is already scheduled for cancellation on {formatCancellationDate(subscriptionData.cancelAt)}.</p>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          )}

          {/* Cancel Confirmation Modal */}
          {showCancelConfirm && (
            <div className="fixed inset-0 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Cancel Subscription</h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500 mb-4">
                      Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Keep Subscription
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Subscription;
