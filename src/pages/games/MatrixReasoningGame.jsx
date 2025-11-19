import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import TranslatedText from '../../components/TranslatedText.jsx';
import { useTranslateText } from '../../hooks/useTranslate';
import {
    Lightbulb,
    CheckCircle,
    XCircle,
    Trophy,
    Target,
    Clock,
    ChevronUp,
    ChevronDown,
    Sparkles,
    Zap,
    Eye,
    Heart
} from 'lucide-react';

// Pattern generation utilities for Matrix Reasoning Game

export const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEEB', '#F0E68C'
];

export const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'];
export const DIRECTIONS = ['up', 'down', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right'];
export const SIZES = ['small', 'medium', 'large'];

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// --- Option de-dup helpers ---
const patternKey = (p) => (p ? `${p.type}:${JSON.stringify(p.props)}` : 'null');

const makeUniqueOptions = (correctAnswer, makeDistractor, target = 4, maxAttempts = 64) => {
    const seen = new Set([patternKey(correctAnswer)]);
    const out = [correctAnswer];
    let attempts = 0;

    while (out.length < target && attempts < maxAttempts) {
        const cand = makeDistractor();
        attempts++;
        if (!cand) continue;
        const key = patternKey(cand);
        if (!seen.has(key)) {
            seen.add(key);
            out.push(cand);
        }
    }
    // last resort: perturb the correct answer slightly
    while (out.length < target && attempts < maxAttempts * 2) {
        const cand = genericPerturbation(correctAnswer);
        attempts++;
        if (!cand) continue;
        const key = patternKey(cand);
        if (!seen.has(key)) {
            seen.add(key);
            out.push(cand);
        }
    }

    return shuffleArray(out);
};

const genericPerturbation = (correct) => {
    if (!correct) return null;
    const { type, props } = correct;

    if (type === 'number') {
        const delta = 1 + Math.floor(Math.random() * 3); // 1..3
        const sign = Math.random() < 0.5 ? -1 : 1;
        return { type, props: { ...props, value: props.value + sign * delta } };
    }

    if (type === 'color') {
        return { type, props: { ...props, color: getRandomColorExcept(props.color) } };
    }

    if (type === 'arrow') {
        return { type, props: { ...props, direction: getRandomDirectionExcept(props.direction) } };
    }

    if (type === 'dots') {
        const v = Math.max(1, props.count + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2)));
        return { type, props: { ...props, count: v } };
    }

    if (type === 'shape') {
        const which = Math.floor(Math.random() * 3); // 0 shape, 1 color, 2 size
        if (which === 0) return { type, props: { ...props, shape: getRandomShapeExcept(props.shape) } };
        if (which === 1) return { type, props: { ...props, color: getRandomColorExcept(props.color) } };
        return {
            type,
            props: { ...props, size: getRandomSizeExcept(props.size), rotation: normalizeRotation((props.rotation || 0) + 45) }
        };
    }
    return null;
};

const normalizeRotation = (deg) => ((deg % 360) + 360) % 360;

const getRandomColorExcept = (exclude) => {
    let c = getRandomColor();
    while (c === exclude) c = getRandomColor();
    return c;
};
const getRandomShapeExcept = (exclude) => {
    let s = getRandomShape();
    while (s === exclude) s = getRandomShape();
    return s;
};
const getRandomSizeExcept = (exclude) => {
    let s = getRandomSize();
    while (s === exclude) s = getRandomSize();
    return s;
};
const getRandomDirectionExcept = (exclude) => {
    let d = getRandomDirection();
    while (d === exclude) d = getRandomDirection();
    return d;
};

const pickDistinctShapes = (n) => {
    const out = [];
    while (out.length < n) {
        const s = getRandomShape();
        if (!out.includes(s)) out.push(s);
    }
    return out;
};

// Generate a random color
export const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

// Generate a random shape
export const getRandomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];

// Generate a random direction
export const getRandomDirection = () => DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

// Generate a random size
export const getRandomSize = () => SIZES[Math.floor(Math.random() * SIZES.length)];

const generateCheckerboardColorPattern = () => {
    const c1 = getRandomColor();
    const c2 = getRandomColorExcept(c1);
    const matrix = [];

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'color', props: { color: ((r + c) % 2 === 0) ? c1 : c2 } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'color', props: { color: ((2 + 2) % 2 === 0) ? c1 : c2 } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => ({ type: 'color', props: { color: getRandomColorExcept(correctAnswer.props.color) } })
    );

    return { matrix, correctAnswer, options };
};

const generateColumnShapePattern = () => {
    const shapes = pickDistinctShapes(3);
    const color = getRandomColor();
    const matrix = [];

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'shape', props: { shape: shapes[c], color, size: 'medium' } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'shape', props: { shape: shapes[2], color, size: 'medium' } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => ({ type: 'shape', props: { shape: getRandomShapeExcept(shapes[2]), color, size: 'medium' } })
    );

    return { matrix, correctAnswer, options };
};

const generateDotsGridIncrementPattern = () => {
    const color = getRandomColor();
    const base = Math.floor(Math.random() * 3) + 1; // 1..3
    const matrix = [];

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'dots', props: { count: base + r + c, color, arrangement: 'linear' } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'dots', props: { count: base + 2 + 2, color, arrangement: 'linear' } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const delta = Math.random() < 0.5 ? -1 : 1;
            const mag = 1 + Math.floor(Math.random() * 2);
            return { type: 'dots', props: { count: Math.max(1, correctAnswer.props.count + delta * mag), color, arrangement: 'linear' } };
        }
    );

    return { matrix, correctAnswer, options };
};

const generateRowDifferencePattern = () => {
    const color = getRandomColor();
    const rows = [];
    const matrix = [];

    for (let r = 0; r < 3; r++) {
        const a = Math.floor(Math.random() * 9) + 1; // 1..10
        const b = Math.floor(Math.random() * 9) + 1;
        rows.push([a, b, Math.abs(a - b)]);
    }

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'number', props: { value: rows[r][c], color } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'number', props: { value: rows[2][2], color } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const delta = 1 + Math.floor(Math.random() * 3);
            const sign = Math.random() < 0.5 ? -1 : 1;
            return { type: 'number', props: { value: Math.max(0, rows[2][2] + sign * delta), color } };
        }
    );

    return { matrix, correctAnswer, options };
};

