import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import DailyPuzzleIcon from "../../public/daily-puzzle-icon.png";
import DailyAssessmentIcon from "../../public/daily-assessment-icon.png";
import MageScapeIcon from "../../public/maze-escape-icon.png";
import CheckIcon from "../../public/carbon_checkmark-filled.png";
import AssessmentCompletionModal from "../components/assessments/AssessmentCompletionModal.jsx";

export default function VisualReasoningLayout() {
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [selectedAssessment, setSelectedAssessment] = useState(null);
  
    const handleAssessmentClick = () => {
      //setSelectedAssessment(assessment);
      setIsModalOpen(true);
    };

 const questions = [
  {
    id: 1,
    title: "Q1- What comes next in the sequence: 2, 4, 8, 16, ___?",
    text: "Identify the next number in this doubling pattern.",
    options: ["18", "24", "32", "36"],
  },
  {
    id: 2,
    title: "Q2- Which word does NOT belong with the others?",
    text: "Look at the following words and select the one that does not belong.",
    options: ["Apple", "Banana", "Carrot", "Grape"],
  },
  {
    id: 3,
    title: "Q3- If all Bloops are Razzies, and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
    text: "Select the correct answer based on logical deduction.",
    options: ["Yes", "No", "Cannot be determined", "Only sometimes"],
  },
  {
    id: 4,
    title: "Q4- Rearrange the letters in 'CIPHER' to form:",
    text: "What type of word can you form from rearranging the letters in 'CIPHER'?",
    options: ["Animal", "Fruit", "Occupation", "Color"],
  },
  {
    id: 5,
    title: "Q5- If 3 pencils cost ₹15, how much do 10 pencils cost?",
    text: "Solve the math problem and select the correct answer.",
    options: ["₹40", "₹45", "₹50", "₹55"],
  },
];


  // ProgressBar Component
const ProgressBar = ({ percentage }) => (
  <div className="relative w-full lg:max-w-[150px] h-9 bg-white border border-gray-200 rounded-[5px] overflow-hidden">
    <div
      className="absolute inset-y-0 left-0 bg-[#fda98d] rounded-l-[5px] transition-all duration-500"
      style={{ width: `${percentage}%` }}
    />
    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-800 z-10">
      {percentage}%
    </div>
  </div>
);

const activities = [
  {
    icon: '/daily-puzzle-icon.png',
    alt: 'Daily Puzzle',
    label: 'Daily Puzzle',
    complete: '36/36',
    pct: 80,
    statusType: 'completed',
    iconBg: 'bg-gray-100',
  },
  {
    icon: '/daily-assessment-icon.png',
    alt: 'Daily Assessment',
    label: 'Daily Assessment',
    complete: '20/20',
    pct: 30,
    statusType: 'completed',
    iconBg: 'bg-gray-100',
  },
  {
    icon: '/maze-escape-activity-icon.png',
    alt: 'Mage Scape',
    label: 'Mage Scape',
    complete: '4/36',
    pct: 10,
    statusType: 'resume',
    iconBg: 'bg-blue-50',
  },
];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  // Timer logic
  useEffect(() => {
    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleContinue();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    }
  };

  return (
    <>
      <Header />
      <div className="mx-auto px-4 lg:px-12 py-4 lg:py-7" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[580px]">
          {/* LEFT CARD */}
          <div className="lg:w-1/4 w-full bg-[#EEEEEE] rounded p-6 flex flex-col h-full">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Visual Reasoning Questions</h2>
              <span className="bg-black text-white text-sm px-3 py-1 rounded">
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
              </span>
            </div>

            <p className="text-[13px] mb-4">
              Test your memory by finding all the matching pairs of cards.
            </p>

            {/* On small/medium screens → show current question only + toggle */}
            <div className="flex-grow flex flex-col">
              {/* Mobile/Tablet view */}
              <div className="block lg:hidden">
                {/* Current active question box */}
                <div
                  className={`p-3 rounded text-[13px] cursor-pointer border mb-2 ${currentIndex === currentIndex
                      ? "bg-[#FFE2D9] border-[#FF2738]"
                      : "bg-white border-transparent"
                    }`}
                >
                  {questions[currentIndex].title}
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => setShowAllQuestions(!showAllQuestions)}
                  className="text-sm mt-4 flex items-center gap-5 font-semibold"
                >
                  More Questions
                  <svg
                    className={`w-4 h-4 transform transition-transform ${showAllQuestions ? "rotate-180" : "rotate-0"
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded question list */}
                {showAllQuestions && (
                  <div className="mt-2 flex flex-col gap-2">
                    {questions.map((q, index) => (
                      <div
                        key={q.id}
                        className={`p-3 rounded text-[13px] cursor-pointer border ${index === currentIndex
                            ? "bg-[#FFE2D9] border-[#FF2738]"
                            : "bg-white border-transparent"
                          }`}
                      >
                        {q.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop view (always show all) */}
              <div className="hidden lg:flex flex-col gap-2">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className={`lg:p-1 xl:p-3 rounded lg:text-[12px] xl:text-[13px] cursor-pointer border  ${index === currentIndex
                        ? "bg-[#FFE2D9] border-[#FF2738]"
                        : "bg-white border-transparent"
                      }`}
                  >
                    {q.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* MIDDLE CARD */}
          <div className="lg:w-2/4 w-full bg-white p-4 flex flex-col h-full">
            <div className="w-full mb-6">
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-visible">
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    background: "linear-gradient(90deg, #F4C3B4 0%, #FF6C40 100%)",
                  }}
                ></div>
                <div
                  className="absolute top-1/2 flex items-center justify-center"
                  style={{
                    left: `calc(${progressPercent}% - 20px)`,
                    transform: "translateY(-50%)",
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FF5727] flex items-center justify-center border-4 border-[#FFD2C2] shadow-lg">
                    <img src="/progress_brain.png" alt="brain" className="w-6 h-6 object-contain" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[15px] font-semibold">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[15px] font-semibold">
                  {Math.floor(progressPercent)}%
                </span>
              </div>
            </div>

            <div className="border border-gray-200 rounded p-4 mb-6 flex-grow flex flex-col">
              <h5 className="text-base mb-2 font-semibold">
                {currentQuestion.title}
              </h5>
              <p className="text-[15px] mb-4">{currentQuestion.text}</p>
              <div className="flex flex-col gap-2 mb-6 flex-grow">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option}
                    className={`flex justify-between items-center p-2 border rounded cursor-pointer ${selectedOption === option
                        ? "border-orange-400"
                        : "border-gray-300"
                      }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question_${currentIndex}`}
                        checked={selectedOption === option}
                        onChange={() => setSelectedOption(option)}
                        className="h-4 w-4 text-orange-300 focus:ring-orange-300 accent-orange-300"
                      />
                      <span className="ml-2 text-[15px]">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse lg:flex-row justify-center gap-2 mt-auto">
              <button className="px-4 py-2 w-full bg-[#D8D8D8] text-gray-600 rounded-lg">
                Exit & Save
              </button>
              <button
                className="px-4 py-2 w-full bg-orange-500 text-white rounded-lg"
                onClick={currentQuestion.id === 5 ?  handleAssessmentClick : handleContinue}
              >
                {currentQuestion.id === 5 ? "Submit" : "Continue"}
              </button>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="lg:w-1/4 w-full lg:bg-[#EEEEEE] rounded p-4 flex flex-col h-full">
            <h5 className="text-lg font-semibold mb-4">Recent Activity</h5>
            <div className="hidden lg:block">
            <div className="flex flex-col gap-3 flex-grow">
              <div className="flex items-center bg-white rounded p-3 gap-3">
                <img
                  src={DailyPuzzleIcon}
                  alt="Daily Puzzle"
                  className="w-10 h-10 object-contain"
                />
                <div className="flex flex-col flex-grow">
                  <span className="text-[14px] font-semibold">Daily Puzzle</span>
                  <span className="inline-block mt-1 rounded-lg border-2 border-[#118C24]
                  bg-gradient-to-b from-[#E2F8E0] via-[#CDEDC8] to-[#DAF3D5]
                  px-2 py-1 text-[#118C24] font-bold text-[12px] leading-none w-20">Completed</span>
                </div>
                <img
                  src={CheckIcon}
                  alt="Completed"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="flex items-center bg-white rounded p-3 gap-3">
                <img
                  src={DailyAssessmentIcon}
                  alt="Daily Assessment"
                  className="w-10 h-10 object-contain"
                />
                <div className="flex flex-col flex-grow">
                  <span className="text-[14px] font-semibold">Daily Assessment</span>
                  <span className="inline-block mt-1 rounded-lg border-2 border-[#118C24]
                  bg-gradient-to-b from-[#E2F8E0] via-[#CDEDC8] to-[#DAF3D5]
                  px-2 py-1 text-[#118C24] font-bold text-[12px] leading-none w-20">
                    Completed
                  </span>
                </div>
                <img
                  src={CheckIcon}
                  alt="Completed"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className="flex items-center bg-white rounded p-3 gap-3">
                <img
                  src={MageScapeIcon}
                  alt="Mage Scape"
                  className="w-10 h-10 object-contain bg-blue-200 rounded p-1"
                />
                <div className="flex flex-col flex-grow">
                  <span className="text-[14px] font-semibold">Mage Scape</span>
                  <span className="bg-[#FFEFE8] text-[#FF6700] inline-block mt-1 rounded-lg border-2 
                  px-2 py-1 font-bold text-[12px] leading-none w-15 border-[#FF6700]">
                    Resume
                  </span>
                </div>
              </div>
            </div>
            </div>
            <div className="lg:hidden block">
              <div className="space-y-4 mt-4">
               {activities.map(({ icon, alt, label, pct, statusType, iconBg }, idx) => (
    <div
      key={idx}
      className="bg-[#F2F5F6] rounded-xl px-3 py-4 flex items-center justify-between gap-3"
    >
      {/* Icon + Label */}
      <div className="flex items-center gap-2 min-w-[100px]">
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}
        >
          <img src={icon} alt={alt} className="w-10 h-10" />
        </div>
        <span className="text-[12px] font-medium text-gray-900 leading-tight max-w-[30px]">{label}</span>
      </div>

      {/* ProgressBar */}
      <div className="flex-1 mx-2 max-w-[190px]">
        <ProgressBar percentage={pct} />
      </div>

      {/* Status */}
      <div className="flex items-center justify-end min-w-[20px]">
        {statusType === 'completed' ? (
          <div className="flex items-center space-x-1 text-green-600 text-xs font-medium">
            <img src="/task-complete-icon.svg" alt="Completed" className="w-4 h-4" />
            <span>Completed</span>
          </div>
        ) : (
          <button className="bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 px-4 py-[6px] rounded-md text-xs font-medium transition-colors">
            Resume
          </button>
        )}
      </div>
    </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
      {/* New Assessment Modal */}
        <AssessmentCompletionModal
          isOpen={isModalOpen}
          //selectedAssessment={selectedAssessment}
          onClose={() => setIsModalOpen(false)}
        />
    </>
  );
}
