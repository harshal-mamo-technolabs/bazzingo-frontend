import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { BazzingoHeadImage } from "../../assets/assessmentAssets";
import TranslatedText from '../TranslatedText.jsx';
import { isStripePaymentEnabled } from '../../config/accessControl';

const formatPrice = (price) => {
  if (!price || !price.unitAmount) return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (price.currency || 'eur').toUpperCase(),
    }).format(price.unitAmount / 100);
  } catch {
    return `${(price.unitAmount / 100).toFixed(2)} ${price.currency || ''}`;
  }
};

const AssessmentCard = ({ assessment, onClick, onStartCertifiedTest, processingAssessmentId }) => {
  // Format the API data to match the expected structure
  const formattedAssessment = {
    id: assessment._id,
    title: assessment.title || 'Untitled Assessment',
    questions: assessment.questions || 0,
    description: assessment.description || 'No description available',
    iconSrc: BazzingoHeadImage // Default icon
  };

  const isProcessing = processingAssessmentId && (processingAssessmentId === (assessment._id || formattedAssessment.id));

  const priceLabel = formatPrice(assessment.price);
  const showPricing = isStripePaymentEnabled() && !assessment.isAssessmentPurchased && priceLabel;

  return (
    <div
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
    >
      {/* Purchased Badge */}
      {assessment?.isAssessmentPurchased && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg border-2 border-white">
            ✓ <TranslatedText text="Purchased" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className="shrink-0 aspect-square w-16 sm:w-20 lg:w-12
             flex items-center justify-center rounded-lg overflow-hidden"
        >
          <img
            src={formattedAssessment.iconSrc}
            alt={`${formattedAssessment.title} icon`}
            className="w-full h-full object-cover"
          />
        </div>

        <h3
          className="text-[#ff6c40]"
          style={{ fontSize: '22px', fontWeight: 600, lineHeight: 1.2 }}
        >
          <TranslatedText text={formattedAssessment.title} />
        </h3>
      </div>

      <p className="text-black mb-2" style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Roboto, sans-serif' }}>
        <TranslatedText text={`${formattedAssessment.questions} Question${formattedAssessment.questions !== 1 ? 's' : ''}`} />
      </p>

      <p className="text-gray-600 mb-4" style={{ fontSize: '14px', fontWeight: '400', lineHeight: '1.4', fontFamily: 'Roboto, sans-serif', color: '#6B7280' }}>
        <TranslatedText text={formattedAssessment.description} />
      </p>

      {showPricing && (
        <div className="mb-4 pb-3 border-b border-gray-100 flex items-center flex-wrap gap-x-2 gap-y-1">
          <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'Roboto, sans-serif' }} className="text-[#FF6B3E]">
            {priceLabel}
          </span>
          <span className="text-gray-400" style={{ fontSize: '12px', fontFamily: 'Roboto, sans-serif' }}>
            <TranslatedText text="one-time" />
          </span>

          {(assessment.isAvailReport || assessment.isAvailCertification) && (
            <span className="text-gray-300">•</span>
          )}

          {assessment.isAvailReport && (
            <span className="inline-flex items-center gap-1 text-gray-500" style={{ fontSize: '12px', fontFamily: 'Roboto, sans-serif' }}>
              <CheckCircleIcon className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <TranslatedText text="Report included" />
            </span>
          )}
          {assessment.isAvailCertification && (
            <span className="inline-flex items-center gap-1 text-gray-500" style={{ fontSize: '12px', fontFamily: 'Roboto, sans-serif' }}>
              <CheckCircleIcon className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <TranslatedText text="Certificate included" />
            </span>
          )}
        </div>
      )}

      <button
        className={`w-full rounded-md py-2 px-4 font-medium transition-colors text-white ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF6B3E] hover:bg-[#e55a35]'}`}
        style={{ fontFamily: 'Roboto', fontSize: '16px' }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isProcessing) {
            onStartCertifiedTest && onStartCertifiedTest(assessment);
          }
        }}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="inline-flex items-center justify-center">
            <span className="inline-block w-4 h-4 mr-2 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
            <TranslatedText text="Processing..." />
          </span>
        ) : (
          <TranslatedText text="Start Certified Test" />
        )}
      </button>
    </div>
  );
};

export default AssessmentCard;