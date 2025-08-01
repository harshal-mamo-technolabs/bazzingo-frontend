import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Eye, Lightbulb, CheckCircle, XCircle, Lock, Unlock, Search, ChevronUp, ChevronDown, Users } from 'lucide-react';

const WhoIsBrainGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [solvedScenarios, setSolvedScenarios] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalResponseTime, setTotalResponseTime] = useState(0);
  const [scenarioStartTime, setScenarioStartTime] = useState(0);
  const [currentScenarios, setCurrentScenarios] = useState([]);

  // Game state
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [discoveredClues, setDiscoveredClues] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // All 20 scenarios data
  const allScenarios = [
    // Easy Level Scenarios (0-7) - 8 questions
    {
      id: 1,
      question: "Who ate the last cookie?",
      description: "Three friends claim they didn't eat the last cookie. Examine the evidence to find the culprit!",
      characters: [
        {
          id: 'alice',
          name: 'Alice',
          emoji: '👧',
          statement: "I was reading in my room all afternoon.",
          clues: {
            hands: { discovered: false, evidence: "Clean hands, no crumbs", suspicious: false },
            face: { discovered: false, evidence: "Calm expression, making eye contact", suspicious: false },
            clothes: { discovered: false, evidence: "No chocolate stains on shirt", suspicious: false },
            behavior: { discovered: false, evidence: "Confident body language", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'bob',
          name: 'Bob',
          emoji: '👦',
          statement: "I was playing video games and never left my chair.",
          clues: {
            hands: { discovered: false, evidence: "Chocolate smudges on fingers!", suspicious: true },
            face: { discovered: false, evidence: "Avoiding eye contact, nervous", suspicious: true },
            clothes: { discovered: false, evidence: "Cookie crumbs on lap", suspicious: true },
            behavior: { discovered: false, evidence: "Fidgeting and sweating", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'charlie',
          name: 'Charlie',
          emoji: '🧒',
          statement: "I was outside playing soccer the whole time.",
          clues: {
            hands: { discovered: false, evidence: "Dirty from playing outside", suspicious: false },
            face: { discovered: false, evidence: "Honest expression, confident", suspicious: false },
            clothes: { discovered: false, evidence: "Grass stains on shirt", suspicious: false },
            behavior: { discovered: false, evidence: "Natural, relaxed posture", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'bob',
      explanation: "Bob has chocolate on his fingers and cookie crumbs on his lap, contradicting his claim of never leaving his chair."
    },
    {
      id: 2,
      question: "Who stole the money?",
      description: "Someone took money from the teacher's desk during lunch break. Find the thief!",
      characters: [
        {
          id: 'emma',
          name: 'Emma',
          emoji: '👩',
          statement: "I was in the library studying for my test.",
          clues: {
            hands: { discovered: false, evidence: "Ink stains from writing", suspicious: false },
            face: { discovered: false, evidence: "Tired from studying", suspicious: false },
            clothes: { discovered: false, evidence: "Books in backpack", suspicious: false },
            behavior: { discovered: false, evidence: "Calm and focused", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'david',
          name: 'David',
          emoji: '👨',
          statement: "I was in the cafeteria eating lunch with friends.",
          clues: {
            hands: { discovered: false, evidence: "Food crumbs on hands", suspicious: false },
            face: { discovered: false, evidence: "Relaxed and honest", suspicious: false },
            clothes: { discovered: false, evidence: "Lunch receipt in pocket", suspicious: false },
            behavior: { discovered: false, evidence: "Open body language", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'sarah',
          name: 'Sarah',
          emoji: '👱‍♀️',
          statement: "I was in the bathroom fixing my makeup.",
          clues: {
            hands: { discovered: false, evidence: "Shaky hands, nervous", suspicious: true },
            face: { discovered: false, evidence: "Sweating, avoiding eye contact", suspicious: true },
            clothes: { discovered: false, evidence: "Bulge in pocket - money!", suspicious: true },
            behavior: { discovered: false, evidence: "Defensive posture", suspicious: true }
          },
          isCorrect: true
        }
      ],
      correctAnswer: 'sarah',
      explanation: "Sarah has money bulging in her pocket and shows nervous behavior, indicating guilt."
    },
    {
      id: 3,
      question: "Who broke the window?",
      description: "A classroom window was broken during recess. Investigate to find who's responsible!",
      characters: [
        {
          id: 'tom',
          name: 'Tom',
          emoji: '👦',
          statement: "I was playing basketball on the court the whole time.",
          clues: {
            hands: { discovered: false, evidence: "No cuts or glass", suspicious: false },
            face: { discovered: false, evidence: "Genuine surprise about the window", suspicious: false },
            clothes: { discovered: false, evidence: "Basketball uniform, no glass", suspicious: false },
            behavior: { discovered: false, evidence: "Helpful and concerned", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'lily',
          name: 'Lily',
          emoji: '👧',
          statement: "I was reading under the tree by myself.",
          clues: {
            hands: { discovered: false, evidence: "Small cut on palm", suspicious: true },
            face: { discovered: false, evidence: "Nervous, looking down", suspicious: true },
            clothes: { discovered: false, evidence: "Tiny glass fragments on sleeve", suspicious: true },
            behavior: { discovered: false, evidence: "Trying to hide hands", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'max',
          name: 'Max',
          emoji: '🧒',
          statement: "I was in the art room painting.",
          clues: {
            hands: { discovered: false, evidence: "Paint stains, no glass", suspicious: false },
            face: { discovered: false, evidence: "Focused on art project", suspicious: false },
            clothes: { discovered: false, evidence: "Art smock with paint", suspicious: false },
            behavior: { discovered: false, evidence: "Absorbed in creative work", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'lily',
      explanation: "Lily has a cut on her palm and glass fragments on her sleeve, despite claiming to be reading away from the building."
    },
    {
      id: 4,
      question: "Who cheated on the test?",
      description: "A student was caught cheating during the exam. Find out who it was!",
      characters: [
        {
          id: 'anna',
          name: 'Anna',
          emoji: '👩‍🎓',
          statement: "I studied all night and knew all the answers.",
          clues: {
            hands: { discovered: false, evidence: "Clean hands, no notes", suspicious: false },
            face: { discovered: false, evidence: "Confident about answers", suspicious: false },
            clothes: { discovered: false, evidence: "Study notes in bag", suspicious: false },
            behavior: { discovered: false, evidence: "Relaxed and honest", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'jake',
          name: 'Jake',
          emoji: '👨‍🎓',
          statement: "I prepared well and didn't need to cheat.",
          clues: {
            hands: { discovered: false, evidence: "Ink smudges from writing notes", suspicious: true },
            face: { discovered: false, evidence: "Sweating and nervous", suspicious: true },
            clothes: { discovered: false, evidence: "Cheat sheet in sleeve!", suspicious: true },
            behavior: { discovered: false, evidence: "Constantly looking around", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'mia',
          name: 'Mia',
          emoji: '👩‍💼',
          statement: "I always do my own work honestly.",
          clues: {
            hands: { discovered: false, evidence: "Pencil marks from writing", suspicious: false },
            face: { discovered: false, evidence: "Focused on her paper", suspicious: false },
            clothes: { discovered: false, evidence: "Calculator in pocket", suspicious: false },
            behavior: { discovered: false, evidence: "Working steadily", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'jake',
      explanation: "Jake has a cheat sheet hidden in his sleeve and shows nervous behavior typical of someone cheating."
    },
    {
      id: 5,
      question: "Who vandalized the locker?",
      description: "Someone spray-painted graffiti on the school lockers. Find the vandal!",
      characters: [
        {
          id: 'ryan',
          name: 'Ryan',
          emoji: '👨‍🎨',
          statement: "I was in art class working on my project.",
          clues: {
            hands: { discovered: false, evidence: "Paint under fingernails", suspicious: true },
            face: { discovered: false, evidence: "Trying to act innocent", suspicious: true },
            clothes: { discovered: false, evidence: "Spray paint stains on shirt", suspicious: true },
            behavior: { discovered: false, evidence: "Avoiding the locker area", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'zoe',
          name: 'Zoe',
          emoji: '👩‍🏫',
          statement: "I was helping the teacher organize supplies.",
          clues: {
            hands: { discovered: false, evidence: "Clean hands", suspicious: false },
            face: { discovered: false, evidence: "Genuinely helpful attitude", suspicious: false },
            clothes: { discovered: false, evidence: "Teacher's note of thanks", suspicious: false },
            behavior: { discovered: false, evidence: "Responsible and mature", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'alex',
          name: 'Alex',
          emoji: '👨‍💻',
          statement: "I was in the computer lab coding.",
          clues: {
            hands: { discovered: false, evidence: "Keyboard marks on fingers", suspicious: false },
            face: { discovered: false, evidence: "Focused on technology", suspicious: false },
            clothes: { discovered: false, evidence: "Programming book in bag", suspicious: false },
            behavior: { discovered: false, evidence: "Absorbed in coding", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'ryan',
      explanation: "Ryan has paint under his fingernails and spray paint stains on his shirt, despite claiming to be in art class."
    },
    {
      id: 6,
      question: "Who started the food fight?",
      description: "A massive food fight broke out in the cafeteria. Who threw the first food?",
      characters: [
        {
          id: 'ben',
          name: 'Ben',
          emoji: '👨‍🍳',
          statement: "I was quietly eating my lunch alone.",
          clues: {
            hands: { discovered: false, evidence: "Food stains on palms", suspicious: true },
            face: { discovered: false, evidence: "Mischievous grin", suspicious: true },
            clothes: { discovered: false, evidence: "Mashed potatoes on shirt", suspicious: true },
            behavior: { discovered: false, evidence: "Laughing about the chaos", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'grace',
          name: 'Grace',
          emoji: '👩‍🎓',
          statement: "I was reading while eating my salad.",
          clues: {
            hands: { discovered: false, evidence: "Clean hands with book", suspicious: false },
            face: { discovered: false, evidence: "Shocked by the mess", suspicious: false },
            clothes: { discovered: false, evidence: "Clean clothes, no food", suspicious: false },
            behavior: { discovered: false, evidence: "Trying to avoid the chaos", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'sam',
          name: 'Sam',
          emoji: '👨‍🏫',
          statement: "I was discussing homework with friends.",
          clues: {
            hands: { discovered: false, evidence: "Homework papers in hand", suspicious: false },
            face: { discovered: false, evidence: "Serious about studies", suspicious: false },
            clothes: { discovered: false, evidence: "Neat and organized", suspicious: false },
            behavior: { discovered: false, evidence: "Academic focused", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'ben',
      explanation: "Ben has food stains on his hands and clothes, plus he's laughing about the chaos he caused."
    },
    {
      id: 7,
      question: "Who skipped class?",
      description: "Someone was supposed to be in math class but went missing. Who skipped?",
      characters: [
        {
          id: 'olivia',
          name: 'Olivia',
          emoji: '👩‍🎓',
          statement: "I was in the nurse's office feeling sick.",
          clues: {
            hands: { discovered: false, evidence: "Nurse's pass in hand", suspicious: false },
            face: { discovered: false, evidence: "Pale and tired looking", suspicious: false },
            clothes: { discovered: false, evidence: "Medicine bottle in pocket", suspicious: false },
            behavior: { discovered: false, evidence: "Moving slowly, unwell", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'tyler',
          name: 'Tyler',
          emoji: '👨‍🎮',
          statement: "I was in the library doing research.",
          clues: {
            hands: { discovered: false, evidence: "Sunscreen on hands", suspicious: true },
            face: { discovered: false, evidence: "Slight sunburn on face", suspicious: true },
            clothes: { discovered: false, evidence: "Grass stains on shoes", suspicious: true },
            behavior: { discovered: false, evidence: "Relaxed, like he had fun", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'chloe',
          name: 'Chloe',
          emoji: '👩‍💼',
          statement: "I was meeting with the guidance counselor.",
          clues: {
            hands: { discovered: false, evidence: "Appointment slip", suspicious: false },
            face: { discovered: false, evidence: "Serious expression", suspicious: false },
            clothes: { discovered: false, evidence: "Counselor's business card", suspicious: false },
            behavior: { discovered: false, evidence: "Responsible attitude", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'tyler',
      explanation: "Tyler has sunscreen, sunburn, and grass stains - clear signs he was outside instead of in the library."
    },
    {
      id: 8,
      question: "Who spread the rumor?",
      description: "A false rumor is spreading around school. Find out who started it!",
      characters: [
        {
          id: 'madison',
          name: 'Madison',
          emoji: '👩‍💬',
          statement: "I never gossip or spread rumors about anyone.",
          clues: {
            hands: { discovered: false, evidence: "Phone with group chats open", suspicious: true },
            face: { discovered: false, evidence: "Smirking when asked", suspicious: true },
            clothes: { discovered: false, evidence: "Notes about the rumor", suspicious: true },
            behavior: { discovered: false, evidence: "Whispering to friends", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'ethan',
          name: 'Ethan',
          emoji: '👨‍🔬',
          statement: "I focus on my studies, not drama.",
          clues: {
            hands: { discovered: false, evidence: "Science textbook", suspicious: false },
            face: { discovered: false, evidence: "Confused about the rumor", suspicious: false },
            clothes: { discovered: false, evidence: "Lab safety goggles", suspicious: false },
            behavior: { discovered: false, evidence: "Avoiding social drama", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'sophia',
          name: 'Sophia',
          emoji: '👩‍🎨',
          statement: "I was busy with my art portfolio.",
          clues: {
            hands: { discovered: false, evidence: "Paint on fingers", suspicious: false },
            face: { discovered: false, evidence: "Focused on creativity", suspicious: false },
            clothes: { discovered: false, evidence: "Art supplies in bag", suspicious: false },
            behavior: { discovered: false, evidence: "Absorbed in artistic work", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'madison',
      explanation: "Madison has her phone open to group chats and notes about the rumor, despite claiming she doesn't gossip."
    },
    // Moderate Level Scenarios (8-14) - 7 questions
    {
      id: 9,
      question: "Who broke the science equipment?",
      description: "Expensive lab equipment was damaged during science class. Who's responsible?",
      characters: [
        {
          id: 'noah',
          name: 'Noah',
          emoji: '👨‍🔬',
          statement: "I was carefully following the lab instructions.",
          clues: {
            hands: { discovered: false, evidence: "Chemical stains from spill", suspicious: true },
            face: { discovered: false, evidence: "Nervous about the accident", suspicious: true },
            clothes: { discovered: false, evidence: "Broken glass in pocket", suspicious: true },
            behavior: { discovered: false, evidence: "Trying to clean up quietly", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'ava',
          name: 'Ava',
          emoji: '👩‍🔬',
          statement: "I finished my experiment early and was reading.",
          clues: {
            hands: { discovered: false, evidence: "Clean hands with book", suspicious: false },
            face: { discovered: false, evidence: "Surprised by the commotion", suspicious: false },
            clothes: { discovered: false, evidence: "Neat lab coat", suspicious: false },
            behavior: { discovered: false, evidence: "Organized and careful", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'lucas',
          name: 'Lucas',
          emoji: '👨‍💻',
          statement: "I was recording data on my tablet.",
          clues: {
            hands: { discovered: false, evidence: "Tablet with data entries", suspicious: false },
            face: { discovered: false, evidence: "Focused on documentation", suspicious: false },
            clothes: { discovered: false, evidence: "Digital stylus in pocket", suspicious: false },
            behavior: { discovered: false, evidence: "Methodical and precise", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'noah',
      explanation: "Noah has chemical stains and broken glass in his pocket, showing he was involved in the accident."
    },
    {
      id: 10,
      question: "Who plagiarized the essay?",
      description: "A student submitted a plagiarized essay. Find out who copied their work!",
      characters: [
        {
          id: 'isabella',
          name: 'Isabella',
          emoji: '👩‍💼',
          statement: "I spent weeks researching and writing my essay.",
          clues: {
            hands: { discovered: false, evidence: "Research notes and drafts", suspicious: false },
            face: { discovered: false, evidence: "Proud of her hard work", suspicious: false },
            clothes: { discovered: false, evidence: "Library books in bag", suspicious: false },
            behavior: { discovered: false, evidence: "Confident about originality", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'mason',
          name: 'Mason',
          emoji: '👨‍💻',
          statement: "I wrote everything myself using my own ideas.",
          clues: {
            hands: { discovered: false, evidence: "Copy-paste shortcuts on phone", suspicious: true },
            face: { discovered: false, evidence: "Avoiding eye contact", suspicious: true },
            clothes: { discovered: false, evidence: "Printed internet articles", suspicious: true },
            behavior: { discovered: false, evidence: "Defensive about questions", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'lily_writer',
          name: 'Lily',
          emoji: '👩‍🎓',
          statement: "I always cite my sources properly.",
          clues: {
            hands: { discovered: false, evidence: "Bibliography notes", suspicious: false },
            face: { discovered: false, evidence: "Honest about her process", suspicious: false },
            clothes: { discovered: false, evidence: "Style guide in backpack", suspicious: false },
            behavior: { discovered: false, evidence: "Academic integrity focused", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'mason',
      explanation: "Mason has copy-paste shortcuts on his phone and printed internet articles, showing he plagiarized."
    },
    {
      id: 11,
      question: "Who stole the lunch money?",
      description: "Money from the lunch fund went missing. Who took it?",
      characters: [
        {
          id: 'jackson',
          name: 'Jackson',
          emoji: '👨‍🍔',
          statement: "I brought my own lunch from home today.",
          clues: {
            hands: { discovered: false, evidence: "Lunch box in hands", suspicious: false },
            face: { discovered: false, evidence: "Honest expression", suspicious: false },
            clothes: { discovered: false, evidence: "Homemade sandwich wrapper", suspicious: false },
            behavior: { discovered: false, evidence: "Eating his own food", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'harper',
          name: 'Harper',
          emoji: '👩‍🎭',
          statement: "I was practicing lines for the school play.",
          clues: {
            hands: { discovered: false, evidence: "Crumpled bills in palm", suspicious: true },
            face: { discovered: false, evidence: "Nervous and sweating", suspicious: true },
            clothes: { discovered: false, evidence: "Expensive snacks in pocket", suspicious: true },
            behavior: { discovered: false, evidence: "Avoiding the lunch area", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'carter',
          name: 'Carter',
          emoji: '👨‍🏃',
          statement: "I was at track practice during lunch.",
          clues: {
            hands: { discovered: false, evidence: "Stopwatch in hand", suspicious: false },
            face: { discovered: false, evidence: "Tired from running", suspicious: false },
            clothes: { discovered: false, evidence: "Track uniform", suspicious: false },
            behavior: { discovered: false, evidence: "Athletic and focused", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'harper',
      explanation: "Harper has crumpled bills and expensive snacks, despite claiming to be practicing for the play."
    },
    {
      id: 12,
      question: "Who hacked the school computer?",
      description: "Someone accessed the school's computer system illegally. Find the hacker!",
      characters: [
        {
          id: 'aiden',
          name: 'Aiden',
          emoji: '👨‍💻',
          statement: "I only use computers for homework and games.",
          clues: {
            hands: { discovered: false, evidence: "Hacking tools on USB drive", suspicious: true },
            face: { discovered: false, evidence: "Smug expression", suspicious: true },
            clothes: { discovered: false, evidence: "Advanced coding books", suspicious: true },
            behavior: { discovered: false, evidence: "Bragging about computer skills", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'scarlett',
          name: 'Scarlett',
          emoji: '👩‍🎨',
          statement: "I use computers only for digital art projects.",
          clues: {
            hands: { discovered: false, evidence: "Graphics tablet stylus", suspicious: false },
            face: { discovered: false, evidence: "Focused on creative work", suspicious: false },
            clothes: { discovered: false, evidence: "Art software manuals", suspicious: false },
            behavior: { discovered: false, evidence: "Artistic and creative", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'logan',
          name: 'Logan',
          emoji: '👨‍📚',
          statement: "I barely know how to use email properly.",
          clues: {
            hands: { discovered: false, evidence: "Basic computer manual", suspicious: false },
            face: { discovered: false, evidence: "Confused by technology", suspicious: false },
            clothes: { discovered: false, evidence: "Traditional textbooks", suspicious: false },
            behavior: { discovered: false, evidence: "Avoiding computers", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'aiden',
      explanation: "Aiden has hacking tools and advanced coding books, plus he's bragging about his computer skills."
    },
    {
      id: 13,
      question: "Who started the false fire alarm?",
      description: "Someone pulled the fire alarm as a prank. Who caused the evacuation?",
      characters: [
        {
          id: 'maya',
          name: 'Maya',
          emoji: '👩‍🚒',
          statement: "I was helping organize the evacuation properly.",
          clues: {
            hands: { discovered: false, evidence: "Emergency procedures sheet", suspicious: false },
            face: { discovered: false, evidence: "Serious about safety", suspicious: false },
            clothes: { discovered: false, evidence: "Safety monitor badge", suspicious: false },
            behavior: { discovered: false, evidence: "Responsible leadership", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'connor',
          name: 'Connor',
          emoji: '👨‍🎭',
          statement: "I was in the bathroom when the alarm went off.",
          clues: {
            hands: { discovered: false, evidence: "Red paint on fingertips", suspicious: true },
            face: { discovered: false, evidence: "Trying not to laugh", suspicious: true },
            clothes: { discovered: false, evidence: "Alarm mechanism in pocket", suspicious: true },
            behavior: { discovered: false, evidence: "Enjoying the chaos", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'zara',
          name: 'Zara',
          emoji: '👩‍🔬',
          statement: "I was in the chemistry lab during the alarm.",
          clues: {
            hands: { discovered: false, evidence: "Chemical safety gloves", suspicious: false },
            face: { discovered: false, evidence: "Concerned about lab safety", suspicious: false },
            clothes: { discovered: false, evidence: "Lab safety equipment", suspicious: false },
            behavior: { discovered: false, evidence: "Following safety protocols", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'connor',
      explanation: "Connor has red paint on his fingers and alarm mechanism parts, plus he's enjoying the chaos he caused."
    },
    {
      id: 14,
      question: "Who forged the hall pass?",
      description: "A fake hall pass was discovered. Who created the forgery?",
      characters: [
        {
          id: 'blake',
          name: 'Blake',
          emoji: '👨‍🎨',
          statement: "I was in art class working on my portfolio.",
          clues: {
            hands: { discovered: false, evidence: "Ink matching the fake pass", suspicious: true },
            face: { discovered: false, evidence: "Nervous about questions", suspicious: true },
            clothes: { discovered: false, evidence: "Tracing paper in pocket", suspicious: true },
            behavior: { discovered: false, evidence: "Hiding art supplies", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'aria',
          name: 'Aria',
          emoji: '👩‍💼',
          statement: "I always get proper permission before leaving class.",
          clues: {
            hands: { discovered: false, evidence: "Official hall pass", suspicious: false },
            face: { discovered: false, evidence: "Honest and responsible", suspicious: false },
            clothes: { discovered: false, evidence: "Student planner", suspicious: false },
            behavior: { discovered: false, evidence: "Following school rules", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'eli',
          name: 'Eli',
          emoji: '👨‍📚',
          statement: "I never leave class without permission.",
          clues: {
            hands: { discovered: false, evidence: "Textbooks and notes", suspicious: false },
            face: { discovered: false, evidence: "Focused on studies", suspicious: false },
            clothes: { discovered: false, evidence: "Perfect attendance pin", suspicious: false },
            behavior: { discovered: false, evidence: "Model student behavior", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'blake',
      explanation: "Blake has ink matching the fake pass and tracing paper, showing he used his art skills to forge it."
    },
    {
      id: 15,
      question: "Who bullied the new student?",
      description: "The new student was being bullied. Find out who was responsible!",
      characters: [
        {
          id: 'quinn',
          name: 'Quinn',
          emoji: '👨‍🤝‍👨',
          statement: "I always try to help new students feel welcome.",
          clues: {
            hands: { discovered: false, evidence: "Welcome committee flyer", suspicious: false },
            face: { discovered: false, evidence: "Kind and welcoming", suspicious: false },
            clothes: { discovered: false, evidence: "Friendship bracelet", suspicious: false },
            behavior: { discovered: false, evidence: "Including others", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'dakota',
          name: 'Dakota',
          emoji: '👨‍😠',
          statement: "I mind my own business and don't bother anyone.",
          clues: {
            hands: { discovered: false, evidence: "Aggressive posture", suspicious: true },
            face: { discovered: false, evidence: "Smirking about the situation", suspicious: true },
            clothes: { discovered: false, evidence: "Mean messages on phone", suspicious: true },
            behavior: { discovered: false, evidence: "Intimidating others", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'river',
          name: 'River',
          emoji: '👩‍🎓',
          statement: "I was studying in the library all day.",
          clues: {
            hands: { discovered: false, evidence: "Library books", suspicious: false },
            face: { discovered: false, evidence: "Focused on academics", suspicious: false },
            clothes: { discovered: false, evidence: "Study schedule", suspicious: false },
            behavior: { discovered: false, evidence: "Quiet and studious", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'dakota',
      explanation: "Dakota shows aggressive behavior and has mean messages on his phone, despite claiming to mind his own business."
    },
    // Hard Level Scenarios (15-19) - 5 questions
    {
      id: 16,
      question: "Who damaged the library books?",
      description: "Several library books were found damaged. Who's the vandal?",
      characters: [
        {
          id: 'sage',
          name: 'Sage',
          emoji: '👩‍📚',
          statement: "I love books and would never damage them.",
          clues: {
            hands: { discovered: false, evidence: "Book repair tape", suspicious: false },
            face: { discovered: false, evidence: "Upset about the damage", suspicious: false },
            clothes: { discovered: false, evidence: "Library volunteer badge", suspicious: false },
            behavior: { discovered: false, evidence: "Protecting books", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'phoenix',
          name: 'Phoenix',
          emoji: '👨‍🔥',
          statement: "I was just browsing for a book to read.",
          clues: {
            hands: { discovered: false, evidence: "Torn paper under nails", suspicious: true },
            face: { discovered: false, evidence: "Guilty expression", suspicious: true },
            clothes: { discovered: false, evidence: "Book pages in pocket", suspicious: true },
            behavior: { discovered: false, evidence: "Avoiding the librarian", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'rowan',
          name: 'Rowan',
          emoji: '👩‍💻',
          statement: "I only use digital books on my tablet.",
          clues: {
            hands: { discovered: false, evidence: "E-reader device", suspicious: false },
            face: { discovered: false, evidence: "Prefers technology", suspicious: false },
            clothes: { discovered: false, evidence: "Digital library app", suspicious: false },
            behavior: { discovered: false, evidence: "Tech-focused", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'phoenix',
      explanation: "Phoenix has torn paper under his nails and book pages in his pocket, showing he damaged the books."
    },
    {
      id: 17,
      question: "Who cheated in the sports game?",
      description: "Someone was caught cheating during the school sports competition. Who broke the rules?",
      characters: [
        {
          id: 'jordan',
          name: 'Jordan',
          emoji: '👨‍🏃',
          statement: "I trained hard and won fairly.",
          clues: {
            hands: { discovered: false, evidence: "Training schedule", suspicious: false },
            face: { discovered: false, evidence: "Proud of honest effort", suspicious: false },
            clothes: { discovered: false, evidence: "Fair play medal", suspicious: false },
            behavior: { discovered: false, evidence: "Good sportsmanship", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'casey',
          name: 'Casey',
          emoji: '👩‍🏃',
          statement: "I followed all the rules during the game.",
          clues: {
            hands: { discovered: false, evidence: "Performance enhancing pills", suspicious: true },
            face: { discovered: false, evidence: "Overly energetic", suspicious: true },
            clothes: { discovered: false, evidence: "Suspicious energy drinks", suspicious: true },
            behavior: { discovered: false, evidence: "Unnaturally competitive", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'taylor',
          name: 'Taylor',
          emoji: '👨‍⚽',
          statement: "I played my best game without any shortcuts.",
          clues: {
            hands: { discovered: false, evidence: "Sports equipment", suspicious: false },
            face: { discovered: false, evidence: "Natural athletic focus", suspicious: false },
            clothes: { discovered: false, evidence: "Team spirit shirt", suspicious: false },
            behavior: { discovered: false, evidence: "Team player attitude", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'casey',
      explanation: "Casey has performance enhancing pills and suspicious energy drinks, showing she cheated to win."
    },
    {
      id: 18,
      question: "Who stole the art supplies?",
      description: "Expensive art supplies went missing from the art room. Who took them?",
      characters: [
        {
          id: 'avery',
          name: 'Avery',
          emoji: '👩‍🎨',
          statement: "I bring my own art supplies from home.",
          clues: {
            hands: { discovered: false, evidence: "Personal art kit", suspicious: false },
            face: { discovered: false, evidence: "Honest about her supplies", suspicious: false },
            clothes: { discovered: false, evidence: "Receipt for art materials", suspicious: false },
            behavior: { discovered: false, evidence: "Organized and prepared", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'jamie',
          name: 'Jamie',
          emoji: '👨‍🎭',
          statement: "I was working on my drama project.",
          clues: {
            hands: { discovered: false, evidence: "School art supplies hidden", suspicious: true },
            face: { discovered: false, evidence: "Nervous when questioned", suspicious: true },
            clothes: { discovered: false, evidence: "Expensive paints in bag", suspicious: true },
            behavior: { discovered: false, evidence: "Avoiding the art teacher", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'morgan',
          name: 'Morgan',
          emoji: '👩‍💼',
          statement: "I don't take art classes this semester.",
          clues: {
            hands: { discovered: false, evidence: "Business textbooks", suspicious: false },
            face: { discovered: false, evidence: "Focused on other subjects", suspicious: false },
            clothes: { discovered: false, evidence: "Math calculator", suspicious: false },
            behavior: { discovered: false, evidence: "Academic priorities", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'jamie',
      explanation: "Jamie has hidden school art supplies and expensive paints in his bag, despite working on drama projects."
    },
    {
      id: 19,
      question: "Who spread the computer virus?",
      description: "A virus infected the school's computer network. Who was responsible?",
      characters: [
        {
          id: 'drew',
          name: 'Drew',
          emoji: '👨‍💻',
          statement: "I only use computers for schoolwork.",
          clues: {
            hands: { discovered: false, evidence: "Virus creation software", suspicious: true },
            face: { discovered: false, evidence: "Proud of technical skills", suspicious: true },
            clothes: { discovered: false, evidence: "Hacker conference badge", suspicious: true },
            behavior: { discovered: false, evidence: "Bragging about the chaos", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'alex_student',
          name: 'Alex',
          emoji: '👩‍🔬',
          statement: "I use computers only for science research.",
          clues: {
            hands: { discovered: false, evidence: "Research data files", suspicious: false },
            face: { discovered: false, evidence: "Focused on academics", suspicious: false },
            clothes: { discovered: false, evidence: "Science journal", suspicious: false },
            behavior: { discovered: false, evidence: "Educational purposes only", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'riley',
          name: 'Riley',
          emoji: '👨‍🎮',
          statement: "I only play games on computers.",
          clues: {
            hands: { discovered: false, evidence: "Gaming controller", suspicious: false },
            face: { discovered: false, evidence: "Focused on entertainment", suspicious: false },
            clothes: { discovered: false, evidence: "Gaming magazine", suspicious: false },
            behavior: { discovered: false, evidence: "Casual computer user", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'drew',
      explanation: "Drew has virus creation software and a hacker conference badge, plus he's bragging about causing the chaos."
    },
    {
      id: 20,
      question: "Who vandalized the school mascot costume?",
      description: "The school mascot costume was found damaged before the big game. Who ruined it?",
      characters: [
        {
          id: 'charlie_spirit',
          name: 'Charlie',
          emoji: '👨‍🎭',
          statement: "I love our school spirit and would never hurt our mascot.",
          clues: {
            hands: { discovered: false, evidence: "School spirit paint", suspicious: false },
            face: { discovered: false, evidence: "Genuinely upset about damage", suspicious: false },
            clothes: { discovered: false, evidence: "Team support buttons", suspicious: false },
            behavior: { discovered: false, evidence: "Trying to fix the costume", suspicious: false }
          },
          isCorrect: false
        },
        {
          id: 'devon',
          name: 'Devon',
          emoji: '👨‍😈',
          statement: "I was at home sick and wasn't even at school.",
          clues: {
            hands: { discovered: false, evidence: "Costume fabric under nails", suspicious: true },
            face: { discovered: false, evidence: "Smirking about the damage", suspicious: true },
            clothes: { discovered: false, evidence: "Rival school colors", suspicious: true },
            behavior: { discovered: false, evidence: "Happy about the sabotage", suspicious: true }
          },
          isCorrect: true
        },
        {
          id: 'skylar',
          name: 'Skylar',
          emoji: '👩‍🏫',
          statement: "I was helping set up for the pep rally.",
          clues: {
            hands: { discovered: false, evidence: "Pep rally decorations", suspicious: false },
            face: { discovered: false, evidence: "Excited for the game", suspicious: false },
            clothes: { discovered: false, evidence: "School pride stickers", suspicious: false },
            behavior: { discovered: false, evidence: "Supporting school events", suspicious: false }
          },
          isCorrect: false
        }
      ],
      correctAnswer: 'devon',
      explanation: "Devon has costume fabric under his nails and is wearing rival school colors, despite claiming to be home sick."
    }
  ];

  // Get scenarios based on difficulty level
  const getScenariosByDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return allScenarios.slice(0, 8); // First 8 scenarios (0-7)
      case 'Moderate':
        return allScenarios.slice(8, 15); // Next 7 scenarios (8-14)
      case 'Hard':
        return allScenarios.slice(15, 20); // Last 5 scenarios (15-19)
      default:
        return allScenarios.slice(0, 8);
    }
  };

  // Difficulty settings
  const difficultySettings = {
    Easy: { timeLimit: 300, lives: 5, hints: 3, questionCount: 8, pointsPerQuestion: 25 },
    Moderate: { timeLimit: 240, lives: 4, hints: 2, questionCount: 7, pointsPerQuestion: 28 },
    Hard: { timeLimit: 180, lives: 3, hints: 1, questionCount: 5, pointsPerQuestion: 40 }
  };

  // Simplified scoring system
  const calculateScore = useCallback(() => {
    const settings = difficultySettings[difficulty];
    return solvedScenarios * settings.pointsPerQuestion;
  }, [solvedScenarios, difficulty]);

  // Update score whenever relevant values change
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Handle clue discovery
  const handleClueDiscovery = useCallback((characterId, clueType) => {
    const clueKey = `${characterId}-${clueType}`;
    if (!discoveredClues.includes(clueKey)) {
      setDiscoveredClues(prev => [...prev, clueKey]);
    }
  }, [discoveredClues]);

  // Handle character selection
  const handleCharacterSelect = useCallback((characterId) => {
    if (gameState !== 'playing' || showFeedback || !currentScenarios[currentScenario]) return;

    const responseTime = Date.now() - scenarioStartTime;
    const currentScenarioData = currentScenarios[currentScenario];
    const isCorrect = characterId === currentScenarioData.correctAnswer;

    setSelectedCharacter(characterId);
    setShowFeedback(true);
    setTotalAttempts(prev => prev + 1);
    setTotalResponseTime(prev => prev + responseTime);

    if (isCorrect) {
      setFeedbackType('correct');
      setSolvedScenarios(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(current => Math.max(current, newStreak));
        return newStreak;
      });

      setTimeout(() => {
        if (currentScenario + 1 >= currentScenarios.length) {
          setGameState('finished');
          setShowCompletionModal(true);
        } else {
          setCurrentScenario(prev => prev + 1);
          setSelectedCharacter(null);
          setDiscoveredClues([]);
          setShowFeedback(false);
          setScenarioStartTime(Date.now());
        }
      }, 2500);
    } else {
      setFeedbackType('incorrect');
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            setGameState('finished');
            setShowCompletionModal(true);
          }, 2000);
        }
        return Math.max(0, newLives);
      });

      setTimeout(() => {
        if (lives > 1) {
          setShowFeedback(false);
          setSelectedCharacter(null);
        }
      }, 2500);
    }
  }, [gameState, showFeedback, currentScenario, scenarioStartTime, lives, currentScenarios]);

  // Use hint
  const useHint = () => {
    if (hintsUsed >= maxHints || gameState !== 'playing' || !currentScenarios[currentScenario]) return;

    setHintsUsed(prev => prev + 1);
    
    const currentScenarioData = currentScenarios[currentScenario];
    const correctCharacter = currentScenarioData.characters.find(char => char.isCorrect);
    
    if (correctCharacter) {
      // Find a suspicious clue that hasn't been discovered
      const suspiciousClues = Object.entries(correctCharacter.clues)
        .filter(([clueType, clue]) => {
          const clueKey = `${correctCharacter.id}-${clueType}`;
          return clue.suspicious && !discoveredClues.includes(clueKey);
        });

      if (suspiciousClues.length > 0) {
        const [clueType] = suspiciousClues[0];
        const clueKey = `${correctCharacter.id}-${clueType}`;
        setDiscoveredClues(prev => [...prev, clueKey]);
        setHintMessage(`Check ${correctCharacter.name}'s ${clueType} - there's something suspicious there!`);
      } else {
        setHintMessage(`Focus on ${correctCharacter.name} - they show signs of deception.`);
      }
    }

    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 4000);
  };

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const scenarios = getScenariosByDifficulty(difficulty);
    
    setCurrentScenarios(scenarios);
    setScore(0);
    setTimeRemaining(settings.timeLimit);
    setCurrentScenario(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(settings.lives);
    setMaxHints(settings.hints);
    setHintsUsed(0);
    setSolvedScenarios(0);
    setTotalAttempts(0);
    setTotalResponseTime(0);
    setSelectedCharacter(null);
    setDiscoveredClues([]);
    setShowFeedback(false);
    setShowHint(false);
  }, [difficulty]);

  const handleStart = () => {
    initializeGame();
    setScenarioStartTime(Date.now());
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleGameComplete = (payload) => {
    console.log('Who Is Brain Game completed:', payload);
  };

  const customStats = {
    currentScenario: currentScenario + 1,
    totalScenarios: currentScenarios.length,
    streak: maxStreak,
    lives,
    hintsUsed,
    solvedScenarios,
    totalAttempts,
    averageResponseTime: totalAttempts > 0 ? Math.round(totalResponseTime / totalAttempts / 1000) : 0,
    cluesDiscovered: discoveredClues.length
  };

  const currentScenarioData = currentScenarios[currentScenario] || currentScenarios[0];

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Who Is? Brain Game"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Who Is? Brain Game
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Toggle Content */}
              {showInstructions && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🕵️ Objective
                    </h4>
                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      Analyze characters and discover clues to identify who is lying, stealing, or guilty in each scenario.
                    </p>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      🔍 Investigation
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Click on body parts to examine clues</li>
                      <li>• Look for suspicious evidence</li>
                      <li>• Compare statements to evidence</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📊 Scoring
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 25 points per correct answer</li>
                      <li>• Moderate: 28 points per correct answer</li>
                      <li>• Hard: 40 points per correct answer</li>
                    </ul>
                  </div>

                  <div className='bg-white p-3 rounded-lg'>
                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      📝 Questions
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                      <li>• Easy: 8 different questions</li>
                      <li>• Moderate: 7 different questions</li>
                      <li>• Hard: 5 different questions</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
        category="Deductive Reasoning"
        gameState={gameState}
        setGameState={setGameState}
        score={score}
        timeRemaining={timeRemaining}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={handleStart}
        onReset={handleReset}
        onGameComplete={handleGameComplete}
        customStats={customStats}
      >
        {/* Game Content */}
        <div className="flex flex-col items-center">
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
            {gameState === 'playing' && (
              <button
                onClick={useHint}
                disabled={hintsUsed >= maxHints}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
              >
                <Lightbulb className="h-4 w-4" />
                Hint ({maxHints - hintsUsed})
              </button>
            )}
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6 w-full max-w-2xl">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Question
              </div>
              <div className="text-lg font-semibold text-[#FF6B3E]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentScenario + 1}/{difficultySettings[difficulty].questionCount}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Lives
              </div>
              <div className="text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {'❤️'.repeat(lives)}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streak}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Clues Found
              </div>
              <div className="text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {discoveredClues.length}
              </div>
            </div>
          </div>

          {/* Scenario Question */}
          {currentScenarioData && (
            <div className="w-full max-w-4xl mb-6">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Search className="h-5 w-5 text-blue-800" />
                  <span className="font-semibold text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Mystery #{currentScenario + 1} - {difficulty} Level
                  </span>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {currentScenarioData.question}
                </h3>
                <p className="text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {currentScenarioData.description}
                </p>
              </div>
            </div>
          )}

          {/* Hint Display */}
          {showHint && (
            <div className="w-full max-w-2xl mb-6">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Hint:
                  </span>
                </div>
                <p className="text-yellow-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                  {hintMessage}
                </p>
              </div>
            </div>
          )}

          {/* Characters */}
          {currentScenarioData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-6">
              {currentScenarioData.characters.map((character) => (
                <div
                  key={character.id}
                  className={`bg-white border-2 rounded-lg p-6 transition-all duration-300 ${
                    selectedCharacter === character.id
                      ? character.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${showFeedback ? 'pointer-events-none' : 'cursor-pointer hover:shadow-lg'}`}
                  //onClick={() => handleCharacterSelect(character.id)}
                >
                  {/* Character Header */}
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{character.emoji}</div>
                    <h4 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {character.name}
                    </h4>
                    <p className="text-sm text-gray-600 italic mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      "{character.statement}"
                    </p>
                  </div>

                  {/* Clue Investigation */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(character.clues).map(([clueType, clue]) => {
                      const clueKey = `${character.id}-${clueType}`;
                      const isDiscovered = discoveredClues.includes(clueKey);
                      
                      return (
                        <button
                          key={clueType}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClueDiscovery(character.id, clueType);
                          }}
                          disabled={showFeedback}
                          className={`p-2 rounded border text-xs transition-colors ${
                            isDiscovered
                              ? clue.suspicious
                                ? 'bg-red-100 border-red-300 text-red-800'
                                : 'bg-green-100 border-green-300 text-green-800'
                              : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                          }`}
                          style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Eye className="h-3 w-3" />
                            <span className="capitalize font-medium">{clueType}</span>
                          </div>
                          {isDiscovered && (
                            <div className="text-xs mt-1">
                              {clue.evidence}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selection Button */}
                  {!showFeedback && (
                    <button
                      onClick={() => handleCharacterSelect(character.id)}
                      className="w-full mt-4 bg-[#FF6B3E] text-white py-2 rounded-lg hover:bg-[#e55a35] transition-colors font-medium"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Select {character.name}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Feedback */}
          {showFeedback && currentScenarioData && (
            <div className={`w-full max-w-2xl text-center p-6 rounded-lg ${
              feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {feedbackType === 'correct' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <div className="text-xl font-semibold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {feedbackType === 'correct' ? 'Correct!' : 'Wrong Choice!'}
                </div>
              </div>
              <div className="text-sm mb-3" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                {currentScenarioData.explanation}
              </div>
              {feedbackType === 'correct' && (
                <div className="text-green-700 font-medium mb-2">
                  +{difficultySettings[difficulty].pointsPerQuestion} points earned!
                </div>
              )}
              {feedbackType === 'correct' && currentScenario + 1 < currentScenarios.length && (
                <p className="text-green-700 font-medium">
                  Moving to next scenario...
                </p>
              )}
              {feedbackType === 'incorrect' && lives > 1 && (
                <p className="text-red-700 font-medium">
                  Lives remaining: {lives - 1}
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl mt-6">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
              Click on character body parts (hands, face, clothes, behavior) to discover clues.
              Look for suspicious evidence that contradicts their statements.
              Use hints wisely to reveal important clues when you're stuck.
            </p>
            <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {difficulty} Mode: {difficultySettings[difficulty].questionCount} questions | 
              {Math.floor(difficultySettings[difficulty].timeLimit / 60)}:
              {String(difficultySettings[difficulty].timeLimit % 60).padStart(2, '0')} time limit |
              {difficultySettings[difficulty].lives} lives | {difficultySettings[difficulty].hints} hints |
              {difficultySettings[difficulty].pointsPerQuestion} points per correct answer
            </div>
          </div>
        </div>
      </GameFramework>
      
      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={score}
      />
    </div>
  );
};

export default WhoIsBrainGame;