import React from 'react';
import { X, AlertTriangle, Award, FileText, Clock, CheckCircle } from 'lucide-react';

const AssessmentStartConfirmationModal = ({ isOpen, onClose, onConfirm, assessment, isProcessing }) => {
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
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Important Notice</h2>
              <p className="text-white/90 text-sm">One-time assessment opportunity</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {assessment.title || 'Certified Assessment'}
            </h3>
            
            {/* Warning Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">One-Time Assessment</h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    This is a <strong>one-time opportunity</strong>. Once you start and submit your assessment, 
                    you will not be able to retake it. Your score will be permanently recorded in Bazzingo 
                    and cannot be changed or updated.
                  </p>
                </div>
              </div>
            </div>

            {/* What You'll Receive */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">What you'll receive upon completion:</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Official Score Record</p>
                    <p className="text-xs text-gray-600">Your performance will be permanently saved in your Bazzingo profile</p>
                  </div>
                </div>

                {hasCertificate && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <Award className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Official Certificate</p>
                      <p className="text-xs text-gray-600">Downloadable certificate verifying your assessment completion</p>
                    </div>
                  </div>
                )}

                {hasReport && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <FileText className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Detailed Performance Report</p>
                      <p className="text-xs text-gray-600">Comprehensive analysis of your cognitive abilities and recommendations</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
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
                  Starting...
                </span>
              ) : (
                'Start Assessment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentStartConfirmationModal;
