// Difficulty settings
export const difficultySettings = {
  Easy: { timeLimit: 120, lives: 5, hints: 3, questionCount: 8, pointsPerQuestion: 25, penalty: 10 },
  Moderate: { timeLimit: 120, lives: 4, hints: 2, questionCount: 5, pointsPerQuestion: 40, penalty: 20 },
  Hard: { timeLimit: 120, lives: 3, hints: 1, questionCount: 4, pointsPerQuestion: 50, penalty: 25 }
};

// All traveler scenarios data
export const allScenarios = [
  // Easy Level Scenarios (0-7) - 8 questions
  {
    id: 1,
    traveler: {
      name: "Marco",
      emoji: "👨‍💼",
      statement: "I'm returning from a business trip.",
      clues: {
        flag: { discovered: false, evidence: "🇮🇹 Small Italian flag pin on jacket", suspicious: false, country: "Italy" },
        food: { discovered: false, evidence: "🍝 Pasta sauce stain on shirt", suspicious: false, country: "Italy" },
        clothing: { discovered: false, evidence: "👔 Italian designer suit label", suspicious: false, country: "Italy" },
        currency: { discovered: false, evidence: "💶 Euro coins in pocket", suspicious: false, country: "Italy" }
      }
    },
    countries: ["Italy", "Spain", "France"],
    correctAnswer: "Italy",
    explanation: "Marco has Italian flag pin, pasta sauce, designer suit from Italy, and Euro currency."
  },
  {
    id: 2,
    traveler: {
      name: "Sakura",
      emoji: "👩‍🎨",
      statement: "I was visiting cultural sites.",
      clues: {
        flag: { discovered: false, evidence: "🇯🇵 Japanese flag keychain", suspicious: false, country: "Japan" },
        food: { discovered: false, evidence: "🍱 Bento box container", suspicious: false, country: "Japan" },
        clothing: { discovered: false, evidence: "👘 Traditional kimono fabric", suspicious: false, country: "Japan" },
        currency: { discovered: false, evidence: "💴 Japanese Yen notes", suspicious: false, country: "Japan" }
      }
    },
    countries: ["Japan", "South Korea", "China"],
    correctAnswer: "Japan",
    explanation: "Sakura has Japanese flag keychain, bento box, kimono fabric, and Yen currency."
  },
  {
    id: 3,
    traveler: {
      name: "Pierre",
      emoji: "👨‍🍳",
      statement: "I'm a chef returning home.",
      clues: {
        flag: { discovered: false, evidence: "🇫🇷 French tricolor on chef's hat", suspicious: false, country: "France" },
        food: { discovered: false, evidence: "🥖 Fresh baguette crumbs", suspicious: false, country: "France" },
        clothing: { discovered: false, evidence: "👨‍🍳 Paris culinary school badge", suspicious: false, country: "France" },
        currency: { discovered: false, evidence: "💶 Euro banknotes", suspicious: false, country: "France" }
      }
    },
    countries: ["France", "Belgium", "Switzerland"],
    correctAnswer: "France",
    explanation: "Pierre has French flag on hat, baguette crumbs, Paris culinary badge, and Euro currency."
  },
  {
    id: 4,
    traveler: {
      name: "Hans",
      emoji: "👨‍🔧",
      statement: "I work in automotive industry.",
      clues: {
        flag: { discovered: false, evidence: "🇩🇪 German flag patch on uniform", suspicious: false, country: "Germany" },
        food: { discovered: false, evidence: "🍺 Pretzel crumbs on hands", suspicious: false, country: "Germany" },
        clothing: { discovered: false, evidence: "👷‍♂️ BMW work uniform", suspicious: false, country: "Germany" },
        currency: { discovered: false, evidence: "💶 Euro coins and bills", suspicious: false, country: "Germany" }
      }
    },
    countries: ["Germany", "Austria", "Netherlands"],
    correctAnswer: "Germany",
    explanation: "Hans has German flag patch, pretzel crumbs, BMW uniform, and Euro currency."
  },
  {
    id: 5,
    traveler: {
      name: "Rosa",
      emoji: "💃",
      statement: "I'm a dance instructor.",
      clues: {
        flag: { discovered: false, evidence: "🇪🇸 Spanish flag on dance shoes", suspicious: false, country: "Spain" },
        food: { discovered: false, evidence: "🥘 Paella rice grains on skirt", suspicious: false, country: "Spain" },
        clothing: { discovered: false, evidence: "💃 Flamenco dress", suspicious: false, country: "Spain" },
        currency: { discovered: false, evidence: "💶 Euro currency", suspicious: false, country: "Spain" }
      }
    },
    countries: ["Spain", "Portugal", "Mexico"],
    correctAnswer: "Spain",
    explanation: "Rosa has Spanish flag shoes, paella rice, flamenco dress, and Euro currency."
  },
  {
    id: 6,
    traveler: {
      name: "Ahmed",
      emoji: "👨‍🏫",
      statement: "I'm a history teacher.",
      clues: {
        flag: { discovered: false, evidence: "🇪🇬 Egyptian flag pin", suspicious: false, country: "Egypt" },
        food: { discovered: false, evidence: "🧆 Falafel wrapper", suspicious: false, country: "Egypt" },
        clothing: { discovered: false, evidence: "👳‍♂️ Traditional Egyptian cotton shirt", suspicious: false, country: "Egypt" },
        currency: { discovered: false, evidence: "💷 Egyptian Pound notes", suspicious: false, country: "Egypt" }
      }
    },
    countries: ["Egypt", "Morocco", "Tunisia"],
    correctAnswer: "Egypt",
    explanation: "Ahmed has Egyptian flag pin, falafel wrapper, traditional shirt, and Egyptian Pounds."
  },
  {
    id: 7,
    traveler: {
      name: "Raj",
      emoji: "👨‍💻",
      statement: "I work in tech support.",
      clues: {
        flag: { discovered: false, evidence: "🇮🇳 Indian flag sticker on laptop", suspicious: false, country: "India" },
        food: { discovered: false, evidence: "🍛 Curry spice on fingers", suspicious: false, country: "India" },
        clothing: { discovered: false, evidence: "👕 Mumbai IT company shirt", suspicious: false, country: "India" },
        currency: { discovered: false, evidence: "💴 Indian Rupee notes", suspicious: false, country: "India" }
      }
    },
    countries: ["India", "Pakistan", "Bangladesh"],
    correctAnswer: "India",
    explanation: "Raj has Indian flag on laptop, curry spice, Mumbai company shirt, and Indian Rupees."
  },
  {
    id: 8,
    traveler: {
      name: "Emma",
      emoji: "👩‍⚕️",
      statement: "I'm a medical researcher.",
      clues: {
        flag: { discovered: false, evidence: "🇬🇧 Union Jack medical badge", suspicious: false, country: "United Kingdom" },
        food: { discovered: false, evidence: "☕ Tea stain on coat", suspicious: false, country: "United Kingdom" },
        clothing: { discovered: false, evidence: "🥼 NHS hospital ID badge", suspicious: false, country: "United Kingdom" },
        currency: { discovered: false, evidence: "💷 British Pound Sterling", suspicious: false, country: "United Kingdom" }
      }
    },
    countries: ["United Kingdom", "Ireland", "Australia"],
    correctAnswer: "United Kingdom",
    explanation: "Emma has Union Jack badge, tea stain, NHS ID, and British Pounds."
  },
  // Moderate Level Scenarios (8-12) - 5 questions
  {
    id: 9,
    traveler: {
      name: "Klaus",
      emoji: "🎿",
      statement: "I'm returning from a ski vacation.",
      clues: {
        flag: { discovered: false, evidence: "🇨🇭 Swiss cross on ski jacket", suspicious: false, country: "Switzerland" },
        food: { discovered: false, evidence: "🧀 Cheese fondue residue", suspicious: false, country: "Switzerland" },
        clothing: { discovered: false, evidence: "⌚ Swiss watch", suspicious: false, country: "Switzerland" },
        currency: { discovered: false, evidence: "💰 Swiss Franc coins", suspicious: false, country: "Switzerland" }
      }
    },
    countries: ["Switzerland", "Austria", "Slovenia"],
    correctAnswer: "Switzerland",
    explanation: "Klaus has Swiss cross, fondue residue, Swiss watch, and Swiss Francs."
  },
  {
    id: 10,
    traveler: {
      name: "Olga",
      emoji: "🎭",
      statement: "I'm a theater performer.",
      clues: {
        flag: { discovered: false, evidence: "🇷🇺 Russian flag on costume case", suspicious: false, country: "Russia" },
        food: { discovered: false, evidence: "🥟 Dumpling crumbs", suspicious: false, country: "Russia" },
        clothing: { discovered: false, evidence: "🎭 Bolshoi Theater program", suspicious: false, country: "Russia" },
        currency: { discovered: false, evidence: "💴 Russian Ruble banknotes", suspicious: false, country: "Russia" }
      }
    },
    countries: ["Russia", "Ukraine", "Belarus"],
    correctAnswer: "Russia",
    explanation: "Olga has Russian flag, dumpling crumbs, Bolshoi program, and Russian Rubles."
  },
  {
    id: 11,
    traveler: {
      name: "Yuki",
      emoji: "🥋",
      statement: "I'm a martial arts instructor.",
      clues: {
        flag: { discovered: false, evidence: "🇰🇷 South Korean flag on belt", suspicious: false, country: "South Korea" },
        food: { discovered: false, evidence: "🍜 Kimchi smell on clothes", suspicious: false, country: "South Korea" },
        clothing: { discovered: false, evidence: "🥋 Taekwondo uniform", suspicious: false, country: "South Korea" },
        currency: { discovered: false, evidence: "💴 Korean Won notes", suspicious: false, country: "South Korea" }
      }
    },
    countries: ["South Korea", "North Korea", "Japan"],
    correctAnswer: "South Korea",
    explanation: "Yuki has Korean flag, kimchi smell, taekwondo uniform, and Korean Won."
  },
  {
    id: 12,
    traveler: {
      name: "Carlos",
      emoji: "🏖️",
      statement: "I was on a beach vacation.",
      clues: {
        flag: { discovered: false, evidence: "🇧🇷 Brazilian flag beach towel", suspicious: false, country: "Brazil" },
        food: { discovered: false, evidence: "🥥 Coconut water residue", suspicious: false, country: "Brazil" },
        clothing: { discovered: false, evidence: "🩱 Rio de Janeiro souvenir shirt", suspicious: false, country: "Brazil" },
        currency: { discovered: false, evidence: "💰 Brazilian Real banknotes", suspicious: false, country: "Brazil" }
      }
    },
    countries: ["Brazil", "Argentina", "Colombia"],
    correctAnswer: "Brazil",
    explanation: "Carlos has Brazilian flag towel, coconut water, Rio shirt, and Brazilian Reals."
  },
  {
    id: 13,
    traveler: {
      name: "Fatima",
      emoji: "🕌",
      statement: "I was on a pilgrimage.",
      clues: {
        flag: { discovered: false, evidence: "🇸🇦 Saudi Arabian flag prayer mat", suspicious: false, country: "Saudi Arabia" },
        food: { discovered: false, evidence: "🫒 Date fruit stains", suspicious: false, country: "Saudi Arabia" },
        clothing: { discovered: false, evidence: "🧕 Traditional abaya", suspicious: false, country: "Saudi Arabia" },
        currency: { discovered: false, evidence: "💰 Saudi Riyal notes", suspicious: false, country: "Saudi Arabia" }
      }
    },
    countries: ["Saudi Arabia", "UAE", "Qatar"],
    correctAnswer: "Saudi Arabia",
    explanation: "Fatima has Saudi flag prayer mat, date stains, traditional abaya, and Saudi Riyals."
  },
  // Hard Level Scenarios (13-16) - 4 questions
  {
    id: 14,
    traveler: {
      name: "Lars",
      emoji: "🛥️",
      statement: "I work in shipping industry.",
      clues: {
        flag: { discovered: false, evidence: "🇳🇴 Norwegian flag on ship pin", suspicious: false, country: "Norway" },
        food: { discovered: false, evidence: "🐟 Salmon scale on jacket", suspicious: false, country: "Norway" },
        clothing: { discovered: false, evidence: "🧥 Bergen Maritime Academy patch", suspicious: false, country: "Norway" },
        currency: { discovered: false, evidence: "💰 Norwegian Krone coins", suspicious: false, country: "Norway" }
      }
    },
    countries: ["Norway", "Sweden", "Finland"],
    correctAnswer: "Norway",
    explanation: "Lars has Norwegian flag pin, salmon scale, Bergen Academy patch, and Norwegian Kroner."
  },
  {
    id: 15,
    traveler: {
      name: "Kofi",
      emoji: "☕",
      statement: "I'm a coffee trader.",
      clues: {
        flag: { discovered: false, evidence: "🇪🇹 Ethiopian flag on coffee bag", suspicious: false, country: "Ethiopia" },
        food: { discovered: false, evidence: "☕ Coffee bean stains", suspicious: false, country: "Ethiopia" },
        clothing: { discovered: false, evidence: "👕 Addis Ababa coffee export shirt", suspicious: false, country: "Ethiopia" },
        currency: { discovered: false, evidence: "💰 Ethiopian Birr notes", suspicious: false, country: "Ethiopia" }
      }
    },
    countries: ["Ethiopia", "Kenya", "Uganda"],
    correctAnswer: "Ethiopia",
    explanation: "Kofi has Ethiopian flag, coffee stains, Addis Ababa shirt, and Ethiopian Birr."
  },
  {
    id: 16,
    traveler: {
      name: "Priya",
      emoji: "🎨",
      statement: "I'm a textile artist.",
      clues: {
        flag: { discovered: false, evidence: "🇧🇩 Bangladeshi flag pattern", suspicious: false, country: "Bangladesh" },
        food: { discovered: false, evidence: "🍛 Rice grain on sari", suspicious: false, country: "Bangladesh" },
        clothing: { discovered: false, evidence: "🥻 Dhaka silk sari", suspicious: false, country: "Bangladesh" },
        currency: { discovered: false, evidence: "💰 Bangladeshi Taka notes", suspicious: false, country: "Bangladesh" }
      }
    },
    countries: ["Bangladesh", "India", "Myanmar"],
    correctAnswer: "Bangladesh",
    explanation: "Priya has Bangladeshi flag pattern, rice on sari, Dhaka silk, and Bangladeshi Taka."
  },
  {
    id: 17,
    traveler: {
      name: "Mikhail",
      emoji: "🎻",
      statement: "I'm a classical musician.",
      clues: {
        flag: { discovered: false, evidence: "🇺🇦 Ukrainian flag on violin case", suspicious: false, country: "Ukraine" },
        food: { discovered: false, evidence: "🥟 Pierogi crumb on bow tie", suspicious: false, country: "Ukraine" },
        clothing: { discovered: false, evidence: "🎭 Kyiv Opera House badge", suspicious: false, country: "Ukraine" },
        currency: { discovered: false, evidence: "💰 Ukrainian Hryvnia notes", suspicious: false, country: "Ukraine" }
      }
    },
    countries: ["Ukraine", "Poland", "Czech Republic"],
    correctAnswer: "Ukraine",
    explanation: "Mikhail has Ukrainian flag, pierogi crumb, Kyiv Opera badge, and Ukrainian Hryvnia."
  }
];

// Get scenarios based on difficulty
export const getScenariosByDifficulty = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return allScenarios.slice(0, 8);      // Scenarios 0–7
    case 'Moderate':
      return allScenarios.slice(8, 13);     // Scenarios 8–12
    case 'Hard':
      return allScenarios.slice(13, 17);    // Scenarios 13–16
    default:
      return allScenarios.slice(0, 8);
  }
};

// Calculate score
export const calculateScore = (difficulty, correctAnswers, wrongAnswers) => {
  const settings = difficultySettings[difficulty];
  const positiveScore = correctAnswers * settings.pointsPerQuestion;
  // Remove negative scoring - only count correct answers
  return positiveScore;
};