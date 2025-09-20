import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import BazzingoLoader from "../Loading/BazzingoLoader";
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
  const unansweredQuestionsRef = useRef([]);
  const [questionTimers, setQuestionTimers] = useState({}); // Track time spent on each question
  const [reviewTimers, setReviewTimers] = useState({}); // Track remaining time for review questions
  const [recentActivityNames, setRecentActivityNames] = useState([]);
  const [autoSubmit, setAutoSubmit] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  // Keep ref in sync with state
  useEffect(() => {
    unansweredQuestionsRef.current = unansweredQuestions;
  }, [unansweredQuestions]);

  
  // Add state for score and total questions
  const [scoreData, setScoreData] = useState({
    score: 0,
    totalQuestions: 0,
    totalScore: 0,
    fullScoreData: null // Add this to store complete score data
  });
  const [isAvailCertification, setIsAvailCertification] = useState(false);
  const [isAvailReport, setIsAvailReport] = useState(false);
  const [assessmentMetadata, setAssessmentMetadata] = useState({
    title: 'Visual Reasoning Questions', // default fallback
    description: 'Test your memory by finding all the matching pairs of cards.' // default fallback
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
          setAssessmentMetadata({
            title: res?.data?.assessment?.title || 'Quick Assessment',
            description: res?.data?.assessment?.description || 'Complete the quick assessment questions.'
          });
        } else {
          const assessmentIdToUse = dynamicAssessmentId || "68b08626058babd20eb52022";
          const res = await getFullAssessment(assessmentIdToUse);
          apiQuestions = res?.data?.questions || res?.questions || [];
          id = res?.data?.assessment?._id || res?.assessment?._id;
          const a = res?.data?.assessment || res?.assessment;
          setIsAvailCertification(Boolean(a?.isAvailCertification));
          setIsAvailReport(Boolean(a?.isAvailReport));
          setAssessmentMetadata({
            title: a?.title || 'Visual Reasoning Assessment',
            description: a?.description || 'Test your cognitive abilities with this assessment.'
          });
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

  const [recentActivities, setRecentActivities] = useState([]);
const [isLoadingActivities, setIsLoadingActivities] = useState(true);
 // Load recent activities for right card
useEffect(() => {
  const loadRecent = async () => {
    try {
      setIsLoadingActivities(true);
      const res = await getRecentDashboardActivity();
      const acts = res?.data?.activities || [];
      
      // Map API data to our expected format with fallbacks
      const mappedActivities = acts.map(activity => ({
        name: activity.name || 'Unknown Activity',
        type: activity.type || 'puzzle',
        status: activity.status || 'in-progress',
        progress: activity.progress || (activity.status === 'completed' ? 100 : 30)
      }));
      
      setRecentActivities(mappedActivities);
    } catch (e) {
      console.error("Failed to load recent activities:", e);
      setRecentActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };
  loadRecent();
}, []);

  /** =========================
      Current Question & Progress
  ========================= */
  const currentQuestion = useMemo(() => {
    if (isReviewPhase && unansweredQuestions.length > 0) {
      // Ensure currentIndex is within bounds
      const safeIndex = Math.min(currentIndex, unansweredQuestions.length - 1);
      return unansweredQuestions[safeIndex]?.question || questions[currentIndex];
    }
    return questions[currentIndex];
  }, [questions, currentIndex, isReviewPhase, unansweredQuestions]);

  const progressPercent = useMemo(() => {
    if (isReviewPhase) {
      const unansweredCount = unansweredQuestionsRef.current.length;
      if (unansweredCount === 0) return 100; // All questions answered
      const safeIndex = Math.min(currentIndex, unansweredCount - 1);
      return Math.min(100, Math.round(((safeIndex + 1) / unansweredCount) * 100));
    }
    return questions.length ? Math.min(100, Math.round(((currentIndex + 1) / questions.length) * 100)) : 0;
  }, [currentIndex, questions.length, unansweredQuestions.length, isReviewPhase]);

  // Get questions to display in left sidebar
  const questionsToDisplay = useMemo(() => {
    return isReviewPhase ? unansweredQuestions.map(item => item.question) : questions;
  }, [isReviewPhase, unansweredQuestions, questions]);

  // Index used for left-panel windowing over questionsToDisplay (must be relative to that array)
  const listWindowIndex = useMemo(() => {
    return currentIndex; // In review and normal phase, questionsToDisplay uses relative indexing
  }, [currentIndex]);

  // Get current index for display
  const displayIndex = useMemo(() => {
    return isReviewPhase ? 
      unansweredQuestions[currentIndex]?.originalIndex ?? currentIndex : 
      currentIndex;
  }, [isReviewPhase, currentIndex, unansweredQuestions]);

  // Handle when a question is answered in review phase - adjust current index if needed
  useEffect(() => {
    if (isReviewPhase && unansweredQuestions.length > 0 && currentQuestion?.id) {
      // If current question is no longer in unanswered list, we need to adjust the index
      const currentQuestionInUnanswered = unansweredQuestions.find(item => item.question.id === currentQuestion.id);
      if (!currentQuestionInUnanswered && currentIndex >= unansweredQuestions.length) {
        // Current question was answered and removed, and we're past the end
        // Go back to the last unanswered question
        const newIndex = Math.max(0, unansweredQuestions.length - 1);
        setCurrentIndex(newIndex);
        console.log(`Question answered and removed from review. Adjusting index to ${newIndex}`);
      }
    }
  }, [unansweredQuestions, isReviewPhase, currentQuestion?.id, currentIndex]);

  /** =========================
      Option Selection
  ========================= */
  const handleOptionSelect = (option, idx) => {
    if (!currentQuestion?.id) return; // Safety check
    
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
    if (hasAdvancedRef.current || !currentQuestion?.id) return; // Safety check
    hasAdvancedRef.current = true;

    let willAddToUnanswered = false;
    let updatedUnansweredQuestions = unansweredQuestions;

    // In review phase, handle advancement explicitly on button click (no auto-advance on select)
    if (isReviewPhase) {
      if (answers[currentQuestion.id] === undefined) {
        // Skipped again: remove permanently
        const pruned = unansweredQuestions.filter(item => item.question.id !== currentQuestion.id);
        setUnansweredQuestions(pruned);
        unansweredQuestionsRef.current = pruned;
        if (pruned.length === 0) { setAutoSubmit(true); return; }
        const nextIndex = Math.min(currentIndex, pruned.length - 1);
        setCurrentIndex(nextIndex);
        setSelectedOption(answers[pruned[nextIndex]?.question.id] ?? null);
        return;
      } else {
        // Answered now: remove from review and go next
        const pruned = unansweredQuestions.filter(item => item.question.id !== currentQuestion.id);
        setUnansweredQuestions(pruned);
        unansweredQuestionsRef.current = pruned;
        if (pruned.length === 0) { setAutoSubmit(true); return; }
        const nextIndex = Math.min(currentIndex, pruned.length - 1);
        setCurrentIndex(nextIndex);
        setSelectedOption(answers[pruned[nextIndex]?.question.id] ?? null);
        return;
      }
    }

    // If user clicks Continue without selecting an option
    if (answers[currentQuestion.id] === undefined) {
      if (isReviewPhase) {
        // In review phase, treat another skip as FINAL: remove from list and move on
        const pruned = unansweredQuestions.filter(item => item.question.id !== currentQuestion.id);
        setUnansweredQuestions(pruned);
        unansweredQuestionsRef.current = pruned;

        // If nothing left, auto-submit
        if (pruned.length === 0) {
          setAutoSubmit(true);
          return;
        }

        // Stay at same index (which now points to the next item) and update selection
        const nextIndex = Math.min(currentIndex, pruned.length - 1);
        setCurrentIndex(nextIndex);
        setSelectedOption(answers[pruned[nextIndex]?.question.id] ?? null);
        return;
      } else {
        // First pass: add to unanswered only if not already queued
        const alreadyQueued = unansweredQuestions.some(u => u.question.id === currentQuestion.id);
        if (!alreadyQueued) {
          willAddToUnanswered = true;
          updatedUnansweredQuestions = [
            ...unansweredQuestions,
            {
              question: currentQuestion,
              index: currentIndex,
              remainingTime: timeLeft, // Save the remaining time
              originalIndex: currentQuestion.originalIndex // Store original index
            }
          ];

          console.log(`Question ${currentQuestion.id} skipped - added to review. Total unanswered: ${updatedUnansweredQuestions.length}`);

          setUnansweredQuestions(updatedUnansweredQuestions);
          unansweredQuestionsRef.current = updatedUnansweredQuestions;

          // Save the remaining time for this question for the review phase
          setReviewTimers(prev => ({
            ...prev,
            [currentQuestion.id]: timeLeft
          }));
        }
      }
    }

    // Check if we've reached the end of regular questions
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(answers[questions[currentIndex + 1]?.id] ?? null);
    } else if (updatedUnansweredQuestions.length > 0 && !isReviewPhase) {
      // Start review phase with unanswered questions
      console.log(`Starting review phase with ${updatedUnansweredQuestions.length} unanswered questions`);
      // De-duplicate by question id to avoid loops
      const seen = new Set();
      const dedup = [];
      for (const item of updatedUnansweredQuestions) {
        if (!seen.has(item.question.id)) {
          seen.add(item.question.id);
          dedup.push(item);
        }
      }
      setUnansweredQuestions(dedup);
      unansweredQuestionsRef.current = dedup;
      setIsReviewPhase(true);
      setCurrentIndex(0);
      setSelectedOption(answers[dedup[0]?.question.id] ?? null);
    } else if (isReviewPhase && currentIndex < updatedUnansweredQuestions.length - 1) {
      // Continue in review phase
      setCurrentIndex((i) => i + 1);
      setSelectedOption(answers[updatedUnansweredQuestions[currentIndex + 1]?.question.id] ?? null);
    } else if (isReviewPhase && currentIndex >= updatedUnansweredQuestions.length - 1) {
      // End of review phase - no more questions to review
      // The submit button will be shown instead of continue
      console.log('Review phase completed - ready for submission');
      // Auto submit when the user skips on the last review question
      setAutoSubmit(true);
      return;
    }
  }, [currentIndex, questions, answers, timeLeft, unansweredQuestions, isReviewPhase, currentQuestion]);

  // (moved below handleAssessmentClick)

  const handleAssessmentClick = useCallback(async () => {
    try {
      if (!assessmentId) return alert("No assessment ID – cannot submit!");
  
      setIsSubmittingScore(true);

      // Build payload with ONLY answered questions (omit -1)
      const answeredPairs = Object.entries(answers)
        .filter(([, idx]) => typeof idx === 'number' && idx > -1)
        .map(([qid, idx]) => ({ questionId: qid, chosenIndex: idx }));

      const payload = {
        type: fromQuickAssessment ? "quick" : "full",
        assessmentId,
        answers: answeredPairs,
      };
  
      const res = await submitAssessment(payload);
      
      // Extract the full score data from response
      const scoreDataFromResponse = res?.data?.score || res?.score || res?.data || {};
      
      // Extract correct totalScore/outOfScore path from API response
      const totalPossibleScore = originalQuestions.reduce((sum, q) => {
        const pts = typeof q.points === 'number' ? q.points : 0;
        return sum + pts;
      }, 0);

      const outOf = (
        scoreDataFromResponse?.outOfScore ??
        scoreDataFromResponse?.outofScore ??
        scoreDataFromResponse?.out_of_score ??
        scoreDataFromResponse?.outOf ??
        scoreDataFromResponse?.outof ??
        scoreDataFromResponse?.out ??
        scoreDataFromResponse?.maxScore ??
        (totalPossibleScore > 0 ? totalPossibleScore : (Array.isArray(originalQuestions) ? originalQuestions.length : 0))
      );

      // Get the actual score value - handle nested response structure
      let actualScore = 0;
      
      // Check if score is nested under assessment type (e.g., "logic", "memory", etc.)
      if (res?.data && typeof res.data === 'object') {
        // Look for assessment type keys that contain score data
        const assessmentTypes = ['logic', 'memory', 'iq', 'visual', 'verbal', 'quantitative'];
        for (const type of assessmentTypes) {
          if (res.data[type] && typeof res.data[type] === 'object') {
            actualScore = res.data[type].totalScore ?? res.data[type].score ?? 0;
            if (actualScore > 0) {
              break;
            }
          }
        }
      }
      
      // Fallback to direct score extraction
      if (actualScore === 0) {
        actualScore = scoreDataFromResponse?.totalScore ?? scoreDataFromResponse?.score ?? 0;
      }
  
      // Get the score ID for fetching detailed results
      const scoreId = scoreDataFromResponse?._id || 
                     (res?.data?.score && res.data.score._id) || 
                     (res?.score && res.score._id);
  
      // Set the complete score data including fullScoreData
      const finalScoreData = {
        score: actualScore,
        totalQuestions: outOf,
        totalScore: actualScore,
        fullScoreData: scoreDataFromResponse,
        scoreId: scoreId // Add scoreId to fetch detailed results
      };
      
      setScoreData(finalScoreData);
      setIsModalOpen(true);
    } catch (err) {
      console.error("❌ Error submitting assessment:", err);
      alert("Submission failed. Check console for details.");
    } finally {
      setIsSubmittingScore(false);
    }
  }, [answers, assessmentId, fromQuickAssessment, isReviewPhase, unansweredQuestions, originalQuestions]);

  // Auto-submit effect (covers timer/skip at last review item and zero unanswered left)
  useEffect(() => {
    if (autoSubmit) {
      setAutoSubmit(false);
      // Submit only answered questions: handled by payload chosenIndex -1
      handleAssessmentClick();
    }
  }, [autoSubmit, handleAssessmentClick]);
  /** =========================
      Timer Logic
  ========================= */
  useEffect(() => {
    if (!questions.length || !currentQuestion?.id) return;

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
          
          // If time runs out and no answer was selected
          if (currentQuestion?.id && answers[currentQuestion.id] === undefined) {
            if (!isReviewPhase) {
              // Only queue during first pass; never add during review
            const newUnansweredQuestions = [
              ...unansweredQuestionsRef.current,
              {
                question: currentQuestion,
                index: currentIndex,
                remainingTime: 0, // Time ran out
                originalIndex: currentQuestion.originalIndex
              }
            ];
            setUnansweredQuestions(newUnansweredQuestions);
            unansweredQuestionsRef.current = newUnansweredQuestions;
            } else {
              // In review, treat timeout as final skip: remove and possibly auto-submit
              const pruned = unansweredQuestionsRef.current.filter(item => item.question.id !== currentQuestion.id);
              setUnansweredQuestions(pruned);
              unansweredQuestionsRef.current = pruned;
              if (pruned.length === 0) {
                setAutoSubmit(true);
              }
            }
          }
          
          handleContinue();
          return 60;
        }
        return prev - 1;
      });
      
      // Update the question timer for tracking time spent
      if (currentQuestion?.id) {
        setQuestionTimers(prev => ({
          ...prev,
          [currentQuestion.id]: prev[currentQuestion.id] - 1
        }));
      }
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
        <div className="mx-auto px-4 lg:px-12 py-8">
          <div className="p-6">
            <BazzingoLoader message="Preparing your assessment..." />
          </div>
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
      {isReviewPhase ? 'Review Questions' : assessmentMetadata.title}
    </h2>
              <span className="bg-black text-white text-sm px-3 py-1 rounded">
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
              </span>
            </div>

            <p className="text-[13px] mb-4">
    {isReviewPhase 
      ? 'Review your unanswered questions.' 
      : assessmentMetadata.description}
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
                      .slice(Math.floor(listWindowIndex / 5) * 5, Math.floor(listWindowIndex / 5) * 5 + 5)
                      .map((q, index) => {
                        const globalIndex = Math.floor(listWindowIndex / 5) * 5 + index;
                        const isUnansweredInReview = isReviewPhase && answers[q.id] === undefined;
                        return (
                          <div
                            key={q.id}
                            className={`p-3 rounded text-[13px] cursor-default border ${
                              globalIndex === currentIndex
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
                  .slice(Math.floor(listWindowIndex / 5) * 5, Math.floor(listWindowIndex / 5) * 5 + 5)
                  .map((q, index) => {
                    const globalIndex = Math.floor(listWindowIndex / 5) * 5 + index;
                    const isUnansweredInReview = isReviewPhase && answers[q.id] === undefined;
                    return (
                      <div
                        key={q.id}
                        className={`lg:p-1 xl:p-3 rounded lg:text-[12px] xl:text-[13px] cursor-default border ${
                          globalIndex === currentIndex
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
                  {isReviewPhase ? 'Review ' : ''}Question {isReviewPhase ? Math.min(currentIndex + 1, unansweredQuestionsRef.current.length) : currentIndex + 1} of{' '}
                  {isReviewPhase ? unansweredQuestionsRef.current.length : questions.length}
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
                  {/* <p className="text-[15px] mb-4">{currentQuestion.text}</p> */}
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
              <button className={`px-4 py-2 w-full rounded-lg ${isSubmittingScore ? 'bg-[#D8D8D8] text-gray-400 cursor-not-allowed' : 'bg-[#D8D8D8] text-gray-600'}`} disabled={isSubmittingScore}>Exit & Save</button>
              <button
                className={`px-4 py-2 w-full rounded-lg text-white ${isSubmittingScore ? 'bg-orange-300 cursor-wait' : 'bg-orange-500 hover:bg-orange-600'}`}
                disabled={isSubmittingScore}
                onClick={() => {
                  const currentUnansweredCount = unansweredQuestionsRef.current.length;
                  
                  if (isReviewPhase && currentIndex >= currentUnansweredCount - 1) {
                    // End of review phase - submit assessment
                    handleAssessmentClick();
                  } else if (!isReviewPhase && currentIndex === questions.length - 1 && currentUnansweredCount === 0) {
                    // End of regular phase with no unanswered questions - submit assessment
                    handleAssessmentClick();
                  } else {
                    // Continue to next question
                    handleContinue();
                  }
                }}
              >
                {isSubmittingScore
                  ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    ((isReviewPhase && currentIndex >= unansweredQuestionsRef.current.length - 1) || 
                     (!isReviewPhase && currentIndex === questions.length - 1 && unansweredQuestionsRef.current.length === 0))
                      ? 'Submit'
                      : 'Continue'
                  )}
              </button>
            </div>
          </div>

          {/* RIGHT CARD */}
{/* RIGHT CARD - Updated with dynamic data handling */}
<div className="lg:w-1/4 w-full lg:bg-[#EEEEEE] rounded p-4 flex flex-col h-full">
  <h5 className="text-lg font-semibold mb-4">Recent Activity</h5>

  {/* Desktop */}
  <div className="hidden lg:block">
    {isLoadingActivities ? (
      <div className="flex justify-center items-center h-40">
        <BazzingoLoader message="Loading activities..." size="small" />
      </div>
    ) : recentActivities.length > 0 ? (
      <div className="flex flex-col gap-3 flex-grow">
        {recentActivities.slice(0, 3).map((activity, index) => (
          <div key={index} className="flex items-center bg-white rounded p-3 gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              activity.type === 'puzzle' ? 'bg-gray-100' : 
              activity.type === 'assessment' ? 'bg-blue-50' : 'bg-purple-50'
            }`}>
              <img 
                src={
                  activity.type === 'puzzle' ? DailyPuzzleIcon :
                  activity.type === 'assessment' ? DailyAssessmentIcon : MazeScapeIcon
                } 
                alt={activity.name} 
                className="w-8 h-8 object-contain" 
              />
            </div>
            <div className="flex flex-col flex-grow">
              <span className="text-[14px] font-semibold">{activity.name}</span>
              <span className={`inline-block mt-1 rounded-lg border-2 px-2 py-1 font-bold text-[12px] leading-none w-20 ${
                activity.status === 'completed' ? 
                'border-[#118C24] bg-gradient-to-b from-[#E2F8E0] via-[#CDEDC8] to-[#DAF3D5] text-[#118C24]' :
                // 'border-[#FF6700] bg-[#FFEFE8] text-[#FF6700]'
                'border-[#118C24] bg-gradient-to-b from-[#E2F8E0] via-[#CDEDC8] to-[#DAF3D5] text-[#118C24]' 
                
              }`}>
                {activity.status === 'completed' ? 'Completed' : 'Completed'}
              </span>
            </div>
            {activity.status === 'completed' && (
              <img src={CheckIcon} alt="Completed" className="w-5 h-5 object-contain" />
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500">
        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-center">No recent activities found.</p>
        <p className="text-sm mt-1">Complete an activity to see it here.</p>
      </div>
    )}
  </div>

  {/* Mobile */}
  <div className="lg:hidden block">
    {isLoadingActivities ? (
      <div className="flex justify-center items-center h-40">
        <BazzingoLoader message="Loading activities..." size="small" />
      </div>
    ) : recentActivities.length > 0 ? (
      <div className="space-y-4 mt-4">
        {recentActivities.slice(0, 3).map((activity, idx) => (
          <div
            key={idx}
            className="bg-[#F2F5F6] rounded-xl px-3 py-4 flex items-center justify-between gap-3"
          >
            {/* Icon + Label */}
            <div className="flex items-center gap-2 min-w-[100px]">
              <div className={`w-10 h-10 ${
                activity.type === 'puzzle' ? 'bg-gray-100' : 
                activity.type === 'assessment' ? 'bg-blue-50' : 'bg-purple-50'
              } rounded-lg flex items-center justify-center shrink-0`}>
                <img 
                  src={
                    activity.type === 'puzzle' ? DailyPuzzleIcon :
                    activity.type === 'assessment' ? DailyAssessmentIcon : MazeScapeIcon
                  } 
                  alt={activity.name} 
                  className="w-8 h-8" 
                />
              </div>
              <span className="text-[12px] font-medium text-gray-900 leading-tight max-w-[30px]">
                {activity.name}
              </span>
            </div>

            {/* Progress */}
            <div className="flex-1 mx-2 max-w-[190px]">
              <ProgressBar percentage={activity.progress} />
            </div>

            {/* Status */}
            <div className="flex items-center justify-end min-w-[20px]">
              {activity.status === 'completed' ? (
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
    ) : (
      <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-4 text-center">
        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No recent activities found.</p>
        <p className="text-sm mt-1">Complete an activity to see it here.</p>
      </div>
    )}
  </div>
</div>
          {/* END RIGHT CARD */}
          {fromQuickAssessment && (
            <MiniAssesmentCompletionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} score={scoreData.score} 
            totalQuestions={scoreData.totalQuestions} />
          )}
          {dynamicAssessmentId && (
          <AssessmentCompletionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            score={scoreData.score} 
            totalQuestions={scoreData.totalQuestions}
            scoreId={scoreData.scoreId} 
            assessmentId={assessmentId}
            fullScoreData={scoreData.fullScoreData}
            isAvailCertification={isAvailCertification}
            isAvailReport={isAvailReport}
          />
          )}
        </div>
      </div>
    </>
  );
}