const generateColumnSumPattern = () => {
    const color = getRandomColor();
    const colVals = [[], [], []]; // three columns

    for (let c = 0; c < 3; c++) {
        const x = Math.floor(Math.random() * 6) + 1;
        const y = Math.floor(Math.random() * 6) + 1;
        colVals[c] = [x, y, x + y];
    }

    const matrix = [];
    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'number', props: { value: colVals[c][r], color } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'number', props: { value: colVals[2][2], color } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const tweaks = [1, 2, 3];
            const delta = tweaks[Math.floor(Math.random() * tweaks.length)];
            const sign = Math.random() < 0.5 ? -1 : 1;
            return { type: 'number', props: { value: colVals[2][2] + sign * delta, color } };
        }
    );

    return { matrix, correctAnswer, options };
};

const generateRowRotationPattern = () => {
    const shape = getRandomShape();
    const color = getRandomColor();
    const base0 = 0;
    const base1 = 30; // slight offset per row
    const base2 = 60;
    const bases = [base0, base1, base2];
    const matrix = [];

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else {
                const rotation = normalizeRotation(bases[r] + c * 90);
                row.push({ type: 'shape', props: { shape, color, size: 'medium', rotation } });
            }
        }
        matrix.push(row);
    }

    const correctRotation = normalizeRotation(bases[2] + 2 * 90);
    const correctAnswer = { type: 'shape', props: { shape, color, size: 'medium', rotation: correctRotation } };

    const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].filter(a => a !== correctRotation);

    const options = makeUniqueOptions(
        correctAnswer,
        () => ({ type: 'shape', props: { shape, color, size: 'medium', rotation: angles[Math.floor(Math.random() * angles.length)] } })
    );

    return { matrix, correctAnswer, options };
};

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];

const generatePrimeSequencePattern = () => {
    const color = getRandomColor();
    const startIdx = Math.floor(Math.random() * (PRIMES.length - 9)); // room for 9
    const seq = PRIMES.slice(startIdx, startIdx + 9);
    const matrix = [];

    let i = 0;
    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'number', props: { value: seq[i++], color } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'number', props: { value: seq[8], color } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const delta = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
            const sign = Math.random() < 0.5 ? -1 : 1;
            return { type: 'number', props: { value: correctAnswer.props.value + sign * delta, color } };
        }
    );

    return { matrix, correctAnswer, options };
};

const triangular = (n) => (n * (n + 1)) / 2;

const generateTriangularSequencePattern = () => {
    const color = getRandomColor();
    const startN = Math.floor(Math.random() * 6) + 2; // 2..7
    const seq = Array.from({ length: 9 }, (_, i) => triangular(startN + i));
    const matrix = [];

    let i = 0;
    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'number', props: { value: seq[i++], color } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'number', props: { value: seq[8], color } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const delta = [1, 2, 3, 5, 8][Math.floor(Math.random() * 5)];
            const sign = Math.random() < 0.5 ? -1 : 1;
            return { type: 'number', props: { value: correctAnswer.props.value + sign * delta, color } };
        }
    );

    return { matrix, correctAnswer, options };
};

const generateParityMultiAttributePattern = () => {
    const shapes = pickDistinctShapes(2); // two shapes alternate by row parity
    const colorA = getRandomColor();
    const colorB = getRandomColorExcept(colorA);
    const sizes = ['small', 'medium', 'large'];
    const matrix = [];

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else {
                const shape = (r % 2 === 0) ? shapes[0] : shapes[1];
                const color = (c % 2 === 0) ? colorA : colorB;
                const size = sizes[(r + c) % 3];
                const rotation = normalizeRotation((r + c) * 45);
                row.push({ type: 'shape', props: { shape, color, size, rotation } });
            }
        }
        matrix.push(row);
    }

    const correctShape = (2 % 2 === 0) ? shapes[0] : shapes[1];
    const correctColor = (2 % 2 === 0) ? colorA : colorB;
    const correctSize = sizes[(2 + 2) % 3];
    const correctRot = normalizeRotation((2 + 2) * 45);

    const correctAnswer = { type: 'shape', props: { shape: correctShape, color: correctColor, size: correctSize, rotation: correctRot } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const tweak = Math.floor(Math.random() * 3);
            if (tweak === 0) return { type: 'shape', props: { ...correctAnswer.props, shape: getRandomShapeExcept(correctAnswer.props.shape) } };
            if (tweak === 1) return { type: 'shape', props: { ...correctAnswer.props, color: getRandomColorExcept(correctAnswer.props.color) } };
            return { type: 'shape', props: { ...correctAnswer.props, size: getRandomSizeExcept(correctAnswer.props.size), rotation: normalizeRotation(correctAnswer.props.rotation + 45) } };
        }
    );

    return { matrix, correctAnswer, options };
};

