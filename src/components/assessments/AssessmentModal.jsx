import React from 'react';

const AssessmentModal = ({ isOpen, selectedAssessment, onClose }) => {
  if (!isOpen || !selectedAssessment) return null;

  return (
    <>
      {/* Backdrop –- solid shade, NO blur */}
      <div
        className="
          fixed inset-0
          bg-black/70         /* ← 70 % opacity, adjust to taste    */
          transition-opacity   /* optional fade-in */
          z-40
        "
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="
            bg-white rounded-2xl
            w-[90%] sm:w-4/5 md:w-2/3 lg:w-[40%]
            max-h-[90vh] overflow-y-auto
          "
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-2xl px-6 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <h2
                  className="text-gray-900 text-base lg:text-[28px]"
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: '500'
                  }}
                >
                  Daily Quick Assessment
                </h2>
              </div>
              <button
                className="bg-gray-100 text-gray-500 px-8 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm lg:text-base"
                onClick={onClose}
                style={{
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: '500'
                }}
              >
                Skip
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Assessment Card */}
            <div className="bg-gray-100 rounded-2xl p-3 mb-4">
              {/* Icon with circular background */}
              <div className="flex justify-center rounded-lg bg-white h-30">
                <div
                  className="rounded-lg flex items-center justify-center"
                >
                  <img
                    src="/brain.png"
                    alt="Assessment icon"
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>

              {/* Assessment Title */}
              <h3
                className="text-gray-800 mb-1 mt-3 text-sm lg:text-base"
                style={{
                  fontWeight: '600',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                {selectedAssessment.title}
              </h3>

              {/* Play Button */}
              <button
                className="w-full bg-[#FF6B3E] text-white rounded-lg py-1 hover:bg-[#E55A35] transition-colors text-sm lg:text-base"
                style={{
                  fontWeight: '500',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Play
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentModal;
