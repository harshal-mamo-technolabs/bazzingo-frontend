// Equation Generators
export const generateArithmetic = (difficulty) => {
  let equation, answer, hint;
  switch (difficulty) {
    case 'Easy':
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const operations = ['+', '-', '*'];
      const op = operations[Math.floor(Math.random() * operations.length)];
      if (op === '+') {
        answer = a + b;
        equation = `${a} + ${b} = ?`;
        hint = `Add ${a} and ${b}`;
      } else if (op === '-') {
        answer = a - b;
        equation = `${a} - ${b} = ?`;
        hint = `Subtract ${b} from ${a}`;
      } else {
        answer = a * b;
        equation = `${a} × ${b} = ?`;
        hint = `Multiply ${a} by ${b}`;
      }
      break;

    case 'Moderate':
      const num1 = Math.floor(Math.random() * 50) + 10;
      const num2 = Math.floor(Math.random() * 20) + 5;
      const ops = ['+', '-', '*', '/'];
      const operation = ops[Math.floor(Math.random() * ops.length)];
      if (operation === '+') {
        // Missing addend: num1 + ? = sum
        const sum = num1 + num2;
        answer = num2;
        equation = `${num1} + ? = ${sum}`;
        hint = `What number plus ${num1} equals ${sum}?`;
      } else if (operation === '-') {
        // Missing subtrahend: num1 - ? = result
        answer = num2;
        equation = `${num1} - ? = ${num1 - num2}`;
        hint = `What number subtracted from ${num1} equals ${num1 - num2}?`;
      } else if (operation === '*') {
        // Missing multiplier: num1 × ? = product
        answer = num2;
        equation = `${num1} × ? = ${num1 * num2}`;
        hint = `What number multiplied by ${num1} equals ${num1 * num2}?`;
      } else {
        // Missing divisor: (num1 * num2) ÷ ? = num1  → ? = num2
        answer = num2;
        equation = `${num1 * num2} ÷ ? = ${num1}`;
        hint = `What number divides ${num1 * num2} to get ${num1}?`;
      }
      break;

    case 'Hard':
      const patterns = [
        () => {
          const x = Math.floor(Math.random() * 8) + 2;
          answer = x * x;
          equation = `If x² = ${answer}, then x = ?`;
          hint = `Find the square root of ${answer}`;
        },
        () => {
          const x = Math.floor(Math.random() * 10) + 1;
          const y = Math.floor(Math.random() * 10) + 1;
          const sum = x + y;
          const diff = Math.abs(x - y);
          answer = x > y ? x : y;
          equation = `If x + y = ${sum} and |x - y| = ${diff}, find the larger value`;
          hint = `Solve the system: add the equations to find the larger value`;
        },
        () => {
          const first = Math.floor(Math.random() * 5) + 2;
          const ratio = Math.floor(Math.random() * 3) + 2;
          answer = first * Math.pow(ratio, 3);
          equation = `Sequence: ${first}, ${first * ratio}, ${first * ratio * ratio}, ?`;
          hint = `Each term is multiplied by ${ratio}`;
        }
      ];
      patterns[Math.floor(Math.random() * patterns.length)]();
      break;
  }
  return { equation, answer, hint };
};

export const generateAlgebraic = (difficulty) => {
  let equation, answer, hint;
  switch (difficulty) {
    case 'Easy':
      const coeff = Math.floor(Math.random() * 5) + 2;
      const constant = Math.floor(Math.random() * 20) + 5;
      answer = Math.floor(Math.random() * 10) + 1;
      equation = `${coeff}x + ${constant} = ${coeff * answer + constant}`;
      hint = `Subtract ${constant} from both sides, then divide by ${coeff}`;
      break;

    case 'Moderate':
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 10) + 5;
      const c = Math.floor(Math.random() * 5) + 1;
      answer = Math.floor(Math.random() * 8) + 2;
      equation = `${a}x - ${b} = ${c}x + ${a * answer - b - c * answer}`;
      hint = `Move all x terms to one side, constants to the other`;
      break;

    case 'Hard':
      const p = Math.floor(Math.random() * 3) + 2;
      const q = Math.floor(Math.random() * 3) + 2;
      const r = Math.floor(Math.random() * 10) + 5;
      answer = Math.floor(Math.random() * 5) + 2;
      const result = p * answer * answer + q * answer + r;
      equation = `${p}x² + ${q}x + ${r} = ${result}`;
      hint = `This is a quadratic equation. Try factoring or use the quadratic formula`;
      break;
  }
  return { equation, answer, hint };
};

export const generatePattern = (difficulty) => {
  let equation, answer, hint;
  switch (difficulty) {
    case 'Easy':
      const start = Math.floor(Math.random() * 10) + 1;
      const step = Math.floor(Math.random() * 5) + 2;
      answer = start + step * 3;
      equation = `Pattern: ${start}, ${start + step}, ${start + 2 * step}, ?`;
      hint = `Each number increases by ${step}`;
      break;

    case 'Moderate':
      const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
      const startIndex = Math.floor(Math.random() * 6);
      answer = fibonacci[startIndex + 3];
      equation = `Sequence: ${fibonacci[startIndex]}, ${fibonacci[startIndex + 1]}, ${fibonacci[startIndex + 2]}, ?`;
      hint = `Each number is the sum of the two preceding numbers`;
      break;

    case 'Hard':
      const base = Math.floor(Math.random() * 3) + 2;
      answer = Math.pow(base, 4);
      equation = `Powers of ${base}: ${base}, ${base * base}, ${base * base * base}, ?`;
      hint = `Each term is ${base} raised to increasing powers`;
      break;
  }
  return { equation, answer, hint };
};

// Difficulty Config
export const difficultySettings = {
  Easy: { timeLimit: 120, lives: 5, hints: 3, types: ['arithmetic'] },
  Moderate: { timeLimit: 100, lives: 4, hints: 2, types: ['arithmetic', 'algebraic', 'pattern'] },
  Hard: { timeLimit: 80, lives: 3, hints: 1, types: ['arithmetic', 'algebraic', 'pattern'] }
};

// Score Calculator
export const calculateScore = ({ correctAnswers, difficulty }) => {
  let pointsPerCorrect = 0;
  let maxLevels = 0;

  switch (difficulty) {
    case 'Easy':
      pointsPerCorrect = 25;
      maxLevels = 8;
      break;
    case 'Moderate':
      pointsPerCorrect = 40;
      maxLevels = 5;
      break;
    case 'Hard':
      pointsPerCorrect = 50;
      maxLevels = 4;
      break;
  }

  const finalScore = Math.min(correctAnswers * pointsPerCorrect, 200);
  return finalScore;
};

