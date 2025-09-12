import dayjs from "dayjs";

/**
 * Utility functions for certification and scoring calculations
 */

// Helper functions for score calculations
export const getLevel = (score) => {
  if(score >= 25) return "High";
  if(score >= 21) return "Above Average";
  if(score >= 15) return "Average";
  if(score >= 10) return "Below Average";
  return "Needs Improvement";
};

export const bandFromTotal = (total) => {
  if(total >= 135) return "Exceptional";
  if(total >= 115) return "High";
  if(total >= 95) return "Average";
  if(total >= 75) return "Below Average";
  return "Developing";
};

// Scale domain scores for certificate display
export const scaleDomain = (s) => Math.round(80 + (Math.max(0, Math.min(30, s)) / 30) * 50);

// Estimate IQ from total score
export const estimateIQ = (total) => Math.round(70 + (Math.max(0, Math.min(150, total)) / 150) * 60);

// Normal CDF for percentile calculation
export const normalCdf = (x) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
};

// Calculate certificate values
export const calculateCertificateValues = (scoreData, assessmentId) => {
  const total = scoreData?.totalScore || 0;
  const dateStr = scoreData?.date ? dayjs(scoreData.date).format("DD MMM, YYYY") : dayjs().format("DD MMM, YYYY");
  const iq = estimateIQ(total);
  const percentile = Math.max(1, Math.min(99, Math.round(normalCdf((iq - 100) / 15) * 100)));
  const ciLow = Math.max(55, iq - 7);
  const ciHigh = Math.min(145, iq + 7);

  // Calculate domain scores
  const reasoning = scaleDomain(scoreData?.byCategory?.["logical-reasoning"] || scoreData?.byCategory?.["propositional-logic"] || scoreData?.byCategory?.["perception"] || 0);
  const verbal = scaleDomain(scoreData?.byCategory?.["verbal-ability"] || scoreData?.byCategory?.["epistemic-logic"] || scoreData?.byCategory?.["signal-knowledge"] || 0);
  const memory = scaleDomain(scoreData?.byCategory?.["memory"] || scoreData?.byCategory?.["predicate-logic"] || scoreData?.byCategory?.["road-rules"] || 0);
  const speed = scaleDomain(
    ((scoreData?.byCategory?.["numerical-ability"] || scoreData?.byCategory?.["modal-logic"] || scoreData?.byCategory?.["eye-sight"] || 0) + 
    (scoreData?.byCategory?.["spatial-reasoning"] || scoreData?.byCategory?.["proof-techniques"] || scoreData?.byCategory?.["safe-driving"] || 0)) / 2
  );

  return {
    total,
    dateStr,
    iq,
    percentile,
    ciLow,
    ciHigh,
    reasoning,
    verbal,
    memory,
    speed
  };
};

// Generate certificate ID
export const generateCertificateId = (assessmentId) => {
  return `BZG-${dayjs().format('YYYY')}-${assessmentId?.slice(-6) || 'XXXXXX'}`;
};

// Generate report URL
export const generateReportUrl = (scoreId, assessmentId) => {
  return `${window.location.origin}/report/${scoreId || assessmentId}`;
};
