import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import AssessmentCompletionModal from './AssessmentCompletionModal.jsx';
import MiniAssesmentCompletionModal from './MiniAssesmentCompletionModal.jsx';
import {
  DailyPuzzleIcon,
  DailyAssessmentIcon,
  MazeScapeIcon,
  CheckIcon,
  ProgressBrainIcon,
  TaskCompleteIcon,
} from '../../../public/assessment';
import { getQuickAssessment, getFullAssessment, submitAssessment, getRecentDashboardActivity } from '../../services/dashbaordService.js';

const ACTIVITIES = [
  {
    icon: DailyPuzzleIcon,
    alt: 'Daily Puzzle',
    label: 'Daily Puzzle',
    complete: '36/36',
    pct: 80,
    statusType: 'completed',
    iconBg: 'bg-gray-100',
  },
  {
    icon: DailyAssessmentIcon,
    alt: 'Daily Assessment',
    label: 'Daily Assessment',
    complete: '20/20',
    pct: 30,
    statusType: 'completed',
    iconBg: 'bg-gray-100',
  },
  {
    icon: MazeScapeIcon,
    alt: 'Mage Scape',
    label: 'Mage Scape',
    complete: '4/36',
    pct: 10,
    statusType: 'resume',
    iconBg: 'bg-blue-50',
  },
];

/** =========================
   Small, memoized components
   ========================= */
