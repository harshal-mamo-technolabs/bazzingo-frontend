import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { API_CONNECTION_HOST_URL } from '../utils/constant';
import { useDispatch } from 'react-redux';
import { fetchSubscriptionStatus } from '../app/subscriptionSlice';

// Toast Component
function Toast({ message, type = 'success', onClose }) {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-blue-500';
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{message}</span>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user token for API calls
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

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Auto-hide after 5 seconds
  };

  // Get assessment ID from order or session
  const getAssessmentId = async (orderId, sessionId) => {
    try {
      const token = getUserToken();
      let apiUrl = '';
      
      if (orderId) {
        apiUrl = `${API_CONNECTION_HOST_URL}/stripe/assessment-id?orderId=${orderId}`;
      } else if (sessionId) {
        apiUrl = `${API_CONNECTION_HOST_URL}/stripe/assessment-id?sessionId=${sessionId}`;
      } else {
        return null;
      }

      console.log('🔍 [PAYMENT SUCCESS] Getting assessment ID from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Assessment ID API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 [PAYMENT SUCCESS] Assessment ID response:', data);

      if (data.status === 'success' && data.data?.found && data.data?.assessmentId) {
        return data.data.assessmentId;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [PAYMENT SUCCESS] Assessment ID error:', error);
      return null;
    }
  };

  // Handle session check API call
  const checkSession = async (sessionId) => {
    try {
      console.log('🔍 [PAYMENT SUCCESS] Checking session:', sessionId);
      
      const token = getUserToken();
      const response = await fetch(`${API_CONNECTION_HOST_URL}/stripe/session/check?stripeSessionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Session check failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 [PAYMENT SUCCESS] Session check response:', data);

      if (data.status === 'success' && data.data) {
        const { presentInOrder, presentInSubscription } = data.data;
        
        if (presentInOrder) {
          // Try to get assessment ID for auto-start
          const assessmentId = await getAssessmentId(null, sessionId);
          if (assessmentId) {
            // Store assessment ID and navigate to assessments with auto-start
            localStorage.setItem('autoStartAssessmentId', assessmentId);
            showToast('Congratulations! Your assessment is unlocked successfully', 'success');
            setTimeout(() => navigate('/assessments'), 2000);
          } else {
            // Fallback to normal assessment page
            showToast('Congratulations! Your assessment is unlocked successfully', 'success');
            setTimeout(() => navigate('/assessments'), 2000);
          }
        } else if (presentInSubscription) {
          showToast('Congratulations! Your new plan purchase successful', 'success');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          // Default case
          showToast('Congratulations! Your new plan purchase successful', 'success');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } else {
        throw new Error('Invalid response from session check API');
      }
    } catch (error) {
      console.error('❌ [PAYMENT SUCCESS] Session check error:', error);
      // Fallback to default behavior
      showToast('Congratulations! Your new plan purchase successful', 'success');
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('order_id');
      const sessionId = urlParams.get('session_id');
      
      console.log('🎯 [PAYMENT SUCCESS] Processing payment success:', {
        orderId,
        sessionId,
        allParams: Object.fromEntries(urlParams.entries())
      });

      // Case 1: order_id parameter - Assessment purchase
      if (orderId) {
        // Try to get assessment ID for auto-start
        const assessmentId = await getAssessmentId(orderId, null);
        if (assessmentId) {
          // Store assessment ID and navigate to assessments with auto-start
          localStorage.setItem('autoStartAssessmentId', assessmentId);
        }
        showToast('Congratulations! Your assessment is unlocked successfully', 'success');
        setTimeout(() => navigate('/assessments'), 2000);
        return;
      }

      // Case 2: session_id parameter - Check with API
      if (sessionId) {
        checkSession(sessionId);
        return;
      }

      // Case 3: Any other case - Default plan purchase
      showToast('Congratulations! Your new plan purchase successful', 'success');
      setTimeout(() => navigate('/dashboard'), 2000);
    };

    // Fetch subscription status when page loads
    dispatch(fetchSubscriptionStatus());

    // Small delay to ensure page is loaded
    setTimeout(() => {
      handlePaymentSuccess();
      setLoading(false);
    }, 500);
  }, [navigate, dispatch]);

  return (
    <MainLayout>
      <div className="bg-white min-h-screen flex items-center justify-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h1 className="text-gray-900 text-xl font-semibold">Processing your payment...</h1>
              <p className="text-gray-500 mt-2">Please wait while we confirm your purchase</p>
            </>
          ) : (
            <>
              <img src="/task-complete-icon.svg" alt="Success" className="w-16 h-16 mx-auto mb-6" />
              <h1 className="text-gray-900 text-2xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-gray-600">Redirecting you to your dashboard...</p>
            </>
          )}
        </div>
        
        {/* Toast Message */}
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}