
import React, { useState } from 'react';
import { Car } from 'lucide-react';
import Header from '../components/Header';
import AssessmentGrid from '../components/assessments/AssessmentGrid';
import RecentAssessments from '../components/assessments/RecentAssessments';
import AssessmentModal from '../components/assessments/AssessmentModal';

const Assessments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const handleAssessmentClick = (assessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  const assessments = [
    {
      id: 1,
      title: "General Cognitive Test",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 2,
      title: "General Cognitive Test",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 3,
      title: "General Cognitive Test",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 4,
      title: "General Cognitive Test",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 5,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 6,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 7,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 8,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    },
    {
      id: 9,
      title: "Logic",
      questions: 30,
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      iconBg: "bg-green-100"
    }
  ];

  const recentAssessments = [
    {
      id: 1,
      title: "General Cognitive",
      status: "Completed",
      score: 124,
      iconBg: "bg-orange-100",
      type: "brain"
    },
    {
      id: 2,
      title: "Driving License",
      status: "Completed",
      score: 124,
      icon: Car,
      iconBg: "bg-orange-100",
      type: "car"
    }
  ];

  const unreadCount = 5;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
      {/* Header */}
      <Header unreadCount={unreadCount} />

      {/* Main Content */}
      <div className="mx-auto px-4 lg:px-12 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section - Assessments */}
          <div className="flex-1">
            <AssessmentGrid
              assessments={assessments}
              onAssessmentClick={handleAssessmentClick}
            />
          </div>

          {/* Right Section - Recent Assessments - Hidden on mobile */}
          <div className="hidden lg:block w-full lg:w-[340px]">
            <RecentAssessments assessments={recentAssessments} />
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      <AssessmentModal
        isOpen={isModalOpen}
        selectedAssessment={selectedAssessment}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Assessments;
