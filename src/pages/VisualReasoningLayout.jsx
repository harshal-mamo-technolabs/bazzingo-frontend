import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import DailyPuzzleIcon from "../../public/daily-puzzle-icon.png";
import DailyAssessmentIcon from "../../public/daily-assessment-icon.png";
import MageScapeIcon from "../../public/maze-escape-icon.png";
import CheckIcon from "../../public/carbon_checkmark-filled.png";

export default function VisualReasoningLayout() {
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const questions = [
    {
      id: 1,
      title: "Q1- Which figure completes the pattern?",
      text: "Observe the problem figures given and select one option from the answer figures which will continue the same pattern followed in the problem figures.",
      options: ["A", "B", "C", "D", "E"],
    },
    {
      id: 2,
      title: "Q2- Find the image that doesn't belong in the group?",
      text: "Look at the group of images and identify the one that is different from the rest.",
      options: ["A", "B", "C", "D"],
    },
    {
      id: 3,
      title: "Q3- Which of the following is the correct mirror image of this figure?",
      text: "Choose the correct mirror image from the options below.",
      options: ["A", "B", "C", "D"],
    },
    {
      id: 4,
      title: "Q4- A shape rotates 90° clockwise in each step. What will it look like after the 4th rotation?",
      text: "Figure out the resulting image after the rotations.",
      options: ["A", "B", "C", "D"],
    },
    {
      id: 5,
      title: "Q5- You see a block structure from the front and the side. Which 3D shape matches both views?",
      text: "Select the 3D shape that matches the given views.",
      options: ["A", "B", "C", "D"],
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
      <div className="mx-auto px-4 lg:px-12 py-4 lg:py-7">
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[550px]">
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
                    className={`p-3 rounded text-[13px] cursor-pointer border ${index === currentIndex
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
                    background: "linear-gradient(90deg, #FF7C5C 0%, #FF5727 100%)",
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
                    <img src="/brain.png" alt="brain" className="w-6 h-6 object-contain" />
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

            <div className="flex justify-center gap-2 mt-auto">
              <button className="px-4 py-2 w-full bg-[#D8D8D8] text-gray-600 rounded-lg">
                Exit & Save
              </button>
              <button
                className="px-4 py-2 w-full bg-orange-500 text-white rounded-lg"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="lg:w-1/4 w-full bg-[#EEEEEE] rounded p-4 flex flex-col h-full">
            <h5 className="text-lg font-semibold mb-4">Recent Activity</h5>
            <div className="flex flex-col gap-3 flex-grow">
              <div className="flex items-center bg-white rounded p-3 gap-3">
                <img
                  src={DailyPuzzleIcon}
                  alt="Daily Puzzle"
                  className="w-10 h-10 object-contain"
                />
                <div className="flex flex-col flex-grow">
                  <span className="text-[14px] font-semibold">Daily Puzzle</span>
                  <span className="inline-block mt-1 bg-green-100 text-green-700 text-[12px] px-2 py-[2px] w-20 rounded border border-green-500">
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
                  src={DailyAssessmentIcon}
                  alt="Daily Assessment"
                  className="w-10 h-10 object-contain"
                />
                <div className="flex flex-col flex-grow">
                  <span className="text-[14px] font-semibold">Daily Assessment</span>
                  <span className="inline-block mt-1 bg-green-100 text-green-700 text-[12px] px-2 py-[2px] w-20 rounded border border-green-500">
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
                  <span className="inline-block mt-1 bg-[#FFEFE8] text-[#FF6700] text-[12px] px-2 py-[2px] w-15 rounded border border-[#FF6700]">
                    Resume
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