// Color pattern generator
const generateColorPattern = () => {
    const colors = [getRandomColor(), getRandomColor(), getRandomColor()];
    const matrix = [];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null); // Missing piece
            } else {
                matrixRow.push({
                    type: 'color',
                    props: { color: colors[(row + col) % 3] }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = {
        type: 'color',
        props: { color: colors[(2 + 2) % 3] }
    };

    const options = makeUniqueOptions(
        correctAnswer,
        () => ({ type: 'color', props: { color: getRandomColorExcept(correctAnswer.props.color) } })
    );

    return { matrix, correctAnswer, options };
};

// Shape pattern generator
const generateShapePattern = () => {
    const shapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    const color = getRandomColor();
    const matrix = [];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                matrixRow.push({
                    type: 'shape',
                    props: {
                        shape: shapes[row],
                        color,
                        size: 'medium'
                    }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = {
        type: 'shape',
        props: { shape: shapes[2], color, size: 'medium' }
    };

    const options = makeUniqueOptions(
        correctAnswer,
        () => ({
            type: 'shape',
            props: { shape: getRandomShapeExcept(correctAnswer.props.shape), color, size: 'medium' }
        })
    );

    return { matrix, correctAnswer, options };
};

// Number pattern generator
const generateNumberPattern = () => {
    const start = Math.floor(Math.random() * 5) + 1;
    const increment = Math.floor(Math.random() * 3) + 1;
    const matrix = [];
    const color = getRandomColor();

    let currentNum = start;
    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                matrixRow.push({
                    type: 'number',
                    props: { value: currentNum, color }
                });
                currentNum += increment;
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = {
        type: 'number',
        props: { value: start + (8 * increment), color }
    };

    const deltas = Array.from(new Set([1, 2, 3, increment, increment + 1]));

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const delta = deltas[Math.floor(Math.random() * deltas.length)];
            const sign = Math.random() < 0.5 ? -1 : 1;
            return { type: 'number', props: { value: correctAnswer.props.value + sign * delta, color } };
        }
    );

    return { matrix, correctAnswer, options };
};

// Shape-color combination pattern
const generateShapeColorPattern = () => {
    const shapes = [getRandomShape(), getRandomShape()];
    const colors = [getRandomColor(), getRandomColor()];
    const matrix = [];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                matrixRow.push({
                    type: 'shape',
                    props: {
                        shape: shapes[col % 2],
                        color: colors[row % 2],
                        size: 'medium'
                    }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = {
        type: 'shape',
        props: { shape: shapes[0], color: colors[0], size: 'medium' }
    };

    const pool = [
        { shape: shapes[0], color: colors[1] },
        { shape: shapes[1], color: colors[0] },
        { shape: shapes[1], color: colors[1] }
    ];

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const pick = pool[Math.floor(Math.random() * pool.length)];
            return { type: 'shape', props: { ...pick, size: 'medium' } };
        }
    );

    return { matrix, correctAnswer, options };
};

// Rotation pattern generator
const generateRotationPattern = () => {
    const shape = getRandomShape();
    const color = getRandomColor();
    const matrix = [];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                const rotation = normalizeRotation((row * 3 + col) * 45);
                matrixRow.push({
                    type: 'shape',
                    props: { shape, color, size: 'medium', rotation }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctRotation = normalizeRotation((2 * 3 + 2) * 45);
    const correctAnswer = { type: 'shape', props: { shape, color, size: 'medium', rotation: correctRotation } };

    const allAngles = [0, 45, 90, 135, 180, 225, 270, 315].filter(a => a !== correctRotation);

    const options = makeUniqueOptions(
        correctAnswer,
        () => ({
            type: 'shape',
            props: { shape, color, size: 'medium', rotation: allAngles[Math.floor(Math.random() * allAngles.length)] }
        })
    );

    return { matrix, correctAnswer, options };
};

// Size progression pattern
const generateSizeProgressionPattern = () => {
    const shape = getRandomShape();
    const color = getRandomColor();
    const sizes = ['small', 'medium', 'large'];
    const matrix = [];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                matrixRow.push({
                    type: 'shape',
                    props: { shape, color, size: sizes[col] }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = { type: 'shape', props: { shape, color, size: sizes[2] } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const wrongSize = sizes[Math.floor(Math.random() * 2)]; // small or medium
            const maybeShape = Math.random() < 0.5 ? getRandomShapeExcept(shape) : shape;
            return { type: 'shape', props: { shape: maybeShape, color, size: wrongSize } };
        }
    );

    return { matrix, correctAnswer, options };
};

const generateRowShiftPattern = () => {
    const pool = [];
    while (pool.length < 3) {
        const s = getRandomShape();
        if (!pool.includes(s)) pool.push(s);
    }
    const color = getRandomColor();
    const matrix = [];

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'shape', props: { shape: pool[(c + r) % 3], color, size: 'medium' } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'shape', props: { shape: pool[(2 + 2) % 3], color, size: 'medium' } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => ({ type: 'shape', props: { shape: getRandomShapeExcept(correctAnswer.props.shape), color, size: 'medium' } })
    );

    return { matrix, correctAnswer, options };
};

// Medium: In each row, third number = sum of first two
const generateRowSumPattern = () => {
    const color = getRandomColor();
    const rows = [];
    const matrix = [];
    for (let r = 0; r < 3; r++) {
        const a = Math.floor(Math.random() * 6) + 1;
        const b = Math.floor(Math.random() * 6) + 1;
        rows.push([a, b, a + b]);
    }
    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'number', props: { value: rows[r][c], color } });
        }
        matrix.push(row);
    }
    const correctAnswer = { type: 'number', props: { value: rows[2][2], color } };
    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const delta = 1 + Math.floor(Math.random() * 3);
            const sign = Math.random() < 0.5 ? -1 : 1;
            return { type: 'number', props: { value: rows[2][2] + sign * delta, color } };
        }
    );
    return { matrix, correctAnswer, options };
};

// Medium: 8-direction arrows advancing by 45° each cell
const generateCompassRotationPattern = () => {
    const color = getRandomColor();
    const startIdx = Math.floor(Math.random() * 8); // random starting direction
    const matrix = [];

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else {
                const idx = (startIdx + (r * 3 + c)) % 8;
                row.push({ type: 'arrow', props: { direction: DIRECTIONS[idx], color } });
            }
        }
        matrix.push(row);
    }

    const correctIdx = (startIdx + 8) % 8;
    const correctAnswer = { type: 'arrow', props: { direction: DIRECTIONS[correctIdx], color } };

    const others = DIRECTIONS.filter(d => d !== DIRECTIONS[correctIdx]);
    const options = makeUniqueOptions(
        correctAnswer,
        () => ({ type: 'arrow', props: { direction: others[Math.floor(Math.random() * others.length)], color } })
    );

    return { matrix, correctAnswer, options };
};

// Hard: value(r,c) = base + r*vInc + c*hInc
const generateAffineProgressionPattern = () => {
    const color = getRandomColor();
    const base = Math.floor(Math.random() * 6) + 1;  // 1..6
    const hInc = Math.floor(Math.random() * 3) + 1;  // 1..3
    const vInc = Math.floor(Math.random() * 4) + 2;  // 2..5
    const matrix = [];

    const valueAt = (r, c) => base + r * vInc + c * hInc;

    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else row.push({ type: 'number', props: { value: valueAt(r, c), color } });
        }
        matrix.push(row);
    }

    const correctAnswer = { type: 'number', props: { value: valueAt(2, 2), color } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const tweaks = [1, 2, hInc, vInc];
            const delta = tweaks[Math.floor(Math.random() * tweaks.length)];
            const sign = Math.random() < 0.5 ? -1 : 1;
            return { type: 'number', props: { value: valueAt(2, 2) + sign * delta, color } };
        }
    );

    return { matrix, correctAnswer, options };
};