const ProgressBar = memo(function ProgressBar({ percentage }) {
  return (
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
});

/** =========================
   Main Component
   ========================= */
export default function VisualReasoningStaticAssessment() {
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const location = useLocation();
  const fromQuickAssessment = location.state?.fromQuickAssessment || false;
  const hasAdvancedRef = useRef(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: chosenIndex }
  const timerRef = useRef(null);
  const dynamicAssessmentId = location.state?.assessmentId;
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [isReviewPhase, setIsReviewPhase] = useState(false);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [questionTimers, setQuestionTimers] = useState({}); // Track time spent on each question
  const [reviewTimers, setReviewTimers] = useState({}); // Track remaining time for review questions
  const [recentActivityNames, setRecentActivityNames] = useState([]);
  
  // Add state for score and total questions
  const [scoreData, setScoreData] = useState({
    score: 0,
    totalQuestions: 0,
    totalScore: 0
  });

  /** =========================
      Fetch Assessment
  ========================= */
  useEffect(() => {
    async function fetchAssessment() {
      try {
        let apiQuestions = [];
        let id = null;

        if (fromQuickAssessment) {
          const res = await getQuickAssessment();
          apiQuestions = res?.data?.questions || [];
          id = res?.data?.assessment?._id;
        } else {
          const assessmentIdToUse = dynamicAssessmentId || "68b08626058babd20eb52022";
          const res = await getFullAssessment(assessmentIdToUse);
          apiQuestions = res?.data?.questions || res?.questions || [];
          id = res?.data?.assessment?._id || res?.assessment?._id;
        }

        if (!apiQuestions.length) {
          throw new Error("No questions received from API");
        }

        setAssessmentId(id);

        const mapped = apiQuestions.map((q, idx) => ({
          id: q._id,
          title: q.questionType === 'text' ? `Q${idx + 1} - ${q.question}` : `Q${idx + 1}`,
          text: q.questionType === 'text' ? q.question : '',
          image: q.questionType === 'image' ? q.question : null,
          options: q.options || [],
          optionsType: q.optionsType,
          answerIndex: q.answerIndex,
          points: q.points,
          questionType: q.questionType, // Add questionType to identify image questions
          originalIndex: idx, // Store original index for reference
        }));

        setQuestions(mapped);
        setOriginalQuestions(mapped);

        // Initialize timers for all questions
        const initialTimers = {};
        mapped.forEach(q => {
          initialTimers[q.id] = 60; // Start with 60 seconds for each question
        });
        setQuestionTimers(initialTimers);

      } catch (err) {
        console.error("Failed to load assessment:", err);
        alert("Failed to load assessment. Please try again.");
        setQuestions([]);
      }
    }

    fetchAssessment();
  }, [fromQuickAssessment, dynamicAssessmentId]);

  // Load recent activity names for right card (desktop), keep static icons and completed badges
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await getRecentDashboardActivity();
        const acts = res?.data?.activities || [];
        setRecentActivityNames(acts.map(a => a.name));
      } catch (e) {
        setRecentActivityNames([]);
      }
    };
    loadRecent();
  }, []);

  /** =========================
      Current Question & Progress
  ========================= */
  const currentQuestion = useMemo(() => {
    if (isReviewPhase && unansweredQuestions.length > 0) {
      return unansweredQuestions[currentIndex]?.question || questions[currentIndex];
    }
    return questions[currentIndex];
  }, [questions, currentIndex, isReviewPhase, unansweredQuestions]);

  const progressPercent = useMemo(() => {
    if (isReviewPhase) {
      return unansweredQuestions.length ? Math.min(100, Math.round(((currentIndex + 1) / unansweredQuestions.length) * 100)) : 0;
    }
    return questions.length ? Math.min(100, Math.round(((currentIndex + 1) / questions.length) * 100)) : 0;
  }, [currentIndex, questions.length, unansweredQuestions.length, isReviewPhase]);

  // Get questions to display in left sidebar
  const questionsToDisplay = useMemo(() => {
    return isReviewPhase ? unansweredQuestions.map(item => item.question) : questions;
  }, [isReviewPhase, unansweredQuestions, questions]);

  // Get current index for display
  const displayIndex = useMemo(() => {
    return isReviewPhase ? 
      unansweredQuestions[currentIndex]?.originalIndex ?? currentIndex : 
      currentIndex;
  }, [isReviewPhase, currentIndex, unansweredQuestions]);

  /** =========================
      Option Selection
  ========================= */
  const handleOptionSelect = (option, idx) => {
    setSelectedOption(option);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: idx,
    }));
  };

  /** =========================
      Continue / Submit
  ========================= */
  const handleContinue = useCallback(() => {
    if (hasAdvancedRef.current) return;
    hasAdvancedRef.current = true;

    // If user clicks Continue without selecting an option, save the question for review
    if (answers[currentQuestion.id] === undefined) {
      setUnansweredQuestions(prevUnanswered => [
        ...prevUnanswered,
        {
          question: currentQuestion,
          index: currentIndex,
          remainingTime: timeLeft, // Save the remaining time
          originalIndex: currentQuestion.originalIndex // Store original index
        }
      ]);
      
      // Save the remaining time for this question for the review phase
      setReviewTimers(prev => ({
        ...prev,
        [currentQuestion.id]: timeLeft
      }));
    }

    // Check if we've reached the end of regular questions
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(answers[questions[currentIndex + 1]?.id] ?? null);
    } else if (unansweredQuestions.length > 0 && !isReviewPhase) {
      // Start review phase with unanswered questions
      setIsReviewPhase(true);
      setCurrentIndex(0);
      setSelectedOption(answers[unansweredQuestions[0]?.question.id] ?? null);
    } else if (isReviewPhase && currentIndex < unansweredQuestions.length - 1) {
      // Continue in review phase
      setCurrentIndex((i) => i + 1);
      setSelectedOption(answers[unansweredQuestions[currentIndex + 1]?.question.id] ?? null);
    }
  }, [currentIndex, questions, answers, timeLeft, unansweredQuestions, isReviewPhase, currentQuestion]);

  const handleAssessmentClick = useCallback(async () => {
    try {
      if (!assessmentId) return alert("No assessment ID – cannot submit!");
  
      // Combine answers from both regular and review phases
      const allQuestions = isReviewPhase ? 
        unansweredQuestions.map(item => item.question) : 
        originalQuestions;
      
      const payload = {
        type: fromQuickAssessment ? "quick" : "full",
        assessmentId,
        answers: allQuestions.map((q) => ({
          questionId: q.id,
          chosenIndex: answers[q.id] ?? -1,
        })),
      };
  
      console.log("📤 Submitting assessment payload:", JSON.stringify(payload, null, 2));
      const res = await submitAssessment(payload);
      console.log("✅ Submission response:", res);
      
      // Extract correct totalScore path from API response
      const scoreDataFromResponse = {
        score: res?.data?.score?.totalScore ?? res?.data?.totalScore ?? 0,
        totalQuestions: allQuestions.length,
      };
      
      console.log("📊 Score data being set:", scoreDataFromResponse);
      setScoreData(scoreDataFromResponse);
      setIsModalOpen(true);
    } catch (err) {
      console.error("❌ Error submitting assessment:", err);
      alert("Submission failed. Check console for details.");
    }
  }, [answers, assessmentId, fromQuickAssessment, isReviewPhase, unansweredQuestions, originalQuestions]);

  /** =========================
      Timer Logic
  ========================= */
  useEffect(() => {
    if (!questions.length || !currentQuestion) return;

    // Set initial time for the question
    let initialTime = 60;
    
    // If we're in review phase and this question has a saved timer, use that
    if (isReviewPhase && reviewTimers[currentQuestion.id] !== undefined) {
      initialTime = reviewTimers[currentQuestion.id];
    }
    
    setTimeLeft(initialTime);
    hasAdvancedRef.current = false;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          
          // If time runs out and no answer was selected, add to unanswered questions
          if (answers[currentQuestion.id] === undefined) {
            setUnansweredQuestions(prevUnanswered => [
              ...prevUnanswered,
              {
                question: currentQuestion,
                index: currentIndex,
                remainingTime: 0, // Time ran out
                originalIndex: currentQuestion.originalIndex
              }
            ]);
          }
          
          handleContinue();
          return 60;
        }
        return prev - 1;
      });
      
      // Update the question timer for tracking time spent
      setQuestionTimers(prev => ({
        ...prev,
        [currentQuestion.id]: prev[currentQuestion.id] - 1
      }));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion, currentIndex, questions.length, isReviewPhase, reviewTimers]);

  /** =========================
      Sidebar Question Chunks
  ========================= */
  const chunkedQuestions = useMemo(() => {
    const chunks = [];
    const questionsToChunk = isReviewPhase ? 
      unansweredQuestions.map(item => item.question) : 
      questions;
    
    for (let i = 0; i < questionsToChunk.length; i += 5) {
      chunks.push(questionsToChunk.slice(i, i + 5));
    }
    return chunks;
  }, [questions, unansweredQuestions, isReviewPhase]);

  if (!questions.length) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen text-lg font-semibold">
          Loading assessment...
        </div>
      </>
    );
  }

  /** =========================
      Render
  ========================= */
  return (
    <>
      <Header />
      <div className="mx-auto px-4 lg:px-12 py-4 lg:py-7" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[580px]">
          {/* LEFT CARD - UPDATED for review phase */}
          <div className="lg:w-1/4 w-full bg-[#EEEEEE] rounded p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                {isReviewPhase ? 'Review Questions' : 'Visual Reasoning Questions'}
              </h2>
              <span className="bg-black text-white text-sm px-3 py-1 rounded">
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
              </span>
            </div>

            <p className="text-[13px] mb-4">
              {isReviewPhase 
                ? 'Review your unanswered questions.' 
                : 'Test your memory by finding all the matching pairs of cards.'}
            </p>

            <div className="flex-grow flex flex-col">
              {/* Mobile/Tablet view - UPDATED for review phase */}
              <div className="block lg:hidden">
                <div className="p-3 rounded text-[13px] cursor-default border mb-2 bg-[#FFE2D9] border-[#FF2738]">
                  {currentQuestion.image ? 
                    `Q${displayIndex + 1} - Look at the image and solve question` : 
                    currentQuestion.title}
                </div>

                <button
                  onClick={() => setShowAllQuestions((s) => !s)}
                  className="text-sm mt-4 flex items-center gap-5 font-semibold"
                >
                  {isReviewPhase ? 'Review Questions' : 'More Questions'}
                  <svg
                    className={`w-4 h-4 transform transition-transform ${showAllQuestions ? "rotate-180" : "rotate-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAllQuestions && (
                  <div className="mt-2 flex flex-col gap-2">
                    {questionsToDisplay
                      .slice(Math.floor(displayIndex / 5) * 5, Math.floor(displayIndex / 5) * 5 + 5)
                      .map((q, index) => {
                        const globalIndex = Math.floor(displayIndex / 5) * 5 + index;
                        const isUnansweredInReview = isReviewPhase && answers[q.id] === undefined;
                        return (
                          <div
                            key={q.id}
                            className={`p-3 rounded text-[13px] cursor-default border ${
                              globalIndex === displayIndex
                                ? "bg-[#FFE2D9] border-[#FF2738]"
                                : isUnansweredInReview
                                ? "bg-[#FFF3CD] border-[#FFC107]"
                                : "bg-white border-transparent"
                            }`}
                          >
                            {q.image ? `Q${globalIndex + 1} - Look at the image and solve question` : q.title}
                            {isUnansweredInReview && (
                              <span className="ml-2 text-xs text-yellow-600">(Unanswered)</span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Desktop view - UPDATED for review phase */}
              <div className="hidden lg:flex flex-col gap-2">
                {questionsToDisplay
                  .slice(Math.floor(displayIndex / 5) * 5, Math.floor(displayIndex / 5) * 5 + 5)
                  .map((q, index) => {
                    const globalIndex = Math.floor(displayIndex / 5) * 5 + index;
                    const isUnansweredInReview = isReviewPhase && answers[q.id] === undefined;
                    return (
                      <div
                        key={q.id}
                        className={`lg:p-1 xl:p-3 rounded lg:text-[12px] xl:text-[13px] cursor-default border ${
                          globalIndex === displayIndex
                            ? "bg-[#FFE2D9] border-[#FF2738]"
                            : isUnansweredInReview
                            ? "bg-[#FFF3CD] border-[#FFC107]"
                            : "bg-white border-transparent"
                        }`}
                      >
                        {q.image ? `Q${globalIndex + 1} - Look at the image and solve question` : q.title}
                        {isUnansweredInReview && (
                          <span className="ml-2 text-xs text-yellow-600">(Unanswered)</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* MIDDLE CARD - UPDATED progress display for review phase */}
          <div className="lg:w-2/4 w-full bg-white p-4 flex flex-col h-full">
            {/* Progress bar */}
            <div className="w-full mb-6">
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-visible">
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #F4C3B4 0%, #FF6C40 100%)',
                  }}
                />
                <div
                  className="absolute top-1/2 flex items-center justify-center"
                  style={{ left: `calc(${progressPercent}% - 20px)`, transform: 'translateY(-50%)' }}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FF5727] flex items-center justify-center border-4 border-[#FFD2C2] shadow-lg">
                    <img src={ProgressBrainIcon} alt="Progress brain" className="w-6 h-6 object-contain" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[15px] font-semibold">
                  {isReviewPhase ? 'Review ' : ''}Question {currentIndex + 1} of{' '}
                  {isReviewPhase ? unansweredQuestions.length : questions.length}
                </span>
                <span className="text-[15px] font-semibold">{progressPercent}%</span>
              </div>
            </div>

            {/* Question + Options */}
            <div className="border border-gray-200 rounded p-4 mb-6 flex flex-col flex-grow">
              {currentQuestion.image ? (
                <>
                  <h5 className="text-base mb-2 font-semibold">Q{displayIndex + 1} - Solve the question by seeing the image</h5>
                  <img src={currentQuestion.image} alt="question" className="w-full h-auto rounded mb-4" />
                </>
              ) : (
                <>
                  <h5 className="text-base mb-2 font-semibold">{currentQuestion.title}</h5>
                  <p className="text-[15px] mb-4">{currentQuestion.text}</p>
                </>
              )}

              {/* Options */}
              <div className="flex flex-col gap-2 mb-6">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex justify-between items-center p-2 border rounded cursor-pointer ${
                      answers[currentQuestion.id] === idx ? 'border-orange-400' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        checked={answers[currentQuestion.id] === idx}
                        onChange={() => handleOptionSelect(option, idx)}
                        className="h-4 w-4 text-orange-300 focus:ring-orange-300 accent-orange-300"
                      />
                      {currentQuestion.optionsType === 'image' ? (
                        <img src={option} alt={`option-${idx}`} className="ml-2 w-20 h-20 object-contain rounded" />
                      ) : (
                        <span className="ml-2 text-[15px]">{option}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse lg:flex-row justify-center gap-2 mt-auto">
              <button className="px-4 py-2 w-full bg-[#D8D8D8] text-gray-600 rounded-lg">Exit & Save</button>
              <button
                className="px-4 py-2 w-full bg-orange-500 text-white rounded-lg"
                onClick={() => {
                  if (isReviewPhase && currentIndex === unansweredQuestions.length - 1) {
                    handleAssessmentClick();
                  } else if (!isReviewPhase && currentIndex === questions.length - 1 && unansweredQuestions.length === 0) {
                    handleAssessmentClick();
                  } else {
                    handleContinue();
                  }
                }}
              >
                {(isReviewPhase && currentIndex === unansweredQuestions.length - 1) || 
                 (!isReviewPhase && currentIndex === questions.length - 1 && unansweredQuestions.length === 0)
                  ? 'Submit'
                  : 'Continue'}
              </button>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="lg:w-1/4 w-full lg:bg-[#EEEEEE] rounded p-4 flex flex-col h-full">
            <h5 className="text-lg font-semibold mb-4">Recent Activity</h5>

            {/* Desktop */}
            <div className="hidden lg:block">
              <div className="flex flex-col gap-3 flex-grow">
                <div className="flex items-center bg-white rounded p-3 gap-3">
                  <img src={DailyPuzzleIcon} alt="Daily Puzzle" className="w-10 h-10 object-contain" />
                  <div className="flex flex-col flex-grow">
                    <span className="text-[14px] font-semibold">{recentActivityNames[0] || 'Daily Puzzle'}</span>
                    <span className="inline-block mt-1 rounded-lg border-2 border-[#118C24]
                                  bg-gradient-to-b from-[#E2F8E0] via-[#CDEDC8] to-[#DAF3D5]
                                  px-2 py-1 text-[#118C24] font-bold text-[12px] leading-none w-20">
                    Completed
                  </span>
                  </div>
                  <img src={CheckIcon} alt="Completed" className="w-5 h-5 object-contain" />
                </div>

                <div className="flex items-center bg-white rounded p-3 gap-3">
                  <img src={DailyAssessmentIcon} alt="Daily Assessment" className="w-10 h-10 object-contain" />
                  <div className="flex flex-col flex-grow">
                    <span className="text-[14px] font-semibold">{recentActivityNames[1] || 'Daily Assessment'}</span>
                    <span className="inline-block mt-1 rounded-lg border-2 border-[#118C24]
                                  bg-gradient-to-b from-[#E2F8E0] via-[#CDEDC8] to-[#DAF3D5]
                                  px-2 py-1 text-[#118C24] font-bold text-[12px] leading-none w-20">
                    Completed
                  </span>
                  </div>
                  <img src={CheckIcon} alt="Completed" className="w-5 h-5 object-contain" />
                </div>

                <div className="flex items-center bg-white rounded p-3 gap-3">
                  <img src={MazeScapeIcon} alt="Mage Scape" className="w-10 h-10 object-contain bg-blue-200 rounded p-1" />
                  <div className="flex flex-col flex-grow">
                    <span className="text-[14px] font-semibold">{recentActivityNames[2] || 'Mage Scape'}</span>
                    <span
                        className="bg-[#FFEFE8] text-[#FF6700] inline-block mt-1 rounded-lg border-2
                               px-2 py-1 font-bold text-[12px] leading-none w-15 border-[#FF6700]"
                    >
                    Resume
                  </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden block">
              <div className="space-y-4 mt-4">
                {ACTIVITIES.map(({ icon, alt, label, pct, statusType, iconBg }, idx) => (
                    <div
                        key={`${label}-${idx}`}
                        className="bg-[#F2F5F6] rounded-xl px-3 py-4 flex items-center justify-between gap-3"
                    >
                      {/* Icon + Label */}
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                          <img src={icon} alt={alt} className="w-10 h-10" />
                        </div>
                        <span className="text-[12px] font-medium text-gray-900 leading-tight max-w-[30px]">{label}</span>
                      </div>

                      {/* Progress */}
                      <div className="flex-1 mx-2 max-w-[190px]">
                        <ProgressBar percentage={pct} />
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-end min-w-[20px]">
                        {statusType === 'completed' ? (
                            <div className="flex items-center space-x-1 text-green-600 text-xs font-medium">
                              <img src={TaskCompleteIcon} alt="Completed" className="w-4 h-4" />
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
          {/* END RIGHT CARD */}
          {fromQuickAssessment && (
            <MiniAssesmentCompletionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} score={scoreData.score} 
            totalQuestions={scoreData.totalQuestions} />
          )}
          {dynamicAssessmentId && (
          <AssessmentCompletionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} score={scoreData.score} 
          totalQuestions={scoreData.totalQuestions} />
          )}
        </div>
      </div>
    </>
  );
}