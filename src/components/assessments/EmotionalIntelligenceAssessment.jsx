import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TimerOff, ListChecks, Undo2, Trophy, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import Header from '../Header';
import BazzingoLoader from '../Loading/BazzingoLoader';
import TranslatedText from '../TranslatedText.jsx';
import EmotionalIntelligenceReport from '../Report/EmotionalIntelligenceReport/EmotionalIntelligenceReport.jsx';
import { A4_WIDTH_PX } from '../Report/AdhdReport/parts.jsx';
import { snapshotAdhdReportSection } from '../../utils/adhdReportPdfExport.js';
import {
  getEmotionalIntelligenceAssessment,
  submitEmotionalIntelligenceAssessment,
  getEmotionalIntelligenceReport,
} from '../../services/dashbaordService.js';

const SCALE_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'];
const DEFAULT_SCORES = [0, 1, 2, 3, 4];

function buildOptionRows(question) {
  if (!question || typeof question !== 'object') return [];
  const isReverse = Boolean(question.isReverseScored);
  const raw =
    Array.isArray(question.optionScores) && question.optionScores.length >= 5
      ? question.optionScores.slice(0, 5)
      : DEFAULT_SCORES;
  const orderedLabels = isReverse ? [...SCALE_LABELS].reverse() : SCALE_LABELS;
  return orderedLabels.map((label, i) => ({
    label,
    score: raw[i] !== undefined ? raw[i] : i,
  }));
}