// Hard: Latin square of three distinct shapes; each row/col has all 3
const generateLatinShapePattern = () => {
    const shapes = [];
    while (shapes.length < 3) {
        const s = getRandomShape();
        if (!shapes.includes(s)) shapes.push(s);
    }
    const color = getRandomColor();
    const matrix = [];
    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else {
                const idx = (r + c) % 3;
                row.push({ type: 'shape', props: { shape: shapes[idx], color, size: 'medium' } });
            }
        }
        matrix.push(row);
    }
    const correctAnswer = { type: 'shape', props: { shape: shapes[(2 + 2) % 3], color, size: 'medium' } };
    const options = makeUniqueOptions(
        correctAnswer,
        () => ({ type: 'shape', props: { shape: getRandomShapeExcept(correctAnswer.props.shape), color, size: 'medium' } })
    );
    return { matrix, correctAnswer, options };
};

// Dots pattern generator
const generateDotsPattern = () => {
    const color = getRandomColor();
    const matrix = [];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                matrixRow.push({
                    type: 'dots',
                    props: {
                        count: row + col + 1,
                        color,
                        arrangement: 'linear'
                    }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = {
        type: 'dots',
        props: { count: 2 + 2 + 1, color, arrangement: 'linear' }
    };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const delta = Math.random() < 0.5 ? -1 : 1;
            const magnitude = 1 + Math.floor(Math.random() * 2);
            const v = Math.max(1, correctAnswer.props.count + delta * magnitude);
            return { type: 'dots', props: { count: v, color, arrangement: 'linear' } };
        }
    );

    return { matrix, correctAnswer, options };
};

// Arrow pattern generator
const generateArrowPattern = () => {
    const color = getRandomColor();
    const directions = ['up', 'right', 'down', 'left'];
    const matrix = [];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                matrixRow.push({
                    type: 'arrow',
                    props: {
                        direction: directions[(row + col) % 4],
                        color
                    }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = {
        type: 'arrow',
        props: { direction: directions[(2 + 2) % 4], color }
    };

    const others = directions.filter(d => d !== correctAnswer.props.direction);

    const options = makeUniqueOptions(
        correctAnswer,
        () => ({ type: 'arrow', props: { direction: others[Math.floor(Math.random() * others.length)], color } })
    );

    return { matrix, correctAnswer, options };
};

// Complex sequence pattern for hard difficulty
const generateComplexSequencePattern = () => {
    const shapes = [getRandomShape(), getRandomShape()];
    const colors = [getRandomColor(), getRandomColor()];
    const matrix = [];

    // Create alternating pattern with both shape and color changes
    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                const shapeIndex = (row + col) % 2;
                const colorIndex = (row * 3 + col) % 2;
                matrixRow.push({
                    type: 'shape',
                    props: {
                        shape: shapes[shapeIndex],
                        color: colors[colorIndex],
                        size: 'medium',
                        rotation: (row * 45) + (col * 15)
                    }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = {
        type: 'shape',
        props: {
            shape: shapes[(2 + 2) % 2],
            color: colors[(2 * 3 + 2) % 2],
            size: 'medium',
            rotation: (2 * 45) + (2 * 15)
        }
    };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const flipShape = Math.random() < 0.5 ? shapes[0] : shapes[1];
            const flipColor = Math.random() < 0.5 ? colors[0] : colors[1];
            const rot = normalizeRotation(correctAnswer.props.rotation + (Math.random() < 0.5 ? -45 : 45));
            return { type: 'shape', props: { shape: flipShape, color: flipColor, size: 'medium', rotation: rot } };
        }
    );

    return { matrix, correctAnswer, options };
};

// Mathematical pattern generator
const generateMathematicalPattern = () => {
    const color = getRandomColor();
    const matrix = [];

    // Fibonacci-like sequence
    const sequence = [1, 1, 2, 3, 5, 8, 13, 21, 34];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                const index = row * 3 + col;
                matrixRow.push({
                    type: 'number',
                    props: { value: sequence[index], color }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = { type: 'number', props: { value: sequence[8], color } };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const choice = Math.random();
            if (choice < 0.5) {
                const idx = 1 + Math.floor(Math.random() * 7);
                return { type: 'number', props: { value: sequence[idx], color } };
            }
            const delta = 1 + Math.floor(Math.random() * 3);
            const sign = Math.random() < 0.5 ? -1 : 1;
            return { type: 'number', props: { value: correctAnswer.props.value + sign * delta, color } };
        }
    );

    return { matrix, correctAnswer, options };
};

const generateMultiAttributePattern = () => {
    const shapes = [getRandomShape(), getRandomShape(), getRandomShape()];
    const colors = [getRandomColor(), getRandomColor(), getRandomColor()];
    const sizes = ['small', 'medium', 'large'];
    const matrix = [];

    for (let row = 0; row < 3; row++) {
        const matrixRow = [];
        for (let col = 0; col < 3; col++) {
            if (row === 2 && col === 2) {
                matrixRow.push(null);
            } else {
                matrixRow.push({
                    type: 'shape',
                    props: {
                        shape: shapes[row],
                        color: colors[col],
                        size: sizes[(row + col) % 3],
                        rotation: col * 90
                    }
                });
            }
        }
        matrix.push(matrixRow);
    }

    const correctAnswer = {
        type: 'shape',
        props: {
            shape: shapes[2],
            color: colors[2],
            size: sizes[(2 + 2) % 3],
            rotation: 2 * 90
        }
    };

    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const s = Math.random() < 0.5 ? shapes[Math.floor(Math.random() * 2)] : getRandomShapeExcept(shapes[2]);
            const c = Math.random() < 0.5 ? colors[Math.floor(Math.random() * 2)] : getRandomColorExcept(colors[2]);
            const sizeIdx = (Math.floor(Math.random() * 3) + 1) % 3; // try not to pick the exact size
            const rot = Math.random() < 0.5 ? 90 : 270;
            return { type: 'shape', props: { shape: s, color: c, size: sizes[sizeIdx], rotation: rot } };
        }
    );

    return { matrix, correctAnswer, options };
};

