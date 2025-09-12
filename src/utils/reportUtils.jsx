import dayjs from "dayjs";
import { getLevel } from "./certificationUtils";

/**
 * Utility functions for report generation and analysis
 */

// Domain descriptions based on main category
export const getDomainDescription = (key, category) => {
  if (category === "iq-test") {
    switch(key){
      case "logical-reasoning": return "Deductive and inductive reasoning, syllogisms, conditional logic.";
      case "numerical-ability": return "Arithmetic, sequences, word problems, quantitative comparisons.";
      case "spatial-reasoning": return "Mental rotation, 2D/3D relationships, pattern assembly.";
      case "verbal-ability": return "Vocabulary, analogies, comprehension, relationships between words.";
      case "memory": return "Short-term and working memory, recall under time constraints.";
      default: return "";
    }
  } else if (category === "driving-licence") {
    switch(key){
      case "perception": return "Ability to perceive and interpret visual information while driving.";
      case "eye-sight": return "Visual acuity and field of vision requirements for safe driving.";
      case "signal-knowledge": return "Understanding of traffic signals, signs, and road markings.";
      case "road-rules": return "Knowledge of traffic laws, right-of-way rules, and regulations.";
      case "safe-driving": return "Practices and behaviors that contribute to safe vehicle operation.";
      default: return "";
    }
  } else if (category === "logic") {
    switch(key){
      case "propositional-logic": return "Understanding of basic logical operators and truth tables.";
      case "predicate-logic": return "Ability to work with quantifiers and more complex logical structures.";
      case "modal-logic": return "Reasoning about possibility, necessity, and other modalities.";
      case "epistemic-logic": return "Logical reasoning about knowledge and belief systems.";
      case "proof-techniques": return "Ability to construct and evaluate logical proofs.";
      default: return "";
    }
  }
  return "";
};

// Generate insights and tips based on domain performance
export const generateInsightsAndTips = (domain, score, category) => {
  const level = getLevel(score);
  const insights = [];
  const tips = [];

  if(score >= 25){
      insights.push("Consistently accurate on advanced items.");
      tips.push("Maintain skills with weekly advanced challenges.");
  } else if(score >= 21){
      insights.push("Strong performance with minor slips on complex items.");
      tips.push("Add timed practice to boost speed under pressure.");
  } else if(score >= 15){
      insights.push("Solid fundamentals; opportunities on multi-step questions.");
      tips.push("Practice mixed-difficulty sets; review error patterns.");
  } else if(score >= 10){
      insights.push("Struggles appeared on layered logic or extended working memory.");
      tips.push("Daily 10–15 min drills; scaffolded difficulty.");
  } else {
      insights.push("Foundational gaps limit consistency.");
      tips.push("Start with basics modules; increase difficulty gradually.");
  }

  // Add category-specific tips
  if (category === "iq-test") {
    switch(domain){
      case "logical-reasoning": tips.push("Try conditional logic puzzles & truth tables."); break;
      case "numerical-ability": tips.push("Focus on fractions/ratios & sequence rules."); break;
      case "spatial-reasoning": tips.push("Practice mental rotation with tangrams/jigsaws."); break;
      case "verbal-ability": tips.push("Do synonym/analogy drills; read short editorials."); break;
      case "memory": tips.push("Use n-back and chunking exercises."); break;
      default: break;
    }
  } else if (category === "driving-licence") {
    switch(domain){
      case "perception": tips.push("Practice identifying hazards in driving simulation videos."); break;
      case "eye-sight": tips.push("Get regular eye check-ups and practice peripheral vision exercises."); break;
      case "signal-knowledge": tips.push("Study the official driver's handbook and take practice tests."); break;
      case "road-rules": tips.push("Review traffic laws regularly and discuss scenarios with experienced drivers."); break;
      case "safe-driving": tips.push("Practice defensive driving techniques and hazard anticipation."); break;
      default: break;
    }
  } else if (category === "logic") {
    switch(domain){
      case "propositional-logic": tips.push("Practice truth tables and logical equivalence proofs."); break;
      case "predicate-logic": tips.push("Work with quantifier exercises and natural deduction."); break;
      case "modal-logic": tips.push("Study possible worlds semantics and practice with modal operators."); break;
      case "epistemic-logic": tips.push("Explore knowledge puzzles and epistemic paradoxes."); break;
      case "proof-techniques": tips.push("Practice different proof methods (direct, indirect, by cases)."); break;
      default: break;
    }
  }

  return { level, insights, tips };
};

// Calculate report statistics
export const calculateReportStats = (scoreData, totalQuestions) => {
  const total = scoreData?.totalScore || 0;
  const accuracy = totalQuestions ? Math.round((total / totalQuestions) * 100) : 0;
  const correctAnswers = totalQuestions ? Math.round(total / 5) : 0;

  return {
    total,
    accuracy,
    correctAnswers
  };
};

// Generate domain scores array
export const generateDomainScores = (scoreData) => {
  if (scoreData?.byCategory) {
    return Object.entries(scoreData.byCategory).map(([key, value]) => ({
      key,
      label: key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      score: value
    }));
  }
  return [];
};

// Generate default domains if no category scores available
export const getDefaultDomains = () => [
  { key: "logical-reasoning", label: "Logical Reasoning" },
  { key: "numerical-ability", label: "Numerical Ability" },
  { key: "spatial-reasoning", label: "Spatial Reasoning" },
  { key: "verbal-ability", label: "Verbal Ability" },
  { key: "memory", label: "Memory" },
];

// Generate radar chart data
export const generateRadarData = (domains, scoreData) => {
  return domains.map(d => ({ 
    subject: d.label, 
    value: scoreData?.byCategory?.[d.key] || 0 
  }));
};

// Sort domains by performance (weakest to strongest)
export const sortDomainsByPerformance = (domains, scoreData) => {
  return [...domains].sort((a,b) => (scoreData?.byCategory?.[a.key] || 0) - (scoreData?.byCategory?.[b.key] || 0));
};

// Generate recommended activities
export const generateRecommendedActivities = (sortedDomains) => {
  const weakest = sortedDomains.slice(0,2);
  const mid = sortedDomains.slice(2,4);
  
  return {
    weakest,
    mid,
    activities: [
      ...weakest.map(w => `Strengthen ${w.label.toLowerCase()} with targeted practice sessions.`),
      ...mid.map(w => `Stretch ${w.label.toLowerCase()} using mixed-difficulty sets and light timing.`)
    ]
  };
};