function pickDisplayTotalScore(scoreDoc) {
  if (!scoreDoc || typeof scoreDoc !== 'object') return null;
  const keys = ['totalScore', 'score', 'rawTotal', 'sumScore', 'combinedScore'];
  for (const k of keys) {
    const v = scoreDoc[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return null;
}

function formatCategoryLabel(key) {
  if (!key || typeof key !== 'string') return String(key);
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function dayjsLikeNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export default function EmotionalIntelligenceAssessment() {
  const location = useLocation();
  const navigate = useNavigate();
  const assessmentIdFromRoute = location.state?.assessmentId;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentDescription, setAssessmentDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completion, setCompletion] = useState(null);

  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [reportApiData, setReportApiData] = useState(null);
  const reportContainerRef = useRef(null);

  useEffect(() => {
    if (!assessmentIdFromRoute) {
      navigate('/assessments', { replace: true });
    }
  }, [assessmentIdFromRoute, navigate]);

  useEffect(() => {
    async function load() {
      if (!assessmentIdFromRoute) return;
      setLoading(true);
      setLoadError(null);
      try {
        const res = await getEmotionalIntelligenceAssessment(assessmentIdFromRoute);
        const data = res?.data ?? res;
        const a = data?.assessment;
        const qs = Array.isArray(data?.questions) ? data.questions : [];
        setAssessmentId(a?._id || assessmentIdFromRoute);
        setAssessmentTitle(a?.title || 'Emotional Intelligence Assessment');
        setAssessmentDescription(a?.description || '');
        setCompletion(null);
        setQuestions(qs);
        setAnswers({});
        setCurrentIndex(0);
      } catch (e) {
        console.error(e);
        setLoadError(e?.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assessmentIdFromRoute]);

  const currentQuestion = questions[currentIndex];
  const optionRows = useMemo(
    () => (currentQuestion ? buildOptionRows(currentQuestion) : []),
    [currentQuestion],
  );

  const answeredForCurrent =
    currentQuestion && typeof answers[currentQuestion._id] === 'number';

  const allQuestionsAnswered =
    questions.length > 0 &&
    questions.every((q) => typeof answers[q._id] === 'number');

  const progressPercent = questions.length
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  const handleSelectScore = (questionId, score) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleContinue = useCallback(() => {
    if (!currentQuestion || typeof answers[currentQuestion._id] !== 'number') return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, currentQuestion, questions.length, answers]);

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleDownloadReport = useCallback(async () => {
    if (!assessmentId || isDownloadingReport) return;
    setIsDownloadingReport(true);
    try {
      const res = await getEmotionalIntelligenceReport(assessmentId);
      const apiData = res?.data ?? res;
      if (!apiData || typeof apiData !== 'object') {
        throw new Error('Empty report payload');
      }
      setReportApiData(apiData);

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 450));

      const node = reportContainerRef.current;
      if (!node) throw new Error('Report not rendered');

      const dataUrl = await snapshotAdhdReportSection(node, A4_WIDTH_PX);

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const pdfWidth = 210;
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const scaledHeight = (img.height * contentWidth) / img.width;
      const pdfHeight = scaledHeight + margin * 2;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight] });
      pdf.addImage(dataUrl, 'PNG', margin, margin, contentWidth, scaledHeight);

      const u = apiData?.userInfo;
      const fname = `Emotional-Intelligence-Report-${
        u?.firstName ? `${u.firstName}-` : ''
      }${dayjsLikeNow()}.pdf`;
      pdf.save(fname);
    } catch (err) {
      console.error('Emotional Intelligence report download failed:', err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Could not generate the report. Please try again.',
      );
    } finally {
      setIsDownloadingReport(false);
    }
  }, [assessmentId, isDownloadingReport]);

  const handleSubmit = useCallback(async () => {
    if (!assessmentId || !allQuestionsAnswered) return;
    setIsSubmitting(true);
    try {
      for (const q of questions) {
        if (q.subCategory == null || String(q.subCategory).trim() === '') {
          alert(
            'This assessment is missing category data for a question. Please reload and try again.',
          );
          setIsSubmitting(false);
          return;
        }
      }

      const submitType = questions.length > 10 ? 'full' : 'quick';

      const answersPayload = questions.map((q) => ({
        subCategory: String(q.subCategory).trim(),
        selectedOptionValue: answers[q._id],
        isReversed: Boolean(q.isReverseScored),
      }));

      const payload = {
        assessmentId,
        type: submitType,
        answers: answersPayload,
      };

      const res = await submitEmotionalIntelligenceAssessment(payload);
      const data = res?.data ?? res;
      const scoreDoc = data?.score ?? null;
      const byCategoryScores =
        data?.byCategoryScores && typeof data.byCategoryScores === 'object'
          ? data.byCategoryScores
          : {};
      const returnedSubmitType = data?.submitType ?? submitType;

      setCompletion({
        scoreDoc,
        byCategoryScores,
        submitType: returnedSubmitType,
      });
    } catch (err) {
      console.error('Emotional Intelligence submit failed:', err);
      const msg =
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Submission failed. Please try again.';
      alert(typeof msg === 'string' ? msg : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [assessmentId, allQuestionsAnswered, answers, questions]);

  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;

  if (!assessmentIdFromRoute) {
    return null;
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="mx-auto px-4 lg:px-12 py-8" style={{ fontFamily: 'Roboto, sans-serif' }}>
          <BazzingoLoader message={<TranslatedText text="Loading assessment..." />} />
        </div>
      </>
    );
  }

  if (completion) {
    const { scoreDoc, byCategoryScores, submitType } = completion;
    const primaryScore = pickDisplayTotalScore(scoreDoc);
    const categoryEntries = Object.entries(byCategoryScores || {}).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return (
      <>
        <Header />
        <div
          className="mx-auto max-w-md px-4 py-8 lg:py-12"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <div className="rounded-2xl border border-teal-100 bg-white shadow-[0_12px_40px_-12px_rgba(13,148,136,0.22)] overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-8 text-white text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Trophy className="h-9 w-9" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="text-sm font-medium uppercase tracking-wider text-white/90 mb-1">
                <TranslatedText text="Assessment complete" />
              </p>
              <h1 className="text-2xl font-bold leading-tight">
                <TranslatedText text={assessmentTitle} />
              </h1>
              <p className="mt-2 text-sm text-white/90">
                <TranslatedText
                  text={
                    submitType === 'full'
                      ? 'Full assessment submitted'
                      : 'Quick assessment submitted'
                  }
                />
              </p>
            </div>

            <div className="px-6 py-6 text-center border-b border-gray-100">
              {primaryScore !== null ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                    <TranslatedText text="Your score" />
                  </p>
                  <p className="text-5xl font-bold tabular-nums text-teal-600">{primaryScore}</p>
                </>
              ) : (
                <p className="text-gray-700 text-[15px]">
                  <TranslatedText text="Thank you. Your responses have been saved successfully." />
                </p>
              )}
            </div>

            {categoryEntries.length > 0 && (
              <div className="px-6 py-5 bg-gray-50/80">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                  <TranslatedText text="Scores by area" />
                </p>
                <ul className="space-y-2 text-left">
                  {categoryEntries.map(([key, value]) => (
                    <li
                      key={key}
                      className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 border border-gray-100 text-sm"
                    >
                      <span className="text-gray-800 font-medium">
                        {formatCategoryLabel(key)}
                      </span>
                      <span className="tabular-nums font-semibold text-teal-600">
                        {typeof value === 'number' && Number.isFinite(value) ? value : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="px-6 py-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleDownloadReport}
                disabled={isDownloadingReport}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-teal-600 bg-white px-4 py-3.5 text-base font-semibold text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDownloadingReport ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-teal-600/60 border-t-transparent rounded-full animate-spin" />
                    <TranslatedText text="Preparing report..." />
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5 shrink-0" aria-hidden />
                    <TranslatedText text="Download detailed report" />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/assessments')}
                className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-base font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                <TranslatedText text="Back to assessments" />
              </button>
            </div>
          </div>
        </div>

        {reportApiData ? (
          <div
            aria-hidden
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              zIndex: -1,
              opacity: 0,
              pointerEvents: 'none',
              width: A4_WIDTH_PX,
              transform: 'translate(-200vw, 0)',
            }}
          >
            <EmotionalIntelligenceReport ref={reportContainerRef} apiData={reportApiData} />
          </div>
        ) : null}
      </>
    );
  }

  if (loadError || !questions.length) {
    return (
      <>
        <Header />
        <div
          className="mx-auto max-w-lg px-4 py-12 text-center text-gray-700"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          <p className="mb-4">{loadError || 'No questions available.'}</p>
          <button
            type="button"
            onClick={() => navigate('/assessments')}
            className="rounded-lg bg-teal-600 px-4 py-2 text-white"
          >
            <TranslatedText text="Back to assessments" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        className="mx-auto max-w-3xl px-4 lg:px-8 py-6 lg:py-10"
        style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
      >
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/assessments')}
            className="text-sm text-teal-700 hover:underline mb-2"
          >
            ← <TranslatedText text="Back to assessments" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            <TranslatedText text={assessmentTitle} />
          </h1>
          {assessmentDescription ? (
            <p className="text-gray-600 text-sm">{assessmentDescription}</p>
          ) : null}

          {currentIndex === 0 && (
            <div
              className="mt-5 mb-1 rounded-2xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-50 via-emerald-50/90 to-teal-50/70 shadow-[0_8px_30px_-8px_rgba(13,148,136,0.28)] overflow-hidden"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col sm:flex-row sm:items-stretch gap-0">
                <div className="sm:w-1.5 shrink-0 bg-gradient-to-b from-teal-600 to-teal-400" aria-hidden />
                <div className="flex-1 px-4 py-4 sm:px-5 sm:py-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md">
                      <ListChecks className="h-6 w-6" strokeWidth={2} aria-hidden />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-800 mb-0.5">
                        <TranslatedText text="How this assessment works" />
                      </p>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                        <TranslatedText text="Take your time — every answer counts" />
                      </h2>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm sm:text-[15px] text-gray-800">
                    <li className="flex gap-3 items-start">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-teal-700 shadow-sm border border-teal-100">
                        <TimerOff className="h-4 w-4" aria-hidden />
                      </span>
                      <span>
                        <strong className="font-semibold text-gray-900">
                          <TranslatedText text="No time limit." />
                        </strong>{' '}
                        <TranslatedText text="There is no clock — answer thoughtfully and at your own pace." />
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-teal-700 shadow-sm border border-teal-100">
                        <ListChecks className="h-4 w-4" aria-hidden />
                      </span>
                      <span>
                        <strong className="font-semibold text-gray-900">
                          <TranslatedText text="No skipping." />
                        </strong>{' '}
                        <TranslatedText text="You must choose an option on each question before you can continue." />
                      </span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80 text-teal-700 shadow-sm border border-teal-100">
                        <Undo2 className="h-4 w-4" aria-hidden />
                      </span>
                      <span>
                        <strong className="font-semibold text-gray-900">
                          <TranslatedText text="Change your mind?" />
                        </strong>{' '}
                        <TranslatedText text="Use Back anytime to revisit earlier questions and update your answers." />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full mb-6">
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-teal-200 to-teal-600"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-700">
            <span>
              <TranslatedText
                text={`Question ${currentIndex + 1} of ${questions.length}`}
              />
            </span>
            <span>{progressPercent}%</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 lg:p-8">
          <p className="text-lg font-medium text-gray-900 mb-6 leading-snug">
            <TranslatedText text={currentQuestion?.question || ''} />
          </p>

          <div className="flex flex-col gap-3 mb-8">
            {optionRows.map((row, idx) => {
              const qid = currentQuestion._id;
              const selected = answers[qid] === row.score;
              return (
                <label
                  key={`${qid}-${idx}-${row.score}`}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selected
                      ? 'border-teal-600 bg-teal-50/60'
                      : 'border-gray-200 hover:border-teal-200'
                  }`}
                >
                  <input
                    type="radio"
                    name={`ei-q-${qid}`}
                    checked={selected}
                    onChange={() => handleSelectScore(qid, row.score)}
                    className="h-4 w-4 accent-teal-600 shrink-0"
                  />
                  <span className="text-base text-gray-800">
                    <TranslatedText text={row.label} />
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between">
            <button
              type="button"
              onClick={() => navigate('/assessments')}
              className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <TranslatedText text="Exit" />
            </button>
            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto w-full sm:w-auto">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-3 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
                >
                  <TranslatedText text="Back" />
                </button>
              )}
              {!isLastQuestion && (
                <button
                  type="button"
                  disabled={!answeredForCurrent || isSubmitting}
                  onClick={handleContinue}
                  className="px-4 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <TranslatedText text="Continue" />
                </button>
              )}
              {isLastQuestion && (
                <button
                  type="button"
                  disabled={
                    !answeredForCurrent || !allQuestionsAnswered || isSubmitting
                  }
                  onClick={handleSubmit}
                  className="px-4 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <TranslatedText text="Submitting..." />
                  ) : (
                    <TranslatedText text="Submit assessment" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