const generateParityNumberPattern = () => {
    const start = Math.floor(Math.random() * 5) + 1; // 1..5
    const colorOdd = getRandomColor();
    const colorEven = getRandomColorExcept(colorOdd);
    const matrix = [];

    let v = start;
    for (let r = 0; r < 3; r++) {
        const row = [];
        for (let c = 0; c < 3; c++) {
            if (r === 2 && c === 2) row.push(null);
            else {
                row.push({
                    type: 'number',
                    props: { value: v, color: (v % 2 ? colorOdd : colorEven) }
                });
            }
            v++;
        }
        matrix.push(row);
    }

    const target = start + 8;
    const correctAnswer = { type: 'number', props: { value: target, color: (target % 2 ? colorOdd : colorEven) } };

    const deltas = [1, 2, 3];
    const options = makeUniqueOptions(
        correctAnswer,
        () => {
            const delta = deltas[Math.floor(Math.random() * deltas.length)];
            const sign = Math.random() < 0.5 ? -1 : 1;
            const val = target + sign * delta;
            return { type: 'number', props: { value: val, color: (val % 2 ? colorOdd : colorEven) } };
        }
    );

    return { matrix, correctAnswer, options };
};

// Pattern recognition helpers
const patternsMatch = (pattern1, pattern2) => {
    if (!pattern1 || !pattern2) return false;
    if (pattern1.type !== pattern2.type) return false;

    const props1 = pattern1.props;
    const props2 = pattern2.props;

    return JSON.stringify(props1) === JSON.stringify(props2);
};

