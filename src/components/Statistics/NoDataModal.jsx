import React, { useState, useRef } from 'react';
import { X, Info } from 'lucide-react';

const NoDataModal = ({ isOpen, onClose, onAssesmentClick, category = "Driving License" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconRef = useRef(null);

  const handleTooltipClick = (setTooltipFn) => {
    setTooltipFn(true);
    setTimeout(() => {
      setTooltipFn(false);
    }, 3000);
  };

  if (!isOpen) return null;

  // Get category-specific content
  const getCategoryContent = () => {
    switch (category.toLowerCase()) {
      case 'iq test':
        return {
          title: 'IQ Test Assessment Needed',
          description: 'To unlock your cognitive performance insights, take the IQ Test assessment. It\'s comprehensive, insightful, and your gateway to understanding your mental capabilities.',
          buttonText: 'Start IQ Test',
          icon: '/brain_yellow.png'
        };
      case 'logic':
        return {
          title: 'Logic Assessment Needed',
          description: 'To unlock your logical reasoning insights, take the Logic assessment. It\'s analytical, challenging, and your key to understanding your reasoning abilities.',
          buttonText: 'Start Logic Test',
          icon: '/brain_yellow.png'
        };
      case 'driving license':
      default:
        return {
          title: 'Driving License Assessment Needed',
          description: 'To unlock your daily mental fitness challenges, take the first step by completing the Driving License test. It\'s quick, empowering, and your key to progress.',
          buttonText: 'Start Driving License Test',
          icon: '/DL_img.png'
        };
    }
  };

  const content = getCategoryContent();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop - Non-clickable to prevent closing */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div className="
        relative bg-white rounded-lg shadow-xl
        w-[90vw] md:w-[70vw] lg:w-[30vw]
        h-auto max-h-[70vh] flex flex-col justify-center
        px-6 py-6
      ">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main Content */}
        <div className="bg-[#f6c8bc] rounded-lg text-black w-full p-4 mt-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm font-medium">{content.title}</span>
            </div>
            <div
              ref={iconRef}
              className="relative cursor-pointer"
              onClick={() => handleTooltipClick(setShowTooltip)}
            >
              <Info className="w-4 h-4 text-black" />
              {showTooltip && (
                <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/80 backdrop-blur-md border border-white/30 rounded shadow-md">
                  Begin with the {category} test to unlock your full assessment experience.
                </div>
              )}
            </div>
          </div>

          {/* Center Image & Message */}
          <div className="flex flex-col items-center justify-center text-center mb-5">
            <img
              src={content.icon}
              alt={`${category} Icon`}
              className="w-[80px] h-[80px] object-contain mb-3"
            />
            <h2 className="text-lg font-bold">Start Your Journey with Confidence</h2>
            <p className="text-sm text-gray-800 mt-2 px-2">
              {content.description}
            </p>
          </div>

          {/* CTA Button */}
          <button
            className="w-full bg-[#00332e] hover:bg-[#00443e] text-white text-sm font-semibold py-2.5 rounded-md"
            onClick={onAssesmentClick}
          >
            {content.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoDataModal;
