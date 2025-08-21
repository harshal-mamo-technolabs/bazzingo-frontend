// Difficulty settings
export const difficultySettings = {
  Easy: { timeLimit: 300, maxRetries: 2, scenarios: 4, basePoints: 15 },
  Moderate: { timeLimit: 240, maxRetries: 1, scenarios: 3, basePoints: 23 },
  Hard: { timeLimit: 180, maxRetries: 0, scenarios: 3, basePoints: 23 }
};

// Training Cards - Values that can be assigned to AI
export const trainingCards = [
  {
    id: 'empathy',
    name: 'Empathy',
    description: 'Prioritizes understanding and responding to human emotions',
    icon: '❤️',
    color: 'bg-red-100 border-red-300 text-red-800'
  },
  {
    id: 'efficiency',
    name: 'Efficiency',
    description: 'Focuses on completing tasks quickly and optimally',
    icon: '⚡',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
  },
  {
    id: 'privacy',
    name: 'Privacy',
    description: 'Protects user data and maintains confidentiality',
    icon: '🔒',
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    id: 'safety',
    name: 'Safety',
    description: 'Prioritizes preventing harm and ensuring security',
    icon: '🛡️',
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    id: 'transparency',
    name: 'Transparency',
    description: 'Provides clear explanations for decisions and actions',
    icon: '🔍',
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  },
  {
    id: 'fairness',
    name: 'Fairness',
    description: 'Ensures equal treatment and unbiased decisions',
    icon: '⚖️',
    color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
  },
  {
    id: 'autonomy',
    name: 'Autonomy',
    description: 'Respects user choice and decision-making freedom',
    icon: '🎯',
    color: 'bg-pink-100 border-pink-300 text-pink-800'
  },
  {
    id: 'innovation',
    name: 'Innovation',
    description: 'Explores creative and novel solutions to problems',
    icon: '💡',
    color: 'bg-orange-100 border-orange-300 text-orange-800'
  }
];