const MatrixCell = ({
    pattern,
    isEmpty,
    isSelected,
    isCorrect,
    isWrong,
    onClick,
    size = 'normal',
    showHint = false,
    className = ''
}) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'small': return 'w-10 h-10 sm:w-12 sm:h-12';
            case 'large': return 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24';
            default: return 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20';
        }
    };

    const getBackgroundColor = () => {
        if (isCorrect) return 'bg-green-100 border-green-500';
        if (isWrong) return 'bg-red-100 border-red-500';
        if (isSelected) return 'bg-blue-100 border-blue-500';
        if (showHint) return 'bg-yellow-100 border-yellow-500 animate-pulse';
        if (isEmpty) return 'bg-gray-100 border-gray-300 border-dashed';
        return 'bg-white border-gray-200';
    };

    const renderPattern = () => {
        if (!pattern) return null;

        const { type, props } = pattern;

        switch (type) {
            case 'shape':
                return renderShape(props);
            case 'color':
                return renderColor(props);
            case 'number':
                return renderNumber(props);
            case 'arrow':
                return renderArrow(props);
            case 'dots':
                return renderDots(props);
            default:
                return null;
        }
    };

    const renderShape = (props) => {
        const { shape, color, size: shapeSize, rotation } = props;
        const sizeClass = shapeSize === 'small' ? 'w-4 h-4' : shapeSize === 'large' ? 'w-8 h-8' : 'w-6 h-6';

        const shapeStyle = {
            transform: rotation ? `rotate(${rotation}deg)` : 'none',
            transition: 'transform 0.3s ease'
        };

        switch (shape) {
            case 'circle':
                return (
                    <div
                        className={`${sizeClass} rounded-full`}
                        style={{ backgroundColor: color, ...shapeStyle }}
                    />
                );
            case 'square':
                return (
                    <div
                        className={`${sizeClass} rounded-sm`}
                        style={{ backgroundColor: color, ...shapeStyle }}
                    />
                );
            case 'triangle':
                return (
                    <div
                        className={`${sizeClass} flex items-center justify-center`}
                        style={shapeStyle}
                    >
                        <div
                            className="w-0 h-0"
                            style={{
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderBottom: `12px solid ${color}`
                            }}
                        />
                    </div>
                );
            case 'diamond':
                return (
                    <div
                        className={`${sizeClass} flex items-center justify-center`}
                        style={shapeStyle}
                    >
                        <div
                            className="w-4 h-4 transform rotate-45"
                            style={{ backgroundColor: color }}
                        />
                    </div>
                );
            case 'star':
                return (
                    <div
                        className={`${sizeClass} flex items-center justify-center text-lg`}
                        style={{ color, ...shapeStyle }}
                    >
                        ★
                    </div>
                );
            default:
                return null;
        }
    };

    const renderColor = (props) => {
        const { color, pattern: colorPattern } = props;

        if (colorPattern === 'gradient') {
            return (
                <div
                    className="w-8 h-8 rounded-full"
                    style={{
                        background: `linear-gradient(45deg, ${color}, ${color}aa)`
                    }}
                />
            );
        }

        return (
            <div
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color }}
            />
        );
    };

    const renderNumber = (props) => {
        const { value, color } = props;

        return (
            <div
                className="text-2xl font-bold"
                style={{ color }}
            >
                {value}
            </div>
        );
    };

    const renderArrow = (props) => {
        const { direction, color } = props;

        const getArrowSymbol = (dir) => {
            switch (dir) {
                case 'up': return '↑';
                case 'down': return '↓';
                case 'left': return '←';
                case 'right': return '→';
                case 'up-left': return '↖';
                case 'up-right': return '↗';
                case 'down-left': return '↙';
                case 'down-right': return '↘';
                default: return '→';
            }
        };

        return (
            <div
                className="text-3xl font-bold"
                style={{ color }}
            >
                {getArrowSymbol(direction)}
            </div>
        );
    };

    const renderDots = (props) => {
        const { count, color, arrangement } = props;

        if (arrangement === 'dice') {
            return (
                <div className="grid grid-cols-3 gap-1 w-12 h-12 p-1">
                    {Array.from({ length: 9 }, (_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < count ? 'opacity-100' : 'opacity-0'
                                }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center gap-1">
                {Array.from({ length: count }, (_, i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
        );
    };

    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={`
        ${getSizeClasses()}
        ${getBackgroundColor()}
        border-2 rounded-xl
        flex items-center justify-center
        transition-all duration-300
        hover:shadow-lg hover:scale-105
        transform-gpu
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${className}
      `}
        >
            {isEmpty ? (
                <div className="text-gray-400 text-2xl">?</div>
            ) : (
                renderPattern()
            )}
        </button>
    );
};

const MatrixReasoningGame = () => {
    const [gameState, setGameState] = useState('ready');
    const [difficulty, setDifficulty] = useState('Easy');
    
    // Translated strings for dynamic messages
    const excellentPatternText = useTranslateText('Excellent! You found the correct pattern!');
    const incorrectLivesText = useTranslateText('Incorrect! Lives remaining:');
    const correctText = useTranslateText('Correct!');
    const incorrectText = useTranslateText('Incorrect!');
    const [score, setScore] = useState(0);
    const [finalScore, setFinalScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(300);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [maxHints, setMaxHints] = useState(3);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalResponseTime, setTotalResponseTime] = useState(0);
    const [questionStartTime, setQuestionStartTime] = useState(0);
    const [gameDuration, setGameDuration] = useState(0);
    const [gameStartTime, setGameStartTime] = useState(0);

    // Lives system
    const [lives, setLives] = useState(3);
    const [maxLives, setMaxLives] = useState(3);

    // Current puzzle state
    const [currentPuzzle, setCurrentPuzzle] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [isAnswering, setIsAnswering] = useState(false);

    // Simple scoring system based on difficulty
    const pointsPerPuzzle = useMemo(() => {
        switch (difficulty) {
            case 'Easy': return 25;
            case 'Moderate': return 40;
            case 'Hard': return 50;
            default: return 25;
        }
    }, [difficulty]);

    // Difficulty settings with lives
    const difficultySettings = {
        Easy: {
            timeLimit: 150,
            hints: 3,
            questionsPerLevel: 5,
            description: 'Simple shape and color patterns',
            icon: '🟢',
            basePoints: 25,
            totalQuestions: 8,
            lives: 3
        },
        Moderate: {
            timeLimit: 120,
            hints: 2,
            questionsPerLevel: 4,
            description: 'Multi-attribute patterns with rotations',
            icon: '🟡',
            basePoints: 40,
            totalQuestions: 5,
            lives: 2
        },
        Hard: {
            timeLimit: 90,
            hints: 1,
            questionsPerLevel: 3,
            description: 'Complex sequences and mathematical patterns',
            icon: '🔴',
            basePoints: 50,
            totalQuestions: 4,
            lives: 1
        }
    };
    
    // Translated difficulty descriptions
    const easyDescription = useTranslateText('Simple shape and color patterns');
    const moderateDescription = useTranslateText('Multi-attribute patterns with rotations');
    const hardDescription = useTranslateText('Complex sequences and mathematical patterns');
    
    const getDifficultyDescription = (diff) => {
        if (diff === 'Easy') return easyDescription;
        if (diff === 'Moderate') return moderateDescription;
        return hardDescription;
    };

    // Pattern generators by difficulty
    const patternGenerators = {
        Easy: [
            generateColorPattern,
            generateShapePattern,
            generateNumberPattern,
            generateCheckerboardColorPattern,
            generateColumnShapePattern,
            generateDotsGridIncrementPattern,
            generateParityNumberPattern,
            generateRowShiftPattern
        ],
        Moderate: [
            generateShapeColorPattern,
            generateRotationPattern,
            generateSizeProgressionPattern,
            generateDotsPattern,
            generateRowSumPattern,
            generateRowDifferencePattern,
            generateColumnSumPattern,
            generateRowRotationPattern,
            generateCompassRotationPattern
        ],
        Hard: [
            generateComplexSequencePattern,
            generateMathematicalPattern,
            generateMultiAttributePattern,
            generateArrowPattern,
            generatePrimeSequencePattern,
            generateTriangularSequencePattern,
            generateParityMultiAttributePattern,
            generateLatinShapePattern,
            generateAffineProgressionPattern
        ]
    };

    // Generate new puzzle based on difficulty
    const generateNewPuzzle = useCallback(() => {
        // Check if we've completed all questions for this difficulty
        const settings = difficultySettings[difficulty] || difficultySettings.Easy;
        
        if (totalQuestions >= settings.totalQuestions) {
            // Game should end here
            const endTime = Date.now();
            const duration = Math.floor((endTime - gameStartTime) / 1000);
            setGameDuration(duration);
            setFinalScore(score);
            setGameState('finished');
            setShowCompletionModal(true);
            return;
        }

        // Check if lives are exhausted
        if (lives <= 0) {
            const endTime = Date.now();
            const duration = Math.floor((endTime - gameStartTime) / 1000);
            setGameDuration(duration);
            setFinalScore(score);
            setGameState('finished');
            setShowCompletionModal(true);
            return;
        }

        const generators = patternGenerators[difficulty] || patternGenerators.Easy;
        const generator = generators[Math.floor(Math.random() * generators.length)];
        const puzzle = generator();

        setCurrentPuzzle(puzzle);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setShowHint(false);
        setIsAnswering(false);
        setQuestionStartTime(Date.now());
    }, [difficulty, totalQuestions, score, gameStartTime, lives]);

    // Handle answer selection - FIXED TO STOP AT QUESTION LIMIT
    const handleAnswerSelect = (answer, index) => {
        if (showFeedback || gameState !== 'playing' || isAnswering) return;

        setIsAnswering(true);
        setSelectedAnswer(index);

        const responseTime = Math.max(0, Date.now() - questionStartTime);
        setTotalResponseTime(prev => prev + responseTime);

        const isCorrect = patternsMatch(answer, currentPuzzle.correctAnswer);

        // Update question count FIRST
        const newTotalQuestions = totalQuestions + 1;
        setTotalQuestions(newTotalQuestions);

        // Level progression based on questions per level
        const settings = difficultySettings[difficulty] || difficultySettings.Easy;
        if (newTotalQuestions > 0 && newTotalQuestions % settings.questionsPerLevel === 0) {
            setCurrentLevel(prevLevel => prevLevel + 1);
        }

        // SCORING AND LIVES SYSTEM
        if (isCorrect) {
            setScore(prev => Math.min(200, prev + pointsPerPuzzle));
            setCorrectAnswers(prev => prev + 1);
            setFeedbackType('correct');
            setFeedbackMessage(excellentPatternText);
        } else {
            // Lose a life for wrong answer
            const newLives = lives - 1;
            setLives(newLives);
            setFeedbackType('incorrect');
            setFeedbackMessage(`${incorrectLivesText} ${newLives}`);
        }

        setShowFeedback(true);

        // Check if game should end after this question
        if (newTotalQuestions >= settings.totalQuestions || lives - (isCorrect ? 0 : 1) <= 0) {
            setTimeout(() => {
                const endTime = Date.now();
                const duration = Math.floor((endTime - gameStartTime) / 1000);
                setGameDuration(duration);
                setFinalScore(score + (isCorrect ? pointsPerPuzzle : 0));
                setGameState('finished');
                setShowCompletionModal(true);
            }, 2500);
        } else {
            // Auto-advance to next question after delay
            setTimeout(() => {
                if (timeRemaining > 0 && gameState === 'playing') {
                    generateNewPuzzle();
                }
            }, 2500);
        }
    };

    // Use hint
    const useHint = () => {
        if (hintsUsed >= maxHints || gameState !== 'playing' || showHint || isAnswering) return;

        setHintsUsed(prev => prev + 1);
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
                        const endTime = Date.now();
                        const duration = Math.floor((endTime - gameStartTime) / 1000);
                        setGameDuration(duration);
                        setFinalScore(score);
                        setGameState('finished');
                        setShowCompletionModal(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        if (gameState === 'finished') {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [gameState, timeRemaining, gameStartTime, score]);

    // Generate first puzzle when game starts
    useEffect(() => {
        if (gameState === 'playing' && !currentPuzzle) {
            generateNewPuzzle();
        }
    }, [gameState, currentPuzzle, generateNewPuzzle]);

    // Initialize game
    const initializeGame = useCallback(() => {
        const settings = difficultySettings[difficulty] || difficultySettings.Easy;

        setScore(0);
        setFinalScore(0);
        setTimeRemaining(settings.timeLimit);
        setCurrentLevel(1);
        setMaxHints(settings.hints);
        setHintsUsed(0);
        setCorrectAnswers(0);
        setTotalQuestions(0);
        setTotalResponseTime(0);
        setGameDuration(0);
        setShowFeedback(false);
        setSelectedAnswer(null);
        setShowHint(false);
        setIsAnswering(false);
        setCurrentPuzzle(null);
        
        // Initialize lives based on difficulty
        setLives(settings.lives);
        setMaxLives(settings.lives);
    }, [difficulty]);

    const handleStart = () => {
        initializeGame();
        setGameStartTime(Date.now());
        setGameState('playing');
    };

    const handleReset = () => {
        initializeGame();
        setShowCompletionModal(false);
        setGameState('ready');
    };

    const handleGameComplete = (payload) => {
        console.log('Game completed:', payload);
    };

    // Prevent difficulty change during gameplay
    const handleDifficultyChange = (newDifficulty) => {
        if (gameState === 'ready') {
            setDifficulty(newDifficulty);
        }
    };

    const customStats = {
        currentLevel,
        hintsUsed,
        correctAnswers,
        totalQuestions,
        lives,
        maxLives,
        accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        averageResponseTime: totalQuestions > 0 ? Math.round(totalResponseTime / totalQuestions / 1000) : 0
    };

    return (
        <div>
            {gameState === 'ready' && <Header unreadCount={3} />}

            <GameFramework
                gameTitle={<TranslatedText text="Matrix Reasoning" />}
        gameShortDescription={<TranslatedText text="Complete visual patterns by finding the missing piece. Challenge your spatial reasoning and pattern recognition!" />}
                gameDescription={
                    <div className="mx-auto px-1 mb-2">
                        <div className="bg-[#E8E8E8] rounded-lg p-6">
                            {/* Header with toggle icon */}
                            <div
                                className="flex items-center justify-between mb-4 cursor-pointer"
                                onClick={() => setShowInstructions(!showInstructions)}
                            >
                                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    <TranslatedText text="How to Play Matrix Reasoning" />
                                </h3>
                                <span className="text-blue-900 text-xl">
                                    {showInstructions ? (
                                        <ChevronUp className="h-5 w-5 text-blue-900" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-blue-900" />
                                    )}
                                </span>
                            </div>

                            {/* Instructions */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🧩 <TranslatedText text="Objective" />
                                    </h4>
                                    <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <TranslatedText text="Complete the pattern in a 3x3 matrix by finding the logic across rows and columns, then select the missing piece." />
                                    </p>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        🎯 <TranslatedText text="Pattern Types" />
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <strong><TranslatedText text="Easy" />:</strong> <TranslatedText text="Colors and simple shapes (8 questions)" /></li>
                                        <li>• <strong><TranslatedText text="Moderate" />:</strong> <TranslatedText text="Rotations and combinations (5 questions)" /></li>
                                        <li>• <strong><TranslatedText text="Hard" />:</strong> <TranslatedText text="Complex sequences and math (4 questions)" /></li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        ❤️ <TranslatedText text="Lives & Scoring (0-200)" />
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <TranslatedText text="Easy: 3 lives, 25 pts per correct" /></li>
                                        <li>• <TranslatedText text="Moderate: 2 lives, 40 pts per correct" /></li>
                                        <li>• <TranslatedText text="Hard: 1 life, 50 pts per correct" /></li>
                                        <li>• <TranslatedText text="Wrong answers lose a life" /></li>
                                    </ul>
                                </div>

                                <div className='bg-white p-3 rounded-lg'>
                                    <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        💡 <TranslatedText text="Strategy" />
                                    </h4>
                                    <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <li>• <TranslatedText text="Look for row and column patterns" /></li>
                                        <li>• <TranslatedText text="Consider shape, color, size changes" /></li>
                                        <li>• <TranslatedText text="Use hints wisely for complex patterns" /></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                category="Logic"
                gameState={gameState}
                setGameState={setGameState}
                score={gameState === 'finished' ? finalScore : score}
                timeRemaining={timeRemaining}
                difficulty={difficulty}
                setDifficulty={handleDifficultyChange}
                onStart={handleStart}
                onReset={handleReset}
                onGameComplete={handleGameComplete}
                customStats={customStats}
            >
                {/* Game Content */}
                <div className="flex flex-col items-center">
                    {/* Game Controls */}
                    <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                        {/* Progress Display */}
                        {gameState === 'playing' && (
                            <div className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-lg">
                                <span className="text-sm font-medium text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    <TranslatedText text="Progress:" /> {totalQuestions}/{difficultySettings[difficulty].totalQuestions}
                                </span>
                            </div>
                        )}

                        {/* Lives Display */}
                        {gameState === 'playing' && (
                            <div className="flex items-center gap-2 bg-gradient-to-r from-red-100 to-pink-100 px-4 py-2 rounded-lg">
                                <Heart className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    <TranslatedText text="Lives:" /> {lives}/{maxLives}
                                </span>
                            </div>
                        )}

                        {gameState === 'playing' && (
                            <button
                                onClick={useHint}
                                disabled={hintsUsed >= maxHints || showHint || isAnswering}
                                className={`px-4 py-2 rounded-lg transition-all duration-500 flex items-center gap-2 transform hover:scale-110 ${hintsUsed >= maxHints || showHint || isAnswering
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 shadow-lg hover:shadow-2xl animate-pulse'
                                    }`}
                                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
                            >
                                <Lightbulb className="h-4 w-4 animate-bounce" />
                                <TranslatedText text="Hint" /> ({maxHints - hintsUsed})
                            </button>
                        )}
                    </div>

                    {currentPuzzle && (
                        <div className="w-full max-w-4xl">
                            {/* Matrix Display */}
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-200 mb-6">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        <TranslatedText text="Complete the Pattern" />
                                    </h3>
                                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        <TranslatedText text="Find the missing piece that completes the 3×3 matrix pattern" />
                                    </div>
                                </div>

                                {/* 3x3 Matrix Grid */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 max-w-xs sm:max-w-md mx-auto">
                                    {currentPuzzle.matrix.map((row, rowIndex) =>
                                        row.map((cell, colIndex) => {
                                            const index = rowIndex * 3 + colIndex;
                                            const isEmpty = cell === null;
                                            const isLastCell = rowIndex === 2 && colIndex === 2;

                                            return (
                                                <div
                                                    key={index}
                                                    className="relative transform transition-all duration-500 hover:scale-105"
                                                >
                                                    <MatrixCell
                                                        pattern={cell}
                                                        isEmpty={isEmpty}
                                                        size={window.innerWidth < 640 ? "normal" : "large"}
                                                        showHint={showHint && isLastCell}
                                                        className="transform transition-all duration-500 hover:scale-110 hover:shadow-lg"
                                                    />
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Pattern Analysis Hint */}
                                {showHint && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 mb-4 animate-pulse shadow-lg">
                                        <div className="flex items-center mb-2">
                                            <Eye className="h-5 w-5 text-amber-600 mr-2 animate-bounce" />
                                            <span className="font-semibold text-amber-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                <TranslatedText text="Pattern Hint" />
                                            </span>
                                        </div>
                                        <p className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            <TranslatedText text="Look carefully at how the patterns change across rows and columns. The missing piece should follow the same logical progression." />
                                        </p>
                                    </div>
                                )}

                                {/* Answer Options */}
                                <div className="space-y-4">
                                    <h4 className="text-center text-lg font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        <TranslatedText text="Choose the correct answer:" />
                                    </h4>

                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm sm:max-w-2xl mx-auto sm:grid-cols-4">
                                        {currentPuzzle.options.map((option, index) => {
                                            const isSelected = selectedAnswer === index;
                                            const isCorrect = showFeedback && patternsMatch(option, currentPuzzle.correctAnswer);
                                            const isWrong = showFeedback && isSelected && !isCorrect;

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswerSelect(option, index)}
                                                    disabled={showFeedback || isAnswering}
                                                    className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-500 transform hover:scale-110 hover:rotate-1 disabled:cursor-not-allowed shadow-md hover:shadow-xl ${isCorrect
                                                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-100 shadow-2xl shadow-green-300/50 animate-pulse'
                                                        : isWrong
                                                            ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-100 shadow-2xl shadow-red-300/50 animate-shake'
                                                            : isSelected
                                                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg'
                                                                : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-purple-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <div className="mb-2">
                                                            <MatrixCell
                                                                pattern={option}
                                                                size={window.innerWidth < 640 ? "small" : "normal"}
                                                                className="pointer-events-none"
                                                            />
                                                        </div>
                                                        <div className="text-xs sm:text-sm font-medium text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                            <TranslatedText text="Option" /> {String.fromCharCode(65 + index)}
                                                        </div>
                                                    </div>

                                                    {/* Feedback Icons */}
                                                    {showFeedback && isCorrect && (
                                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-1 animate-bounce shadow-lg">
                                                            <CheckCircle className="h-4 w-4 text-white animate-pulse" />
                                                        </div>
                                                    )}
                                                    {showFeedback && isWrong && (
                                                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full p-1 animate-bounce shadow-lg">
                                                            <XCircle className="h-4 w-4 text-white animate-pulse" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Feedback */}
                            {showFeedback && (
                                <div className={`w-full text-center p-6 rounded-xl mb-6 transition-all duration-500 transform animate-fadeIn shadow-2xl ${feedbackType === 'correct'
                                    ? 'bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 border-2 border-green-300 shadow-green-300/50'
                                    : 'bg-gradient-to-r from-red-100 via-pink-100 to-rose-100 border-2 border-red-300 shadow-red-300/50'
                                    }`}>
                                    <div className="flex items-center justify-center gap-3 mb-3">
                                        {feedbackType === 'correct' ? (
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-2 animate-bounce shadow-lg">
                                                <CheckCircle className="h-6 w-6 text-white animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-full p-2 animate-bounce shadow-lg">
                                                <XCircle className="h-6 w-6 text-white animate-pulse" />
                                            </div>
                                        )}
                                        <div className={`text-xl font-bold ${feedbackType === 'correct' ? 'text-green-800' : 'text-red-800'
                                            }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            {feedbackType === 'correct' ? correctText : incorrectText}
                                        </div>
                                    </div>
                                    <div className={`text-lg ${feedbackType === 'correct' ? 'text-green-700' : 'text-red-700'
                                        }`} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                                        <TranslatedText text={feedbackMessage} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </GameFramework>

            <GameCompletionModal
                isOpen={showCompletionModal}
                onClose={() => setShowCompletionModal(false)}
                score={finalScore}
                difficulty={difficulty}
                duration={gameDuration}
                customStats={{
                    correctAnswers,
                    totalQuestions,
                    accuracy: customStats.accuracy,
                    averageResponseTime: customStats.averageResponseTime,
                    hintsUsed,
                    livesRemaining: lives
                }}
            />
        </div>
    );
};

export default MatrixReasoningGame;