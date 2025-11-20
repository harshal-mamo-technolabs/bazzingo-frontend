import React from 'react';
import RecentAssessmentCard from './RecentAssessmentCard';
import TranslatedText from '../TranslatedText.jsx';

const RecentAssessments = ({ assessments }) => {
  if (!assessments || assessments.length === 0) {
    return null;
  }
  return (
    <div className="bg-[#E8E8E8] rounded-lg p-6">
      <h2 className="text-black mb-6" style={{ fontSize: '20px', fontWeight: '500', fontFamily: 'Roboto, sans-serif' }}>
        <TranslatedText text="Recent Assessments" />
      </h2>

      <div className="space-y-6">
        {assessments.map((assessment) => (
          <RecentAssessmentCard
            key={assessment.id}
            assessment={assessment}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentAssessments;