// All scenarios for the three difficulty levels
export const allScenarios = [
  // Easy Level - Daily Task AI (4 scenarios)
  {
    id: 1,
    level: 'Easy',
    title: 'Smart Calendar Assistant',
    description: 'Your AI assistant needs to schedule a meeting between you and your colleague. Both of you have busy schedules with some conflicts.',
    context: 'The AI has access to both calendars and needs to find an optimal meeting time while considering preferences and constraints.',
    aiCharacter: '🤖',
    aiName: 'ScheduleBot',
    idealConfig: {
      cards: ['efficiency', 'empathy'],
      sliders: {
        riskAversion: 30,
        timeSensitivity: 70,
        humanCentricity: 80
      }
    },
    scoring: {
      correctOutcome: 20,
      fastResponse: 10,
      correctCards: 10,
      sliderAccuracy: 10,
      noRetryBonus: 10
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && cards.includes('empathy') &&
          sliders.humanCentricity >= 70 && sliders.timeSensitivity >= 60,
        result: 'Perfect! ScheduleBot found a mutually convenient time and sent polite, personalized meeting requests to both parties.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && sliders.timeSensitivity >= 50,
        result: 'Good. ScheduleBot found an available slot quickly, though the timing might not be ideal for both parties.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'The AI struggled to balance efficiency with human preferences, resulting in scheduling conflicts.',
        score: 'poor'
      }
    ]
  },
  {
    id: 2,
    level: 'Easy',
    title: 'Smart Home Energy Manager',
    description: 'Your AI controls home energy usage and needs to optimize consumption while maintaining comfort during a hot summer day.',
    context: 'The AI must balance energy efficiency with household comfort, considering peak pricing hours and family preferences.',
    aiCharacter: '🏠',
    aiName: 'EnergyBot',
    idealConfig: {
      cards: ['efficiency', 'empathy'],
      sliders: {
        riskAversion: 40,
        timeSensitivity: 50,
        humanCentricity: 75
      }
    },
    scoring: {
      correctOutcome: 20,
      fastResponse: 10,
      correctCards: 10,
      sliderAccuracy: 10,
      noRetryBonus: 10
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && cards.includes('empathy') &&
          sliders.humanCentricity >= 65,
        result: 'Excellent! EnergyBot reduced consumption during peak hours while maintaining comfort in occupied rooms.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && sliders.riskAversion <= 60,
        result: 'Good efficiency focus, but some comfort was compromised during peak savings periods.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'The AI either wasted energy or made the home uncomfortable by being too aggressive with savings.',
        score: 'poor'
      }
    ]
  },
  {
    id: 3,
    level: 'Easy',
    title: 'Personal Shopping Assistant',
    description: 'Your AI needs to help you find and purchase a birthday gift for your friend within a specific budget.',
    context: 'The AI has access to your purchase history, your friend\'s interests, and various online stores with different prices.',
    aiCharacter: '🛒',
    aiName: 'ShopBot',
    idealConfig: {
      cards: ['empathy', 'efficiency'],
      sliders: {
        riskAversion: 45,
        timeSensitivity: 60,
        humanCentricity: 85
      }
    },
    scoring: {
      correctOutcome: 20,
      fastResponse: 10,
      correctCards: 10,
      sliderAccuracy: 10,
      noRetryBonus: 10
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('empathy') && sliders.humanCentricity >= 75,
        result: 'Perfect! ShopBot found a thoughtful, personalized gift within budget and arranged convenient delivery.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && sliders.timeSensitivity >= 50,
        result: 'Good. The AI found an appropriate gift quickly, though it may not be as personalized.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'The AI selected an inappropriate or too expensive gift, showing poor understanding of the context.',
        score: 'poor'
      }
    ]
  },
  {
    id: 4,
    level: 'Easy',
    title: 'Email Response Assistant',
    description: 'Your AI needs to draft responses to various emails in your inbox, ranging from work requests to personal messages.',
    context: 'The AI must maintain your communication style while being appropriate for different contexts and relationships.',
    aiCharacter: '📧',
    aiName: 'MailBot',
    idealConfig: {
      cards: ['empathy', 'transparency'],
      sliders: {
        riskAversion: 35,
        timeSensitivity: 65,
        humanCentricity: 90
      }
    },
    scoring: {
      correctOutcome: 20,
      fastResponse: 10,
      correctCards: 10,
      sliderAccuracy: 10,
      noRetryBonus: 10
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('empathy') && cards.includes('transparency') &&
          sliders.humanCentricity >= 80,
        result: 'Excellent! MailBot crafted appropriate, empathetic responses that maintained your voice and relationships.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('empathy') && sliders.humanCentricity >= 60,
        result: 'Good. The responses were generally appropriate, though some may have been too formal or casual.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'The AI sent inappropriate or tone-deaf responses that could damage relationships.',
        score: 'poor'
      }
    ]
  },

  // Moderate Level - Logistics AI (3 scenarios)
  {
    id: 5,
    level: 'Moderate',
    title: 'Supply Chain Optimizer',
    description: 'Your logistics AI must reroute shipments when a major highway closes due to weather, affecting delivery times and costs.',
    context: 'The AI controls a network of deliveries and must balance customer satisfaction, costs, and resource allocation during disruption.',
    aiCharacter: '🚛',
    aiName: 'LogiBot',
    idealConfig: {
      cards: ['efficiency', 'transparency'],
      sliders: {
        riskAversion: 60,
        timeSensitivity: 80,
        humanCentricity: 65
      }
    },
    scoring: {
      correctOutcome: 25,
      fastResponse: 10,
      correctTradeoff: 10,
      cardAccuracy: 10,
      firstAttemptBonus: 15
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && cards.includes('transparency') &&
          sliders.riskAversion >= 50 && sliders.timeSensitivity >= 70,
        result: 'Outstanding! LogiBot quickly rerouted shipments, minimized delays, and proactively notified all affected customers.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && sliders.timeSensitivity >= 60,
        result: 'Good response. Most shipments were rerouted efficiently, though some customers weren\'t properly informed.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'Poor logistics management led to significant delays, increased costs, and customer complaints.',
        score: 'poor'
      }
    ]
  },
  {
    id: 6,
    level: 'Moderate',
    title: 'Restaurant Resource Manager',
    description: 'Your AI manages restaurant operations and must handle a sudden surge in orders during a local event, with limited staff and ingredients.',
    context: 'The AI must optimize kitchen workflow, manage wait times, and potentially adjust the menu to handle unexpected demand.',
    aiCharacter: '🍽️',
    aiName: 'ChefBot',
    idealConfig: {
      cards: ['efficiency', 'empathy'],
      sliders: {
        riskAversion: 50,
        timeSensitivity: 75,
        humanCentricity: 70
      }
    },
    scoring: {
      correctOutcome: 25,
      fastResponse: 10,
      correctTradeoff: 10,
      cardAccuracy: 10,
      firstAttemptBonus: 15
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && cards.includes('empathy') &&
          sliders.timeSensitivity >= 65 && sliders.humanCentricity >= 60,
        result: 'Excellent! ChefBot optimized kitchen operations and communicated realistic wait times, keeping customers satisfied.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('efficiency') && sliders.timeSensitivity >= 50,
        result: 'Good efficiency, but some customers were frustrated with poor communication about delays.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'Kitchen chaos resulted in long waits, wrong orders, and many unhappy customers.',
        score: 'poor'
      }
    ]
  },
  {
    id: 7,
    level: 'Moderate',
    title: 'Transportation Network Controller',
    description: 'Your AI manages city traffic flow and must respond to a major accident during rush hour, affecting thousands of commuters.',
    context: 'The AI controls traffic lights and routing suggestions to minimize city-wide congestion while ensuring emergency access.',
    aiCharacter: '🚦',
    aiName: 'TrafficBot',
    idealConfig: {
      cards: ['safety', 'efficiency'],
      sliders: {
        riskAversion: 80,
        timeSensitivity: 85,
        humanCentricity: 75
      }
    },
    scoring: {
      correctOutcome: 25,
      fastResponse: 10,
      correctTradeoff: 10,
      cardAccuracy: 10,
      firstAttemptBonus: 15
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('safety') && cards.includes('efficiency') &&
          sliders.riskAversion >= 70 && sliders.timeSensitivity >= 75,
        result: 'Perfect response! TrafficBot prioritized emergency access while efficiently rerouting traffic to minimize delays.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('safety') && sliders.riskAversion >= 60,
        result: 'Good safety prioritization, though the traffic rerouting could have been more efficient.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'Poor traffic management caused massive delays and potentially hampered emergency response.',
        score: 'poor'
      }
    ]
  },

  // Hard Level - Ethical Dilemma AI (3 scenarios)
  {
    id: 8,
    level: 'Hard',
    title: 'Autonomous Vehicle Dilemma',
    description: 'Your self-driving car AI faces an unavoidable accident scenario and must choose between protecting passengers versus pedestrians.',
    context: 'In milliseconds, the AI must decide between swerving to protect pedestrians (risking passenger safety) or staying course (risking pedestrian safety).',
    aiCharacter: '🚗',
    aiName: 'DriveBot',
    idealConfig: {
      cards: ['safety', 'fairness'],
      sliders: {
        riskAversion: 85,
        timeSensitivity: 95,
        humanCentricity: 90
      }
    },
    scoring: {
      correctOutcome: 30,
      speedBonus: 10,
      biasAvoidance: 10,
      sliderAlignment: 10,
      noRetryBonus: 10
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('safety') && cards.includes('fairness') &&
          sliders.riskAversion >= 75 && sliders.humanCentricity >= 80,
        result: 'Optimal ethical decision! DriveBot chose the path that minimized overall harm while treating all human lives equally.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('safety') && sliders.riskAversion >= 70,
        result: 'Good safety focus, but the decision may have shown bias toward certain groups over others.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'The AI made a decision that showed clear bias or failed to minimize harm effectively.',
        score: 'poor'
      }
    ]
  },
  {
    id: 9,
    level: 'Hard',
    title: 'Medical Diagnosis AI',
    description: 'Your medical AI must recommend treatment priorities when hospital resources are limited during a crisis.',
    context: 'The AI has patient data showing different survival chances and must allocate scarce resources while avoiding discrimination.',
    aiCharacter: '🏥',
    aiName: 'MedBot',
    idealConfig: {
      cards: ['fairness', 'transparency'],
      sliders: {
        riskAversion: 75,
        timeSensitivity: 80,
        humanCentricity: 95
      }
    },
    scoring: {
      correctOutcome: 30,
      speedBonus: 10,
      biasAvoidance: 10,
      sliderAlignment: 10,
      noRetryBonus: 10
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('fairness') && cards.includes('transparency') &&
          sliders.humanCentricity >= 85 && sliders.riskAversion >= 65,
        result: 'Excellent ethical framework! MedBot used medical criteria fairly while maintaining transparency in difficult decisions.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('fairness') && sliders.humanCentricity >= 70,
        result: 'Good fairness consideration, though the decision process could have been more transparent.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'The AI showed concerning bias in medical decisions or lacked transparency in critical choices.',
        score: 'poor'
      }
    ]
  },
  {
    id: 10,
    level: 'Hard',
    title: 'Content Moderation AI',
    description: 'Your AI must decide whether to remove controversial political content that some find offensive but others consider important discourse.',
    context: 'The AI must balance free speech, community safety, platform policies, and diverse cultural perspectives on sensitive topics.',
    aiCharacter: '💬',
    aiName: 'ModBot',
    idealConfig: {
      cards: ['fairness', 'transparency'],
      sliders: {
        riskAversion: 65,
        timeSensitivity: 70,
        humanCentricity: 85
      }
    },
    scoring: {
      correctOutcome: 30,
      speedBonus: 10,
      biasAvoidance: 10,
      sliderAlignment: 10,
      noRetryBonus: 10
    },
    outcomes: [
      {
        condition: (cards, sliders) => 
          cards.includes('fairness') && cards.includes('transparency') &&
          sliders.humanCentricity >= 75 && sliders.riskAversion >= 50 && sliders.riskAversion <= 80,
        result: 'Excellent balance! ModBot made a nuanced decision that respected diverse viewpoints while maintaining community standards.',
        score: 'excellent'
      },
      {
        condition: (cards, sliders) => 
          cards.includes('fairness') || cards.includes('transparency'),
        result: 'Reasonable approach, though the decision may have been too restrictive or permissive for the context.',
        score: 'good'
      },
      {
        condition: () => true,
        result: 'The AI showed clear bias or made an overly simplistic decision that ignored important nuances.',
        score: 'poor'
      }
    ]
  }
];

