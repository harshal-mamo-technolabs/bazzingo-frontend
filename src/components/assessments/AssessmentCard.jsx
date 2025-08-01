import React from 'react';
import { BazzingoHeadImage } from "../../../public/assessment";

const AssessmentCard = ({ assessment, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(assessment)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="shrink-0 aspect-square w-16 sm:w-20 lg:w-12
             flex items-center justify-center rounded-lg overflow-hidden"
        >
          <img
            src={assessment.iconSrc ?? BazzingoHeadImage}
            alt={`${assessment.title} icon`}
            className="w-full h-full object-cover"
          />
        </div>

        <h3
          className="text-[#ff6c40]"
          style={{ fontSize: '22px', fontWeight: 600, lineHeight: 1.2 }}
        >
          {assessment.title}
        </h3>
      </div>

      <p className="text-black mb-2" style={{ fontSize: '14px', fontWeight: '500', fontFamily: 'Roboto, sans-serif' }}>
        {assessment.questions} Question
      </p>

      <p className="text-gray-600 mb-4" style={{ fontSize: '14px', fontWeight: '400', lineHeight: '1.4', fontFamily: 'Roboto, sans-serif', color: '#6B7280' }}>
        {assessment.description}
      </p>

      <button className="w-full bg-[#FF6B3E] text-white rounded-md py-2 px-4 font-medium hover:bg-[#e55a35] transition-colors" style={{ fontFamily: 'Roboto', fontSize: '16px' }}>
        Start Certified Test
      </button>
    </div>
  );
};

export default AssessmentCard;
