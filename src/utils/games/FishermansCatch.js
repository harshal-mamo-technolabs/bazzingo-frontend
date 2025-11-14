export const difficultySettings = {
  Easy: { timeLimit: 160, lives: 3, hints: 2, catchesNeeded: 8, pointsPerCorrect: 25, pointsPerWrong: -10, scenarioTime: 40 },
  Moderate: { timeLimit: 120, lives: 3, hints: 1, catchesNeeded: 5, pointsPerCorrect: 40, pointsPerWrong: -20, scenarioTime: 30 },
  Hard: { timeLimit: 100, lives: 2, hints: 1, catchesNeeded: 4, pointsPerCorrect: 50, pointsPerWrong: -25, scenarioTime: 25 }
};

export const fishTypes = {
  redFish: { emoji: '🐠', color: 'red', size: 'small', type: 'fish', name: 'Red Fish' },
  blueFish: { emoji: '🐟', color: 'blue', size: 'medium', type: 'fish', name: 'Blue Fish' },
  yellowFish: { emoji: '🐡', color: 'yellow', size: 'large', type: 'fish', name: 'Yellow Fish' },
  greenFish: { emoji: '🐟', color: 'green', size: 'medium', type: 'fish', name: 'Green Fish' },
  orangeFish: { emoji: '🐠', color: 'orange', size: 'small', type: 'fish', name: 'Orange Fish' },
  purpleFish: { emoji: '🐟', color: 'purple', size: 'large', type: 'fish', name: 'Purple Fish' },

  shark: { emoji: '🦈', color: 'gray', size: 'large', type: 'danger', name: 'Shark' },
  boot: { emoji: '🥾', color: 'brown', size: 'medium', type: 'junk', name: 'Old Boot' },
  can: { emoji: '🥫', color: 'silver', size: 'small', type: 'junk', name: 'Tin Can' },
  tire: { emoji: '🛞', color: 'black', size: 'large', type: 'junk', name: 'Tire' },
  bottle: { emoji: '🍶', color: 'green', size: 'small', type: 'junk', name: 'Bottle' }
};

const buildAllowedScenarios = (difficulty) => {
  if (difficulty === 'Easy') {
    return [
      { id: 101, instruction: 'Catch only BLUE fish!', description: 'Blue fish are your target - ignore all others.', target: { color: 'blue' }, duration: 40, fishCount: 12, targetRatio: 0.45 },
      { id: 102, instruction: 'Catch only YELLOW fish!', description: 'Bright yellow fish are swimming by!', target: { color: 'yellow' }, duration: 40, fishCount: 12, targetRatio: 0.45 },
      { id: 103, instruction: 'Catch BLUE or YELLOW fish only!', description: 'Either blue or yellow fish count.', target: { color: ['blue', 'yellow'] }, duration: 40, fishCount: 14, targetRatio: 0.4 },
      { id: 104, instruction: 'Catch only SMALL fish!', description: 'Focus on the smallest fish swimming by.', target: { size: 'small' }, duration: 40, fishCount: 13, targetRatio: 0.4 }
    ];
  }
  if (difficulty === 'Moderate') {
    return [
      { id: 201, instruction: 'Catch only LARGE BLUE fish!', description: 'Must be both large AND blue to count.', target: { color: 'blue', size: 'large' }, duration: 30, fishCount: 18, targetRatio: 0.35 },
      { id: 202, instruction: 'Catch only SMALL YELLOW fish!', description: 'Small yellow fish only.', target: { color: 'yellow', size: 'small' }, duration: 30, fishCount: 18, targetRatio: 0.35 },
      { id: 203, instruction: 'Catch BLUE or YELLOW fish only!', description: 'Either blue or yellow fish are acceptable.', target: { color: ['blue', 'yellow'] }, duration: 30, fishCount: 20, targetRatio: 0.4 },
      { id: 204, instruction: 'Catch only MEDIUM-sized fish!', description: 'Not too big, not too small - just medium fish.', target: { size: 'medium' }, duration: 30, fishCount: 19, targetRatio: 0.4 }
    ];
  }
  return [
    { id: 301, instruction: 'Catch SMALL BLUE or LARGE YELLOW fish!', description: 'Two specific combinations allowed.', target: { combinations: [{ size: 'small', color: 'blue' }, { size: 'large', color: 'yellow' }] }, duration: 25, fishCount: 22, targetRatio: 0.3 },
    { id: 302, instruction: 'Catch exactly 2 BLUE fish, then 2 YELLOW fish!', description: 'Specific sequence: blue first, then yellow.', target: { sequence: [{ color: 'blue', count: 2 }, { color: 'yellow', count: 2 }] }, duration: 25, fishCount: 24, targetRatio: 0.28 },
    { id: 303, instruction: 'Catch BLUE or YELLOW fish only!', description: 'Stick to the two target colors.', target: { color: ['blue', 'yellow'] }, duration: 25, fishCount: 24, targetRatio: 0.35 },
    { id: 304, instruction: 'Catch fish that are NOT red and NOT large!', description: 'Avoid red fish and large fish entirely.', target: { avoid: { color: 'red', size: 'large' } }, duration: 25, fishCount: 23, targetRatio: 0.35 }
  ];
};