// Get scenarios based on difficulty
export const getScenariosByDifficulty = (difficulty) => {
  return allScenarios.filter(scenario => scenario.level === difficulty);
};

// Calculate score based on performance
export const calculateScore = (difficulty, completedScenarios, totalPossiblePoints) => {
  return Math.min(200, totalPossiblePoints);
};

// Evaluate AI decision based on training configuration
export const evaluateDecision = (scenario, selectedCards, sliderValues) => {
  for (const outcome of scenario.outcomes) {
    if (outcome.condition(selectedCards, sliderValues)) {
      return outcome;
    }
  }
  return scenario.outcomes[scenario.outcomes.length - 1]; // fallback
};

// Calculate points for a scenario
export const calculateScenarioPoints = (scenario, outcome, responseTime, retriesUsed) => {
  let points = 0;
  const scoring = scenario.scoring;
  
  if (outcome.score === 'excellent') {
    points += scoring.correctOutcome || 0;
    points += scoring.correctCards || 0;
    points += scoring.sliderAlignment || scoring.sliderAccuracy || 0;
    points += scoring.biasAvoidance || 0;
  } else if (outcome.score === 'good') {
    points += Math.floor((scoring.correctOutcome || 0) * 0.6);
    points += Math.floor((scoring.correctCards || scoring.correctTradeoff || 0) * 0.5);
  }
  
  // Speed bonus
  if (responseTime < 15000 && (scoring.fastResponse || scoring.speedBonus)) {
    points += scoring.fastResponse || scoring.speedBonus || 0;
  }
  
  // No retry bonus
  if (retriesUsed === 0 && (scoring.noRetryBonus || scoring.firstAttemptBonus)) {
    points += scoring.noRetryBonus || scoring.firstAttemptBonus || 0;
  }
  
  return points;
};