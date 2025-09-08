import React from 'react';
import { BazzingoHeadImage } from "../../../public/assessment";

const AssessmentCard = ({ assessment, onClick }) => {
  // Format the API data to match the expected structure
  const formattedAssessment = {
    id: assessment._id,
    title: assessment.title || 'Untitled Assessment',
    questions: assessment.questions || 0,
    description: assessment.description || 'No description available',
    iconSrc: BazzingoHeadImage // Default icon
  };

  return (
    <div
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(assessment)} // Pass the original assessment object with _id
    >
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
          {formattedAssessment.title}
        </h3>
      </div>

      <p className="text-black mb-2" style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Roboto, sans-serif' }}>
        {formattedAssessment.questions} Question{formattedAssessment.questions !== 1 ? 's' : ''}
      </p>

      <p className="text-gray-600 mb-4" style={{ fontSize: '14px', fontWeight: '400', lineHeight: '1.4', fontFamily: 'Roboto, sans-serif', color: '#6B7280' }}>
        {formattedAssessment.description}
      </p>

      <button className="w-full bg-[#FF6B3E] text-white rounded-md py-2 px-4 font-medium hover:bg-[#e55a35] transition-colors" style={{ fontFamily: 'Roboto', fontSize: '16px' }}>
        Start Certified Test
      </button>
    </div>
  );
};

export default AssessmentCard;