export const getScenariosByDifficulty = (difficulty) => {
  return buildAllowedScenarios(difficulty) || buildAllowedScenarios('Easy');
};

export const calculateScore = (difficulty, correctCatches, wrongCatches) => {
  const settings = difficultySettings[difficulty];
  const score = (correctCatches * settings.pointsPerCorrect) + (wrongCatches * settings.pointsPerWrong);
  return Math.max(0, Math.min(200, score));
};

export const generateFish = (scenario, currentTime, difficulty) => {
  const fish = [];
  const allFishTypes = Object.entries(fishTypes);

  const targetFish = [];
  const decoyFish = [];
  const badItems = [];

  allFishTypes.forEach(([key, fishData]) => {
    if (fishData.type === 'fish') {
      if (isTargetFish(fishData, scenario.target)) {
        targetFish.push({ key, ...fishData });
      } else {
        decoyFish.push({ key, ...fishData });
      }
    } else {
      badItems.push({ key, ...fishData });
    }
  });

  const targetCount = Math.floor(scenario.fishCount * scenario.targetRatio);
  const decoyCount = Math.floor(scenario.fishCount * 0.4);
  const badCount = scenario.fishCount - targetCount - decoyCount;

  for (let i = 0; i < targetCount; i++) {
    if (targetFish.length > 0) {
      const fishType = targetFish[Math.floor(Math.random() * targetFish.length)];
      fish.push(createFishInstance(fishType, currentTime, difficulty, true));
    }
  }

  for (let i = 0; i < decoyCount; i++) {
    if (decoyFish.length > 0) {
      const fishType = decoyFish[Math.floor(Math.random() * decoyFish.length)];
      fish.push(createFishInstance(fishType, currentTime, difficulty, false));
    }
  }

  for (let i = 0; i < badCount; i++) {
    if (badItems.length > 0) {
      const badItem = badItems[Math.floor(Math.random() * badItems.length)];
      fish.push(createFishInstance(badItem, currentTime, difficulty, false, true));
    }
  }

  return fish.sort(() => Math.random() - 0.5);
};

export const isTargetFish = (fish, target) => {
  if (target.combinations) {
    return target.combinations.some(combo =>
      (!combo.color || fish.color === combo.color) &&
      (!combo.size || fish.size === combo.size)
    );
  }

  if (target.avoid) {
    if (target.avoid.color && fish.color === target.avoid.color) return false;
    if (target.avoid.size && fish.size === target.avoid.size) return false;
    return fish.type === 'fish';
  }

  if (target.color && Array.isArray(target.color)) {
    return target.color.includes(fish.color);
  }

  if (target.size && Array.isArray(target.size)) {
    return target.size.includes(fish.size);
  }

  if (target.color && target.size) {
    return fish.color === target.color && fish.size === target.size;
  }

  if (target.color) {
    return fish.color === target.color;
  }

  if (target.size) {
    return fish.size === target.size;
  }

  return false;
};

const createFishInstance = (fishType, currentTime, difficulty, isTarget, isBad = false) => {
  const speedMultiplier = difficulty === 'Easy' ? 0.7 : difficulty === 'Moderate' ? 1.0 : 1.5;
  const baseSpeed = fishType.size === 'small' ? 2.2 : fishType.size === 'medium' ? 1.8 : 1.3;

  return {
    id: Math.random().toString(36).substr(2, 9),
    ...fishType,
    x: -40,
    y: Math.random() * 300 + 50,
    speed: baseSpeed * speedMultiplier * (0.9 + Math.random() * 0.2),
    isTarget,
    isBad,
    spawTime: currentTime,
    caught: false,
    scale: fishType.size === 'small' ? 0.8 : fishType.size === 'large' ? 1.4 : 1.1
  };
};

export const validateCatch = (fish, scenario, catchSequence) => {
  if (fish.isBad) {
    return { valid: false, reason: `Caught ${fish.name} - dangerous!` };
  }

  if (!fish.isTarget) {
    return { valid: false, reason: `Wrong fish! Caught ${fish.name}` };
  }

  if (scenario.target.sequence) {
    const currentStep = catchSequence.length;
    const expectedStep = scenario.target.sequence[currentStep];

    if (!expectedStep) {
      return { valid: false, reason: 'Already completed sequence!' };
    }

    const matches = (!expectedStep.color || fish.color === expectedStep.color) &&
                   (!expectedStep.size || fish.size === expectedStep.size);

    if (!matches) {
      return { valid: false, reason: `Wrong sequence! Need ${expectedStep.color || ''} ${expectedStep.size || ''} fish` };
    }
  }

  if (scenario.target.alternating) {
    const lastCatch = catchSequence[catchSequence.length - 1];
    if (lastCatch) {
      const expectedSize = scenario.target.alternating.find(size => size !== lastCatch.size);
      if (fish.size !== expectedSize) {
        return { valid: false, reason: `Wrong pattern! Need ${expectedSize} fish next` };
      }
    }
  }

  return { valid: true, reason: `Great catch! ${fish.name}` };
};
