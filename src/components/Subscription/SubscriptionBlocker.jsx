import React from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionBlocker = ({ 
  children, 
  showBlocker = false, 
  title = "Premium Feature", 
  message = "Please subscribe to Bazzingo plan to access this feature",
  buttonText = "Subscribe Now",
  onSubscribe = null
}) => {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe();
    } else {
      navigate('/pricing');
    }
  };

  if (!showBlocker) {
    return children;
  }

  return (
    <div className="relative">
      {/* Blurred content - exclude navbar area */}
      <div className="filter blur-sm pointer-events-none select-none" style={{ marginTop: '56px' }}>
        {children}
      </div>
      
      {/* Fixed overlay - always centered in viewport with transparent white blur */}
      <div className="fixed inset-0 flex items-center justify-center z-40 backdrop-blur-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 max-w-sm mx-4 shadow-lg border border-white/20 text-center">
          {/* Simple Icon */}
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {message}
          </p>
          
          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 text-sm"
          >
            {buttonText}
          </button>
          
          {/* Simple Features */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-center gap-6 text-xs text-gray-500">
              <span className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Analytics
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Leaderboard
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Premium
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBlocker;
