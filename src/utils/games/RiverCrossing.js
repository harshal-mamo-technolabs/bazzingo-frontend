// Difficulty settings
export const difficultySettings = {
    Easy: { timeLimit: 300, lives: 5, hints: 3, questionCount: 8, pointsPerQuestion: 25 },
    Moderate: { timeLimit: 240, lives: 4, hints: 2, questionCount: 5, pointsPerQuestion: 40 },
    Hard: { timeLimit: 180, lives: 3, hints: 1, questionCount: 4, pointsPerQuestion: 50 }
  };

// All scenarios data
export const allScenarios = [
    // Easy Level Scenarios (0-7) - 8 questions
    {
      id: 1,
      question: "The Classic Farmer's Dilemma",
      description: "A farmer needs to cross a river with his wolf, goat, and cabbage. The raft can only hold the farmer plus one item at a time.",
      characters: [
        { id: 'farmer', name: 'Farmer', emoji: '👨‍🌾' },
        { id: 'wolf', name: 'Wolf', emoji: '🐺' },
        { id: 'goat', name: 'Goat', emoji: '🐐' },
        { id: 'cabbage', name: 'Cabbage', emoji: '🥬' }
      ],
      rules: [
        "The farmer must operate the raft and be present for each crossing",
        "The raft can only carry the farmer plus one item at a time",
        "The wolf cannot be left alone with the goat (wolf will eat goat)",
        "The goat cannot be left alone with the cabbage (goat will eat cabbage)",
        "The wolf and cabbage can be left alone together safely"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'farmer-wolf', description: 'Farmer takes Wolf first', reasoning: 'Leave goat with cabbage', emoji: '👨‍🌾🐺' },
        { id: 'farmer-goat', description: 'Farmer takes Goat first', reasoning: 'Prevent both conflicts', emoji: '👨‍🌾🐐' },
        { id: 'farmer-cabbage', description: 'Farmer takes Cabbage first', reasoning: 'Leave wolf with goat', emoji: '👨‍🌾🥬' },
        { id: 'farmer-alone', description: 'Farmer goes alone first', reasoning: 'Scout the other side', emoji: '👨‍🌾' }
      ],
      correctMove: 'farmer-goat',
      explanation: "Taking the goat first is correct because it prevents both potential conflicts. The wolf and cabbage can be left alone safely together, but the goat would eat the cabbage or be eaten by the wolf.",
      hint: "Think about which item causes problems with BOTH other items when left behind."
    },
    {
      id: 2,
      question: "Family Bridge Crossing",
      description: "A family of 4 needs to cross a bridge at night. They have one flashlight and the bridge can only hold 2 people at a time.",
      characters: [
        { id: 'dad', name: 'Dad (1 min)', emoji: '👨' },
        { id: 'mom', name: 'Mom (2 min)', emoji: '👩' },
        { id: 'son', name: 'Son (5 min)', emoji: '👦' },
        { id: 'daughter', name: 'Daughter (10 min)', emoji: '👧' }
      ],
      rules: [
        "The bridge can only hold 2 people at a time",
        "They must use the flashlight to cross safely",
        "Someone must bring the flashlight back for the next pair",
        "When two people cross together, they move at the speed of the slower person",
        "Goal: Get everyone across in the shortest time possible"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'dad-mom', description: 'Dad and Mom go first', reasoning: 'Send the two fastest together', emoji: '👨👩' },
        { id: 'dad-son', description: 'Dad and Son go first', reasoning: 'Dad can guide Son', emoji: '👨👦' },
        { id: 'dad-daughter', description: 'Dad and Daughter go first', reasoning: 'Dad helps slowest first', emoji: '👨👧' },
        { id: 'son-daughter', description: 'Son and Daughter go first', reasoning: 'Send slowest together', emoji: '👦👧' }
      ],
      correctMove: 'dad-mom',
      explanation: "Dad and Mom should go first (2 minutes), then Dad returns with flashlight (1 minute), then Son and Daughter go together (10 minutes), then Mom returns (2 minutes), and finally Dad and Mom cross again (2 minutes). Total: 17 minutes.",
      hint: "Start with the two fastest people, so the fastest can shuttle others across efficiently."
    },
    {
      id: 3,
      question: "The Missionary Problem",
      description: "Three missionaries and three cannibals need to cross a river. The boat holds only 2 people at a time.",
      characters: [
        { id: 'm1', name: 'Missionary 1', emoji: '⛪' },
        { id: 'm2', name: 'Missionary 2', emoji: '⛪' },
        { id: 'm3', name: 'Missionary 3', emoji: '⛪' },
        { id: 'c1', name: 'Cannibal 1', emoji: '🪓' },
        { id: 'c2', name: 'Cannibal 2', emoji: '🪓' },
        { id: 'c3', name: 'Cannibal 3', emoji: '🪓' }
      ],
      rules: [
        "The boat can carry at most 2 people at a time",
        "At least one person must operate the boat for each crossing",
        "Cannibals must never outnumber missionaries on either side",
        "If cannibals outnumber missionaries anywhere, the missionaries will be eaten",
        "Both sides must be safe at all times"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'two-missionaries', description: 'Two Missionaries cross first', reasoning: 'Keep missionaries together', emoji: '⛪⛪' },
        { id: 'two-cannibals', description: 'Two Cannibals cross first', reasoning: 'Move cannibals first', emoji: '🪓🪓' },
        { id: 'one-each', description: 'One Missionary and One Cannibal', reasoning: 'Maintain balance', emoji: '⛪🪓' },
        { id: 'one-missionary', description: 'One Missionary alone', reasoning: 'Scout ahead safely', emoji: '⛪' }
      ],
      correctMove: 'two-cannibals',
      explanation: "Two cannibals should cross first, leaving 3 missionaries and 1 cannibal on the starting side (safe), and 2 cannibals on the destination (also safe). Then one cannibal returns to maintain balance.",
      hint: "Consider which group can be safely separated while maintaining the number rule on both sides."
    },
    {
      id: 4,
      question: "The Jealous Husbands",
      description: "Two married couples need to cross a river, but the husbands are very jealous and won't let their wives be alone with the other husband.",
      characters: [
        { id: 'h1', name: 'Husband A', emoji: '👨‍💼' },
        { id: 'w1', name: 'Wife A', emoji: '👩‍💼' },
        { id: 'h2', name: 'Husband B', emoji: '👨‍🔬' },
        { id: 'w2', name: 'Wife B', emoji: '👩‍🔬' }
      ],
      rules: [
        "The boat can carry at most 2 people at a time",
        "At least one person must operate the boat",
        "A wife cannot be with the other husband unless her own husband is present",
        "Husbands can be alone with anyone",
        "Wives can be alone together"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'both-wives', description: 'Both Wives cross together', reasoning: 'Wives can be alone together', emoji: '👩‍💼👩‍🔬' },
        { id: 'both-husbands', description: 'Both Husbands cross together', reasoning: 'Husbands cross first', emoji: '👨‍💼👨‍🔬' },
        { id: 'couple-a', description: 'Couple A crosses together', reasoning: 'Keep one couple together', emoji: '👨‍💼👩‍💼' },
        { id: 'husband-a-alone', description: 'Husband A crosses alone', reasoning: 'Scout ahead safely', emoji: '👨‍💼' }
      ],
      correctMove: 'both-wives',
      explanation: "Both wives should cross first since they can be alone together safely. Then one wife returns, and both husbands cross. The remaining wife returns, and finally both wives cross together.",
      hint: "Start with the people who can safely be alone together on the destination side."
    },
    {
      id: 5,
      question: "The Fragile Items",
      description: "A person needs to transport a lamp, a painting, and a vase across a river. Only 2 items can be in the boat at a time, and some items can't be left together.",
      characters: [
        { id: 'person', name: 'Person', emoji: '👤' },
        { id: 'lamp', name: 'Lamp', emoji: '🪔' },
        { id: 'painting', name: 'Painting', emoji: '🖼️' },
        { id: 'vase', name: 'Vase', emoji: '🏺' }
      ],
      rules: [
        "The person must operate the boat and be present for each crossing",
        "The boat can carry the person plus one item at a time",
        "The lamp and painting cannot be left alone together (lamp heat damages painting)",
        "The vase and lamp cannot be left alone together (lamp vibrations crack vase)",
        "The painting and vase can be left alone together safely"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'person-lamp', description: 'Person takes Lamp first', reasoning: 'Remove lamp from both conflicts', emoji: '👤🪔' },
        { id: 'person-painting', description: 'Person takes Painting first', reasoning: 'Protect valuable painting', emoji: '👤🖼️' },
        { id: 'person-vase', description: 'Person takes Vase first', reasoning: 'Move fragile vase safely', emoji: '👤🏺' },
        { id: 'person-alone', description: 'Person goes alone first', reasoning: 'Scout the crossing route', emoji: '👤' }
      ],
      correctMove: 'person-lamp',
      explanation: "Taking the lamp first is correct because it eliminates both potential conflicts. The painting and vase can be left alone together safely, but the lamp causes problems with both other items.",
      hint: "Which item is involved in multiple conflicts and should be moved first to prevent damage?"
    },
    {
      id: 6,
      question: "The Night Watch",
      description: "Four guards need to cross a dangerous bridge at night with one torch. Different guards take different times to cross.",
      characters: [
        { id: 'guard1', name: 'Guard (1 min)', emoji: '👮‍♂️' },
        { id: 'guard2', name: 'Guard (2 min)', emoji: '👮' },
        { id: 'guard5', name: 'Guard (5 min)', emoji: '👮‍♀️' },
        { id: 'guard10', name: 'Guard (10 min)', emoji: '🛡️' }
      ],
      rules: [
        "The bridge can only hold 2 people at a time",
        "The torch must be carried for safe crossing",
        "When two people cross, they move at the speed of the slower person",
        "The torch must be brought back for the remaining guards",
        "Minimize total crossing time"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'fastest-two', description: 'Two fastest guards (1min, 2min)', reasoning: 'Quick initial crossing', emoji: '👮‍♂️👮' },
        { id: 'slowest-two', description: 'Two slowest guards (5min, 10min)', reasoning: 'Get slow guards across together', emoji: '👮‍♀️🛡️' },
        { id: 'fastest-slowest', description: 'Fastest and slowest (1min, 10min)', reasoning: 'Fast guard helps slow', emoji: '👮‍♂️🛡️' },
        { id: 'middle-guards', description: 'Middle guards (2min, 5min)', reasoning: 'Balance speed and efficiency', emoji: '👮👮‍♀️' }
      ],
      correctMove: 'fastest-two',
      explanation: "The optimal strategy is: 1&2 cross (2min), 1 returns (1min), 5&10 cross (10min), 2 returns (2min), 1&2 cross again (2min). Total: 17 minutes. This minimizes the time by having the fastest guard shuttle others.",
      hint: "Start with the two fastest, so the very fastest can efficiently bring the torch back and forth."
    },
    {
      id: 7,
      question: "The Animal Sanctuary",
      description: "A zookeeper needs to move animals across a river: a cat, a bird, and fish food. The animals have natural predator-prey relationships.",
      characters: [
        { id: 'keeper', name: 'Zookeeper', emoji: '👨‍⚕️' },
        { id: 'cat', name: 'Cat', emoji: '🐱' },
        { id: 'bird', name: 'Bird', emoji: '🐦' },
        { id: 'fish-food', name: 'Fish Food', emoji: '🐠' }
      ],
      rules: [
        "The zookeeper must operate the boat and supervise each crossing",
        "The boat can carry the zookeeper plus one item at a time",
        "The cat cannot be left alone with the bird (cat will hunt bird)",
        "The bird cannot be left alone with the fish food (bird will eat food)",
        "The cat and fish food can be left alone together safely"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'keeper-cat', description: 'Zookeeper takes Cat first', reasoning: 'Remove the main predator', emoji: '👨‍⚕️🐱' },
        { id: 'keeper-bird', description: 'Zookeeper takes Bird first', reasoning: 'Protect the bird from cat', emoji: '👨‍⚕️🐦' },
        { id: 'keeper-food', description: 'Zookeeper takes Fish Food first', reasoning: 'Move food away from bird', emoji: '👨‍⚕️🐠' },
        { id: 'keeper-alone', description: 'Zookeeper goes alone first', reasoning: 'Set up safe space first', emoji: '👨‍⚕️' }
      ],
      correctMove: 'keeper-bird',
      explanation: "Taking the bird first is optimal because it's involved in conflict with the cat (as prey) and with the fish food (as predator). The cat and fish food can safely remain together.",
      hint: "Which animal is both predator and prey in this scenario?"
    },
    {
      id: 8,
      question: "The Chemistry Lab",
      description: "A scientist needs to transport chemicals across a river: acid, base, and a catalyst. Some combinations are dangerous when mixed.",
      characters: [
        { id: 'scientist', name: 'Scientist', emoji: '👩‍🔬' },
        { id: 'acid', name: 'Acid', emoji: '🧪' },
        { id: 'base', name: 'Base', emoji: '⚗️' },
        { id: 'catalyst', name: 'Catalyst', emoji: '🔬' }
      ],
      rules: [
        "The scientist must operate the boat and handle all chemicals",
        "The boat can carry the scientist plus one chemical at a time",
        "Acid and base cannot be left alone together (dangerous reaction)",
        "Acid and catalyst cannot be left alone together (explosive mixture)",
        "Base and catalyst can be left alone together safely"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'scientist-acid', description: 'Scientist takes Acid first', reasoning: 'Remove most dangerous chemical', emoji: '👩‍🔬🧪' },
        { id: 'scientist-base', description: 'Scientist takes Base first', reasoning: 'Neutralize potential reactions', emoji: '👩‍🔬⚗️' },
        { id: 'scientist-catalyst', description: 'Scientist takes Catalyst first', reasoning: 'Move catalyst to safety', emoji: '👩‍🔬🔬' },
        { id: 'scientist-alone', description: 'Scientist goes alone first', reasoning: 'Prepare safe lab space', emoji: '👩‍🔬' }
      ],
      correctMove: 'scientist-acid',
      explanation: "Taking the acid first is correct because it's involved in dangerous reactions with both the base and catalyst. The base and catalyst can be left alone together safely without causing any harmful reactions.",
      hint: "Which chemical is dangerous when combined with BOTH other chemicals?"
    },
    // Medium Level Scenarios (8-12) - 5 questions
    {
      id: 9,
      question: "The Royal Court",
      description: "A king, queen, prince, and two knights need to cross a river. Court protocol must be followed, and the boat holds only 2 people.",
      characters: [
        { id: 'king', name: 'King', emoji: '👑' },
        { id: 'queen', name: 'Queen', emoji: '👸' },
        { id: 'prince', name: 'Prince', emoji: '🤴' },
        { id: 'knight1', name: 'Knight 1', emoji: '⚔️' },
        { id: 'knight2', name: 'Knight 2', emoji: '🛡️' }
      ],
      rules: [
        "The boat can carry at most 2 people at a time",
        "The king cannot be left alone with anyone except the queen or prince",
        "The queen cannot be left alone with the knights unless the king is present",
        "The prince can be with anyone safely",
        "Knights can be alone with each other or the prince",
        "At least one royal (king, queen, or prince) must operate the boat"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'king-queen', description: 'King and Queen cross first', reasoning: 'Royal couple travels together', emoji: '👑👸' },
        { id: 'prince-knight1', description: 'Prince and Knight 1 cross first', reasoning: 'Prince can safely travel with knights', emoji: '🤴⚔️' },
        { id: 'two-knights', description: 'Both Knights cross first', reasoning: 'Clear the way for royals', emoji: '⚔️🛡️' },
        { id: 'king-prince', description: 'King and Prince cross first', reasoning: 'Father and son together', emoji: '👑🤴' }
      ],
      correctMove: 'prince-knight1',
      explanation: "The prince should cross with a knight first because the prince can safely be with anyone. This leaves the king and queen together with one knight, which is acceptable under court protocol.",
      hint: "Which royal family member has the most freedom to travel with non-royals?"
    },
    {
      id: 10,
      question: "The Treasure Hunt",
      description: "Adventurers found treasure: gold, gems, and a magical artifact. They need to cross a underground river, but magic affects some combinations.",
      characters: [
        { id: 'adventurer', name: 'Adventurer', emoji: '🧗‍♂️' },
        { id: 'gold', name: 'Gold', emoji: '💰' },
        { id: 'gems', name: 'Gems', emoji: '💎' },
        { id: 'artifact', name: 'Magic Artifact', emoji: '🔮' }
      ],
      rules: [
        "The adventurer must operate the boat and guard the treasure",
        "The boat can carry the adventurer plus one treasure at a time",
        "The magic artifact cannot be left with gold (turns gold to lead)",
        "The magic artifact cannot be left with gems (gems lose their value)",
        "Gold and gems can be left together safely",
        "The magic artifact's power weakens when alone"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'adventurer-gold', description: 'Adventurer takes Gold first', reasoning: 'Secure the most valuable treasure', emoji: '🧗‍♂️💰' },
        { id: 'adventurer-gems', description: 'Adventurer takes Gems first', reasoning: 'Protect gems from magic', emoji: '🧗‍♂️💎' },
        { id: 'adventurer-artifact', description: 'Adventurer takes Magic Artifact first', reasoning: 'Control the magical item', emoji: '🧗‍♂️🔮' },
        { id: 'adventurer-alone', description: 'Adventurer goes alone first', reasoning: 'Scout for magical dangers', emoji: '🧗‍♂️' }
      ],
      correctMove: 'adventurer-artifact',
      explanation: "Taking the magic artifact first is correct because it causes problems with both gold and gems. Once isolated on the other side, the gold and gems can be left together safely without magical interference.",
      hint: "Which treasure item causes magical problems with multiple other items?"
    },
    {
      id: 11,
      question: "The Time Travelers",
      description: "Time travelers from different eras need to cross a temporal bridge. Some time periods can't coexist safely.",
      characters: [
        { id: 'guide', name: 'Time Guide', emoji: '🕰️' },
        { id: 'caveman', name: 'Caveman', emoji: '🦴' },
        { id: 'knight', name: 'Medieval Knight', emoji: '⚔️' },
        { id: 'future', name: 'Future Human', emoji: '🤖' }
      ],
      rules: [
        "The time guide must operate the temporal bridge",
        "The bridge can carry the guide plus one time traveler",
        "The caveman and future human cannot be alone together (temporal paradox)",
        "The medieval knight and future human cannot be alone together (technology clash)",
        "The caveman and knight can coexist safely",
        "Time distortions occur when the guide isn't present"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'guide-caveman', description: 'Time Guide takes Caveman first', reasoning: 'Move the earliest human first', emoji: '🕰️🦴' },
        { id: 'guide-knight', description: 'Time Guide takes Knight first', reasoning: 'Medieval period is stable', emoji: '🕰️⚔️' },
        { id: 'guide-future', description: 'Time Guide takes Future Human first', reasoning: 'Future tech needs supervision', emoji: '🕰️🤖' },
        { id: 'guide-alone', description: 'Time Guide crosses alone first', reasoning: 'Stabilize temporal field first', emoji: '🕰️' }
      ],
      correctMove: 'guide-knight',
      explanation: "The time guide should take the medieval knight first because the knight can coexist with the caveman safely. This leaves two compatible time periods together while avoiding the temporal paradoxes.",
      hint: "Which time traveler can safely be left with one other without causing temporal issues?"
    },
    {
      id: 12,
      question: "The Space Station",
      description: "Astronauts need to transfer between space stations: a commander, engineer, scientist, and two robots. Some combinations cause system conflicts.",
      characters: [
        { id: 'commander', name: 'Commander', emoji: '👨‍🚀' },
        { id: 'engineer', name: 'Engineer', emoji: '👩‍🔧' },
        { id: 'scientist', name: 'Scientist', emoji: '👨‍🔬' },
        { id: 'robot1', name: 'Robot Alpha', emoji: '🤖' },
        { id: 'robot2', name: 'Robot Beta', emoji: '🦾' }
      ],
      rules: [
        "The shuttle can carry at most 2 beings at a time",
        "Either the commander or engineer must pilot the shuttle",
        "The two robots cannot be alone together (system interference)",
        "The scientist cannot be alone with Robot Beta (incompatible protocols)",
        "The commander can safely be with anyone",
        "The engineer can safely manage both robots"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'commander-engineer', description: 'Commander and Engineer cross first', reasoning: 'Both pilots work together', emoji: '👨‍🚀👩‍🔧' },
        { id: 'commander-scientist', description: 'Commander and Scientist cross first', reasoning: 'Command staff crosses first', emoji: '👨‍🚀👨‍🔬' },
        { id: 'engineer-robot1', description: 'Engineer and Robot Alpha cross first', reasoning: 'Engineer manages robot systems', emoji: '👩‍🔧🤖' },
        { id: 'commander-robot2', description: 'Commander and Robot Beta cross first', reasoning: 'Commander supervises advanced robot', emoji: '👨‍🚀🦾' }
      ],
      correctMove: 'engineer-robot1',
      explanation: "The engineer should cross with Robot Alpha first because the engineer can manage robots safely. This leaves the commander with the scientist and Robot Beta, which is safe since the commander can be with anyone.",
      hint: "Which crew member has special skills for managing the robotic systems safely?"
    },
    {
      id: 13,
      question: "The Magical Elements",
      description: "A wizard needs to transport magical elements: fire, water, earth, and air crystals. Some elemental combinations create dangerous reactions.",
      characters: [
        { id: 'wizard', name: 'Wizard', emoji: '🧙‍♂️' },
        { id: 'fire', name: 'Fire Crystal', emoji: '🔥' },
        { id: 'water', name: 'Water Crystal', emoji: '💧' },
        { id: 'earth', name: 'Earth Crystal', emoji: '🌍' },
        { id: 'air', name: 'Air Crystal', emoji: '💨' }
      ],
      rules: [
        "The wizard must operate the magical boat",
        "The boat can carry the wizard plus one crystal at a time",
        "Fire and water crystals cannot be alone together (steam explosion)",
        "Fire and air crystals cannot be alone together (firestorm)",
        "Water and earth crystals can be together safely (mud formation)",
        "Air and earth crystals can be together safely (dust storms are harmless here)"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'wizard-fire', description: 'Wizard takes Fire Crystal first', reasoning: 'Control the most dangerous element', emoji: '🧙‍♂️🔥' },
        { id: 'wizard-water', description: 'Wizard takes Water Crystal first', reasoning: 'Water can counter other elements', emoji: '🧙‍♂️💧' },
        { id: 'wizard-earth', description: 'Wizard takes Earth Crystal first', reasoning: 'Earth is the most stable element', emoji: '🧙‍♂️🌍' },
        { id: 'wizard-air', description: 'Wizard takes Air Crystal first', reasoning: 'Air enhances magical travel', emoji: '🧙‍♂️💨' }
      ],
      correctMove: 'wizard-fire',
      explanation: "Taking the fire crystal first is correct because it's involved in dangerous reactions with both water and air. Once the fire crystal is isolated, the remaining elements (water, earth, air) can coexist more safely.",
      hint: "Which elemental crystal creates dangerous reactions with multiple other elements?"
    },
    // Hard Level Scenarios (13-16) - 4 questions
    {
      id: 14,
      question: "The Corporate Merger",
      description: "During a corporate merger, executives from competing departments need to cross to a neutral meeting location. Office politics create complex restrictions.",
      characters: [
        { id: 'ceo', name: 'CEO', emoji: '👔' },
        { id: 'cfo', name: 'CFO', emoji: '💼' },
        { id: 'cto', name: 'CTO', emoji: '👩‍💻' },
        { id: 'hr1', name: 'HR Director A', emoji: '👩‍💼' },
        { id: 'hr2', name: 'HR Director B', emoji: '👨‍💼' },
        { id: 'lawyer', name: 'Corporate Lawyer', emoji: '⚖️' }
      ],
      rules: [
        "The boat can carry at most 2 people at a time",
        "Either the CEO or lawyer must be present for any crossing (authority)",
        "The two HR directors cannot be alone together (merger conflicts)",
        "The CFO and CTO cannot be alone together without CEO (budget disputes)",
        "The lawyer can mediate any conflicts",
        "All C-level executives (CEO, CFO, CTO) can be together safely"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'ceo-lawyer', description: 'CEO and Lawyer cross first', reasoning: 'Establish legal authority on both sides', emoji: '👔⚖️' },
        { id: 'ceo-cfo', description: 'CEO and CFO cross first', reasoning: 'Top executives lead the way', emoji: '👔💼' },
        { id: 'lawyer-hr1', description: 'Lawyer and HR Director A cross first', reasoning: 'Legal mediation for HR issues', emoji: '⚖️👩‍💼' },
        { id: 'ceo-hr2', description: 'CEO and HR Director B cross first', reasoning: 'CEO manages HR transition', emoji: '👔👨‍💼' }
      ],
      correctMove: 'ceo-lawyer',
      explanation: "The CEO and lawyer should cross first to establish authority and legal oversight on both sides. This allows the lawyer to return and mediate the complex relationships while the CEO can manage from the destination side.",
      hint: "Which two people can provide leadership and legal authority to handle the complex corporate relationships?"
    },
    {
      id: 15,
      question: "The Quantum Lab",
      description: "Scientists need to transport quantum particles across a dimensional bridge. Quantum entanglement creates complex interaction rules between particles.",
      characters: [
        { id: 'physicist', name: 'Quantum Physicist', emoji: '👩‍🔬' },
        { id: 'particle1', name: 'Quantum Particle A', emoji: '⚛️' },
        { id: 'particle2', name: 'Quantum Particle B', emoji: '🌀' },
        { id: 'particle3', name: 'Quantum Particle C', emoji: '✨' },
        { id: 'detector', name: 'Detector', emoji: '📡' }
      ],
      rules: [
        "The physicist must operate the dimensional bridge",
        "The bridge can carry the physicist plus one item at a time",
        "Particles A and B are quantum entangled - they can't be separated by the bridge",
        "Particle C and the detector cannot be alone together (measurement collapse)",
        "Particles A and C cannot be alone together (quantum interference)",
        "The detector can safely observe Particles A and B together"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'physicist-particle1', description: 'Physicist takes Particle A first', reasoning: 'Start with entangled particle', emoji: '👩‍🔬⚛️' },
        { id: 'physicist-detector', description: 'Physicist takes Detector first', reasoning: 'Set up measurement equipment', emoji: '👩‍🔬📡' },
        { id: 'physicist-particle3', description: 'Physicist takes Particle C first', reasoning: 'Isolate the unstable particle', emoji: '👩‍🔬✨' },
        { id: 'physicist-alone', description: 'Physicist crosses alone first', reasoning: 'Stabilize quantum field first', emoji: '👩‍🔬' }
      ],
      correctMove: 'physicist-detector',
      explanation: "Taking the detector first is optimal because it can safely observe Particles A and B (entangled pair), leaving Particle C alone temporarily. This prevents measurement collapse with Particle C while maintaining quantum entanglement.",
      hint: "Which item can safely interact with the entangled particle pair while avoiding measurement issues?"
    },
    {
      id: 16,
      question: "The Diplomatic Crisis",
      description: "Diplomats from warring nations need to reach peace talks. Historical conflicts and current alliances create complex seating and proximity rules.",
      characters: [
        { id: 'mediator', name: 'UN Mediator', emoji: '🕊️' },
        { id: 'nation1', name: 'Nation A Ambassador', emoji: '🇦' },
        { id: 'nation2', name: 'Nation B Ambassador', emoji: '🇧' },
        { id: 'nation3', name: 'Nation C Ambassador', emoji: '🇨' },
        { id: 'translator1', name: 'Translator 1', emoji: '🗣️' },
        { id: 'translator2', name: 'Translator 2', emoji: '👥' }
      ],
      rules: [
        "The diplomatic shuttle can carry at most 2 people at a time",
        "The UN mediator must be present for any diplomatic crossing",
        "Nations A and B cannot be alone together (active conflict)",
        "Nations B and C cannot be alone together (trade disputes)",
        "Nations A and C can coexist (neutral relations)",
        "Translators can be with anyone and help ease tensions",
        "The mediator can manage any single conflict"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'mediator-nation1', description: 'Mediator and Nation A cross first', reasoning: 'Start with most stable nation', emoji: '🕊️🇦' },
        { id: 'mediator-translator1', description: 'Mediator and Translator 1 cross first', reasoning: 'Establish communication bridge', emoji: '🕊️🗣️' },
        { id: 'mediator-nation3', description: 'Mediator and Nation C cross first', reasoning: 'Position neutral party strategically', emoji: '🕊️🇨' },
        { id: 'translator1-nation2', description: 'Translator 1 and Nation B cross first', reasoning: 'Translator eases Nation B tensions', emoji: '🗣️🇧' }
      ],
      correctMove: 'mediator-nation3',
      explanation: "The mediator should take Nation C first because C can safely coexist with Nation A, creating a stable group. This leaves Nations A, B with translators, where the translators can help manage the A-B conflict until the mediator returns.",
      hint: "Which nation can safely be left with Nation A, creating the most stable grouping for complex diplomatic movements?"
    },
    {
      id: 17,
      question: "The Blockchain Network",
      description: "Cryptocurrency validators need to cross to a new blockchain network. Different consensus mechanisms create compatibility issues.",
      characters: [
        { id: 'admin', name: 'Network Admin', emoji: '👨‍💻' },
        { id: 'pow', name: 'Proof-of-Work Node', emoji: '⛏️' },
        { id: 'pos', name: 'Proof-of-Stake Node', emoji: '💰' },
        { id: 'hybrid', name: 'Hybrid Node', emoji: '🔄' },
        { id: 'validator', name: 'Validator', emoji: '✅' }
      ],
      rules: [
        "The network bridge can carry at most 2 nodes at a time",
        "The network admin must manage all bridge crossings",
        "Proof-of-Work and Proof-of-Stake nodes cannot be alone together (consensus conflict)",
        "Proof-of-Work and Hybrid nodes cannot be alone together (resource competition)",
        "Proof-of-Stake and Hybrid nodes can coexist (similar efficiency)",
        "The validator can verify any node combination",
        "The admin can resolve any single consensus conflict"
      ],
      raftCapacity: 2,
      moves: [
        { id: 'admin-pow', description: 'Admin and PoW Node cross first', reasoning: 'Manage resource-intensive node', emoji: '👨‍💻⛏️' },
        { id: 'admin-validator', description: 'Admin and Validator cross first', reasoning: 'Establish validation system', emoji: '👨‍💻✅' },
        { id: 'admin-hybrid', description: 'Admin and Hybrid Node cross first', reasoning: 'Position flexible node strategically', emoji: '👨‍💻🔄' },
        { id: 'admin-pos', description: 'Admin and PoS Node cross first', reasoning: 'Start with efficient consensus', emoji: '👨‍💻💰' }
      ],
      correctMove: 'admin-validator',
      explanation: "The admin should take the validator first because the validator can verify and stabilize any remaining node combinations. This provides maximum flexibility for managing the complex consensus mechanism conflicts in subsequent crossings.",
      hint: "Which network component can help verify and stabilize different consensus mechanisms?"
    }
  ];

// Get scenarios based on difficulty
export const getScenariosByDifficulty = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return allScenarios.slice(0, 8);      // Scenarios 0–7
    case 'Medium':
      return allScenarios.slice(8, 13);     // Scenarios 8–12
    case 'Hard':
      return allScenarios.slice(13, 17);    // Scenarios 13–16
    default:
      return allScenarios.slice(0, 8);
  }
};

// Calculate score
export const calculateScore = (difficulty, solvedScenarios) => {
  const settings = difficultySettings[difficulty];
  return solvedScenarios * settings.pointsPerQuestion;
};