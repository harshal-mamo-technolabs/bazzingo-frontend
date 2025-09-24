
// Difficulty settings
export const difficultySettings = {
    Easy: { timeLimit: 180, lives: 5, hints: 3, questionCount: 8, pointsPerQuestion: 25 },
    Moderate: { timeLimit: 180, lives: 4, hints: 2, questionCount: 5, pointsPerQuestion: 40 },
    Hard: { timeLimit: 180, lives: 3, hints: 1, questionCount: 4, pointsPerQuestion: 50 }
  };

// All emotion scenarios data
export const allScenarios = [
    // Easy Level - Single Character Emotions (0-7)
    {
      id: 1,
      type: 'single',
      character: {
        name: 'Alex',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '😕', duration: 1000, description: 'Confused and frustrated', phase: 'confusion' },
        { emotion: '🤔', duration: 1200, description: 'Thinking deeply', phase: 'thinking' },
        { emotion: '💡', duration: 800, description: 'Moment of realization', phase: 'realization' },
        { emotion: '😊', duration: 1000, description: 'Happy and satisfied', phase: 'satisfaction' }
      ],
      totalDuration: 4000,
      choices: [
        'Solved a difficult puzzle after struggling',
        'Received unexpected good news',
        'Found a lost item they were looking for',
        'Remembered an important appointment'
      ],
      correctAnswer: 0,
      explanation: 'The progression from confusion to deep thinking to realization to satisfaction clearly indicates solving a challenging problem.',
      hints: [
        'Notice the thinking phase - this suggests mental effort',
        'The "lightbulb moment" is key to identifying the trigger',
        'The satisfaction comes from overcoming a challenge'
      ]
    },
    {
      id: 2,
      type: 'single',
      character: {
        name: 'Maya',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '😰', duration: 1200, description: 'Anxious and worried', phase: 'anxiety' },
        { emotion: '😨', duration: 800, description: 'Peak nervousness', phase: 'peak_stress' },
        { emotion: '😌', duration: 1000, description: 'Relief washing over', phase: 'relief' },
        { emotion: '😊', duration: 1000, description: 'Happy and relieved', phase: 'joy' }
      ],
      totalDuration: 4000,
      choices: [
        'Got a good grade on a test they were worried about',
        'Successfully performed in front of a large audience',
        'Reconciled with a friend after an argument',
        'Avoided getting in trouble for something'
      ],
      correctAnswer: 1,
      explanation: 'The intense anxiety building to peak nervousness followed by relief suggests performing under pressure.',
      hints: [
        'The anxiety builds to a peak - this suggests a performance moment',
        'The immediate relief indicates the stressful event is over',
        'This pattern is common when facing an audience'
      ]
    },
    {
      id: 3,
      type: 'single',
      character: {
        name: 'Jordan',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '😢', duration: 1000, description: 'Sad and disappointed', phase: 'sadness' },
        { emotion: '🥺', duration: 1000, description: 'Hopeful but uncertain', phase: 'hope' },
        { emotion: '😮', duration: 800, description: 'Surprised', phase: 'surprise' },
        { emotion: '😄', duration: 1200, description: 'Extremely happy', phase: 'elation' }
      ],
      totalDuration: 4000,
      choices: [
        'Won a competition they thought they lost',
        'Got accepted to their dream school',
        'Received an unexpected gift from someone special',
        'Found out their pet was going to be okay'
      ],
      correctAnswer: 0,
      explanation: 'The journey from sadness through hope to surprise and extreme joy suggests an unexpected victory.',
      hints: [
        'The initial sadness suggests they thought something was lost',
        'The surprise element is crucial - something unexpected happened',
        'The extreme joy indicates a reversal of fortune'
      ]
    },
    {
      id: 4,
      type: 'single',
      character: {
        name: 'Sam',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '😬', duration: 1000, description: 'Uncomfortable and awkward', phase: 'discomfort' },
        { emotion: '😅', duration: 1200, description: 'Nervous laughter', phase: 'nervousness' },
        { emotion: '😄', duration: 800, description: 'Genuine laughter', phase: 'amusement' },
        { emotion: '🤣', duration: 1000, description: 'Uncontrollable laughter', phase: 'hilarity' }
      ],
      totalDuration: 4000,
      choices: [
        'Heard a funny comment that broke the tension',
        'Successfully told a joke to impress someone',
        'Watched a funny video during a serious moment',
        'Realized they were overreacting to something silly'
      ],
      correctAnswer: 0,
      explanation: 'The progression from discomfort through nervous laughter to genuine hilarity suggests humor breaking tension.',
      hints: [
        'The initial discomfort suggests an awkward situation',
        'The transition through nervous to genuine laughter is key',
        'Something external seemed to break the tension'
      ]
    },
    {
      id: 5,
      type: 'single',
      character: {
        name: 'Riley',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '😑', duration: 1000, description: 'Bored and uninterested', phase: 'boredom' },
        { emotion: '🙄', duration: 800, description: 'Eye-rolling skepticism', phase: 'skepticism' },
        { emotion: '😯', duration: 1000, description: 'Suddenly interested', phase: 'interest' },
        { emotion: '🤩', duration: 1200, description: 'Amazed and excited', phase: 'amazement' }
      ],
      totalDuration: 4000,
      choices: [
        'Discovered something unexpectedly awesome',
        'Met their favorite celebrity by surprise',
        'Found out they won a contest they forgot about',
        'Learned their friend had a hidden talent'
      ],
      correctAnswer: 0,
      explanation: 'The shift from boredom and skepticism to sudden amazement indicates discovering something unexpectedly impressive.',
      hints: [
        'The initial boredom suggests low expectations',
        'The eye-rolling shows they were dismissive at first',
        'The dramatic shift to amazement suggests surprise discovery'
      ]
    },
    {
      id: 6,
      type: 'single',
      character: {
        name: 'Casey',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '😊', duration: 1000, description: 'Happy and content', phase: 'happiness' },
        { emotion: '😕', duration: 1000, description: 'Slight concern', phase: 'concern' },
        { emotion: '😰', duration: 1200, description: 'Growing worry', phase: 'worry' },
        { emotion: '😱', duration: 800, description: 'Shock and panic', phase: 'panic' }
      ],
      totalDuration: 4000,
      choices: [
        'Noticed a mistake during an important interview',
        'Realized they forgot something crucial',
        'Saw someone they were trying to avoid',
        'Got caught doing something they shouldn\'t'
      ],
      correctAnswer: 0,
      explanation: 'The gradual decline from happiness to panic suggests realizing a serious mistake in a high-stakes situation.',
      hints: [
        'They started happy, suggesting things were going well',
        'The gradual realization pattern suggests discovering an error',
        'The final panic suggests high stakes or importance'
      ]
    },
    {
      id: 7,
      type: 'single',
      character: {
        name: 'Taylor',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '🤨', duration: 1000, description: 'Suspicious and questioning', phase: 'suspicion' },
        { emotion: '😮', duration: 800, description: 'Realization dawning', phase: 'realization' },
        { emotion: '😤', duration: 1000, description: 'Indignant and upset', phase: 'indignation' },
        { emotion: '😠', duration: 1200, description: 'Angry and frustrated', phase: 'anger' }
      ],
      totalDuration: 4000,
      choices: [
        'Found out someone was lying to them',
        'Discovered they were being pranked',
        'Realized someone took credit for their work',
        'Caught someone going through their things'
      ],
      correctAnswer: 0,
      explanation: 'The progression from suspicion to realization to indignation and anger suggests discovering deception.',
      hints: [
        'The initial suspicion suggests something seemed off',
        'The realization moment is when the truth becomes clear',
        'The growing anger suggests betrayal of trust'
      ]
    },
    {
      id: 8,
      type: 'single',
      character: {
        name: 'Morgan',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '😔', duration: 1200, description: 'Feeling down and dejected', phase: 'dejection' },
        { emotion: '🙂', duration: 1000, description: 'Small smile appearing', phase: 'hope' },
        { emotion: '😊', duration: 800, description: 'Growing happiness', phase: 'joy' },
        { emotion: '🥰', duration: 1000, description: 'Feeling loved and appreciated', phase: 'love' }
      ],
      totalDuration: 4000,
      choices: [
        'Saw a friend after years of being apart',
        'Received an unexpected compliment',
        'Got a surprise visit from family',
        'Found an old photo with happy memories'
      ],
      correctAnswer: 0,
      explanation: 'The transition from dejection to growing joy to feeling loved suggests an emotional reunion.',
      hints: [
        'They started feeling down and lonely',
        'The gradual warming suggests human connection',
        'The final loving feeling suggests deep emotional bond'
      ]
    },
    
    // Moderate Level - Complex Single Characters (8-14)
    {
      id: 9,
      type: 'single',
      character: {
        name: 'Avery',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '😌', duration: 800, description: 'Calm and confident', phase: 'confidence' },
        { emotion: '😬', duration: 1000, description: 'Growing tension', phase: 'tension' },
        { emotion: '😅', duration: 1000, description: 'Nervous but trying', phase: 'effort' },
        { emotion: '😎', duration: 800, description: 'Cool and accomplished', phase: 'success' },
        { emotion: '🤗', duration: 1400, description: 'Warm and embracing', phase: 'celebration' }
      ],
      totalDuration: 5000,
      choices: [
        'Successfully asked someone out on a date',
        'Gave a presentation that went better than expected',
        'Stood up to a bully for the first time',
        'Performed on stage despite stage fright'
      ],
      correctAnswer: 0,
      explanation: 'The journey from confidence through tension and nervous effort to cool success and warm embrace suggests a romantic achievement.',
      hints: [
        'Started confident but tension built up',
        'The nervous effort suggests pushing through fear',
        'The cool success followed by warm embrace suggests interpersonal victory'
      ]
    },
    {
      id: 10,
      type: 'single',
      character: {
        name: 'Quinn',
        baseEmoji: '😐'
      },
      emotionSequence: [
        { emotion: '🤔', duration: 1000, description: 'Deep in thought', phase: 'contemplation' },
        { emotion: '😰', duration: 1200, description: 'Anxious about decision', phase: 'anxiety' },
        { emotion: '😤', duration: 800, description: 'Determined resolve', phase: 'determination' },
        { emotion: '😢', duration: 1000, description: 'Sad but necessary tears', phase: 'sadness' },
        { emotion: '😌', duration: 1000, description: 'Peaceful acceptance', phase: 'peace' }
      ],
      totalDuration: 5000,
      choices: [
        'Decided to end a toxic relationship',
        'Chose to quit a job they hated',
        'Made the hard choice to move away from home',
        'Decided to confront a difficult family issue'
      ],
      correctAnswer: 0,
      explanation: 'The emotional journey from contemplation through anxiety and determination to sad acceptance suggests ending something harmful but difficult to let go.',
      hints: [
        'Deep thought suggests a major life decision',
        'The anxiety shows the difficulty of the choice',
        'Sadness followed by peace suggests letting go of something toxic'
      ]
    },

    // Hard Level - Multiple Characters (15-19)
    {
      id: 11,
      type: 'group',
      characters: [
        {
          name: 'Chris',
          baseEmoji: '😐',
          emotionSequence: [
            { emotion: '😊', duration: 1000, description: 'Happy and proud', phase: 'pride' },
            { emotion: '😕', duration: 1000, description: 'Noticing something wrong', phase: 'concern' },
            { emotion: '😔', duration: 1500, description: 'Disappointed and hurt', phase: 'hurt' }
          ]
        },
        {
          name: 'Jamie',
          baseEmoji: '😐',
          emotionSequence: [
            { emotion: '😒', duration: 1000, description: 'Feeling left out', phase: 'resentment' },
            { emotion: '😠', duration: 1000, description: 'Growing jealous', phase: 'jealousy' },
            { emotion: '😤', duration: 1500, description: 'Defensive and defiant', phase: 'defiance' }
          ]
        }
      ],
      totalDuration: 3500,
      choices: [
        'Chris got recognition that Jamie felt they deserved',
        'Chris succeeded at something Jamie had failed at',
        'Chris was chosen for something Jamie wanted',
        'Chris received praise while Jamie was ignored'
      ],
      correctAnswer: 0,
      explanation: 'Chris shows pride turning to hurt disappointment, while Jamie displays resentment and jealousy, suggesting recognition given to the wrong person.',
      hints: [
        'Chris starts proud but ends hurt - suggests their joy was ruined',
        'Jamie shows clear jealousy and resentment patterns',
        'This dynamic suggests competition over recognition or reward'
      ]
    },
    {
      id: 12,
      type: 'group',
      characters: [
        {
          name: 'Alex',
          baseEmoji: '😐',
          emotionSequence: [
            { emotion: '🤔', duration: 1000, description: 'Contemplating carefully', phase: 'thinking' },
            { emotion: '😊', duration: 1500, description: 'Happy to help', phase: 'kindness' },
            { emotion: '😌', duration: 1000, description: 'Satisfied with choice', phase: 'satisfaction' }
          ]
        },
        {
          name: 'Sam',
          baseEmoji: '😐',
          emotionSequence: [
            { emotion: '😰', duration: 1000, description: 'Worried and desperate', phase: 'desperation' },
            { emotion: '🥺', duration: 1500, description: 'Hopeful and grateful', phase: 'gratitude' },
            { emotion: '😭', duration: 1000, description: 'Overwhelmed with relief', phase: 'relief' }
          ]
        }
      ],
      totalDuration: 3500,
      choices: [
        'Alex lent money to Sam who was in financial trouble',
        'Alex offered to help Sam with a difficult project',
        'Alex shared their lunch with hungry Sam',
        'Alex gave Sam their notes before an important test'
      ],
      correctAnswer: 0,
      explanation: 'Alex shows thoughtful consideration before happy helpfulness, while Sam displays desperation turning to overwhelming gratitude and relief, suggesting significant financial help.',
      hints: [
        'Alex took time to think - suggests a big decision',
        'Sam shows desperation turning to overwhelming relief',
        'The intensity of Sam\'s gratitude suggests major help with serious problem'
      ]
    },
    {
  id: 13,
  type: 'single',
  character: {
    name: 'Lena',
    baseEmoji: '😐'
  },
  emotionSequence: [
    { emotion: '😳', duration: 800, description: 'Embarrassed and caught off-guard', phase: 'embarrassment' },
    { emotion: '😬', duration: 1000, description: 'Trying to recover', phase: 'awkwardness' },
    { emotion: '😅', duration: 1000, description: 'Nervous laughter', phase: 'humor' },
    { emotion: '😂', duration: 1200, description: 'Finding the situation funny', phase: 'amusement' },
    { emotion: '😄', duration: 1000, description: 'Genuinely happy', phase: 'relief' }
  ],
  totalDuration: 5000,
  choices: [
    'Accidentally tripped in public and laughed it off',
    'Was roasted by friends during a game night',
    'Forgot their lines during a play and improvised',
    'Spilled something on themselves during a date'
  ],
  correctAnswer: 0,
  explanation: 'Initial embarrassment followed by recovery and genuine laughter suggests someone handling a minor public accident with humor.',
  hints: [
    'Notice the progression from awkwardness to laughter',
    'The emotion shift suggests they found it funny later',
    'This usually happens when someone trips or goofs'
  ]
    },
    {
  id: 14,
  type: 'single',
  character: {
    name: 'Noah',
    baseEmoji: '😐'
  },
  emotionSequence: [
    { emotion: '😒', duration: 1000, description: 'Mild annoyance', phase: 'annoyance' },
    { emotion: '😤', duration: 1000, description: 'Building frustration', phase: 'frustration' },
    { emotion: '😠', duration: 1000, description: 'Angry but contained', phase: 'anger' },
    { emotion: '😓', duration: 1000, description: 'Letting go', phase: 'release' },
    { emotion: '😌', duration: 1000, description: 'Calm and peaceful again', phase: 'calm' }
  ],
  totalDuration: 5000,
  choices: [
    'Handled a rude comment without reacting',
    'Lost a game but chose not to argue',
    'Dealt with a noisy neighbor calmly',
    'Faced constant interruptions during a call'
  ],
  correctAnswer: 0,
  explanation: 'The path from frustration to calmness shows emotional control after being provoked, like someone deciding not to retaliate.',
  hints: [
    'Anger is present but never explodes',
    'Ending in calm means the situation was de-escalated',
    'They clearly decided not to react outwardly'
  ]
    },
    {
  id: 15,
  type: 'group',
  characters: [
    {
      name: 'Leo',
      baseEmoji: '😐',
      emotionSequence: [
        { emotion: '😇', duration: 1000, description: 'Feeling innocent and justified', phase: 'justification' },
        { emotion: '😕', duration: 1000, description: 'Confused by reaction', phase: 'confusion' },
        { emotion: '😔', duration: 1500, description: 'Feeling misunderstood', phase: 'hurt' }
      ]
    },
    {
      name: 'Mira',
      baseEmoji: '😐',
      emotionSequence: [
        { emotion: '😠', duration: 1000, description: 'Angry and confrontational', phase: 'anger' },
        { emotion: '😤', duration: 1000, description: 'Defensive and upset', phase: 'frustration' },
        { emotion: '🙄', duration: 1500, description: 'Dismissive', phase: 'dismissal' }
      ]
    }
  ],
  totalDuration: 3500,
  choices: [
    'Leo made a joke Mira didn’t find funny',
    'Leo accidentally spilled a secret Mira told',
    'Leo got praise for a project Mira helped on',
    'Leo stood up for someone Mira disliked'
  ],
  correctAnswer: 2,
  explanation: 'Leo’s confusion and hurt suggest he didn’t expect backlash. Mira’s defensiveness and eye-roll indicate she felt ignored or undervalued.',
  hints: [
    'Leo’s emotions suggest surprise and disappointment',
    'Mira’s defensiveness hints at a deeper frustration',
    'This often happens when recognition is unequal'
  ]
    },
    {
  id: 16,
  type: 'group',
  characters: [
    {
      name: 'Zane',
      baseEmoji: '😐',
      emotionSequence: [
        { emotion: '😟', duration: 1000, description: 'Worried about outcome', phase: 'worry' },
        { emotion: '😅', duration: 1000, description: 'Relieved but nervous', phase: 'relief' },
        { emotion: '😎', duration: 1500, description: 'Proud and cool', phase: 'confidence' }
      ]
    },
    {
      name: 'Ivy',
      baseEmoji: '😐',
      emotionSequence: [
        { emotion: '😐', duration: 1000, description: 'Neutral', phase: 'neutral' },
        { emotion: '🙂', duration: 1000, description: 'Supportive smile', phase: 'support' },
        { emotion: '🤩', duration: 1500, description: 'Excited and proud', phase: 'admiration' }
      ]
    }
  ],
  totalDuration: 3500,
  choices: [
    'Zane performed well in front of Ivy for the first time',
    'Zane fixed a problem Ivy was struggling with',
    'Zane helped Ivy win something important',
    'Zane gave Ivy a special surprise gift'
  ],
  correctAnswer: 0,
  explanation: 'Zane’s emotional arc shows anxiety turning into confidence, and Ivy’s admiration reinforces the idea of performance being appreciated.',
  hints: [
    'Zane felt pressure at first — likely performing',
    'Ivy was neutral then impressed — showing admiration',
    'This is typical when someone shows off a skill'
  ]
    },
    {
  id: 17,
  type: 'group',
  characters: [
    {
      name: 'Nina',
      baseEmoji: '😐',
      emotionSequence: [
        { emotion: '🙂', duration: 1000, description: 'Optimistic and hopeful', phase: 'optimism' },
        { emotion: '😟', duration: 1000, description: 'Worried by reaction', phase: 'concern' },
        { emotion: '😞', duration: 1500, description: 'Feeling discouraged', phase: 'disappointment' }
      ]
    },
    {
      name: 'Sara',
      baseEmoji: '😐',
      emotionSequence: [
        { emotion: '😑', duration: 1000, description: 'Emotionally neutral', phase: 'detached' },
        { emotion: '🙁', duration: 1000, description: 'Mildly annoyed', phase: 'bothered' },
        { emotion: '😒', duration: 1500, description: 'Dismissive and uninterested', phase: 'dismissal' }
      ]
    }
  ],
  totalDuration: 3500,
  choices: [
    'Nina excitedly shared an idea, but Sara dismissed it',
    'Nina tried to reconnect with Sara after a fight',
    'Nina gave a gift that Sara didn’t care for',
    'Nina made a joke that didn’t land with Sara'
  ],
  correctAnswer: 0,
  explanation: 'Nina’s growing disappointment and Sara’s increasing detachment suggest a situation where enthusiasm was met with cold disinterest.',
  hints: [
    'Nina starts positive but ends hurt',
    'Sara’s neutrality becomes dismissive',
    'Classic dynamic when someone shuts down excitement'
  ]
}

];

  // Get scenarios based on difficulty level
export const getScenariosByDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return allScenarios.slice(0, 8); // First 8 scenarios
      case 'Moderate':
        return allScenarios.slice(8, 13); // Scenarios 8-10 (complex single characters)
      case 'Hard':
        return allScenarios.slice(13, 17); // Scenarios 11-12 (group dynamics)
      default:
        return allScenarios.slice(0, 8);
    }
  };


// Calculate score
export const calculateScore = (difficulty, solvedScenarios) => {
  const settings = difficultySettings[difficulty];
  return solvedScenarios * settings.pointsPerQuestion;
};