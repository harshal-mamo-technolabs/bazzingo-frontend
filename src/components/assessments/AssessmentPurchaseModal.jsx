import React from 'react';
import { X, CheckCircle, FileText, Award } from 'lucide-react';

const AssessmentPurchaseModal = ({ isOpen, onClose, onBuy, assessment, isProcessing }) => {
  if (!isOpen || !assessment) return null;

  const hasCertificate = assessment?.isAvailCertification;
  const hasReport = assessment?.isAvailReport;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6B3E] to-[#FF8A65] p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Premium Assessment</h2>
              <p className="text-white/90 text-sm">Unlock your cognitive potential</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {assessment.title || 'Certified Assessment'}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              To access this comprehensive cognitive assessment, you'll need to purchase it. 
              This premium assessment will provide you with detailed insights into your cognitive abilities.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">What you'll get:</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Comprehensive Assessment</p>
                  <p className="text-xs text-gray-600">Detailed evaluation of your cognitive abilities</p>
                </div>
              </div>

              {hasCertificate && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Award className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Official Certificate</p>
                    <p className="text-xs text-gray-600">Receive a verified certificate upon completion</p>
                  </div>
                </div>
              )}

              {hasReport && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                    <FileText className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Detailed Report</p>
                    <p className="text-xs text-gray-600">Get comprehensive insights and recommendations</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-3 h-3 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Instant Access</p>
                  <p className="text-xs text-gray-600">Start your assessment immediately after purchase</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onBuy}
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#FF6B3E] to-[#FF8A65] hover:from-[#e55a35] hover:to-[#e67e5a]'
              }`}
            >
              {isProcessing ? (
                <span className="inline-flex items-center justify-center">
                  <span className="inline-block w-4 h-4 mr-2 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                'Buy Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPurchaseModal;
