import React from 'react';
import AssessmentCard from './AssessmentCard';

const AssessmentGrid = ({ assessments, onAssessmentClick, onStartCertifiedTest, processingAssessmentId }) => {
  return (
    <div className="lg:bg-[#E8E8E8] lg:rounded-lg lg:p-6">
      <h2 className="text-black font-semibold mb-6 hidden lg:block" style={{ fontSize: '16px' }}>
        Assessments
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {assessments.map((assessment) => (
          <AssessmentCard
            key={assessment._id || assessment.id}
            assessment={assessment}
            onClick={onAssessmentClick}
            onStartCertifiedTest={onStartCertifiedTest}
            processingAssessmentId={processingAssessmentId}
          />
        ))}
      </div>
    </div>
  );
};

export default AssessmentGrid;
