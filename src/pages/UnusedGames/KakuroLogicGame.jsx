import React, { useState, useEffect, useCallback } from 'react';
import GameFramework from '../../components/GameFramework';
import Header from '../../components/Header';
import GameCompletionModal from '../../components/games/GameCompletionModal';
import { Lightbulb, Eraser, Eye, EyeOff, ChevronUp, ChevronDown, AlertCircle, CheckCircle, Plus } from 'lucide-react';

class KakuroGenerator {
  constructor() {
    this.size = 10;
    this.empty = 0;
    this.clue = -1;
    this.blocked = -2;
  }

  // Create an empty grid
  createEmptyGrid() {
    return Array(this.size).fill(null).map(() => Array(this.size).fill(0));
  }

  // Generate a basic Kakuro puzzle
  generatePuzzle(difficulty = 'Easy') {
    const grid = this.createEmptyGrid();
    const clues = {};
    const solution = this.createEmptyGrid();
    
    // Define puzzle patterns based on difficulty
    const patterns = this.getPuzzlePatterns(difficulty);
    
    // Apply the pattern to create the grid structure
    this.applyPattern(grid, solution, clues, patterns);
    
    return {
      puzzle: grid,
      solution: solution,
      clues: clues
    };
  }

  // Get puzzle patterns for different difficulties
  getPuzzlePatterns(difficulty) {
    const patterns = {
      'Easy': {
        runs: [
          { type: 'horizontal', row: 1, startCol: 1, length: 3, sum: 12 },
          { type: 'horizontal', row: 1, startCol: 5, length: 2, sum: 8 },
          { type: 'horizontal', row: 2, startCol: 0, length: 2, sum: 7 },
          { type: 'horizontal', row: 2, startCol: 3, length: 4, sum: 18 },
          { type: 'horizontal', row: 3, startCol: 1, length: 2, sum: 9 },
          { type: 'horizontal', row: 3, startCol: 4, length: 3, sum: 15 },
          { type: 'horizontal', row: 4, startCol: 0, length: 3, sum: 11 },
          { type: 'horizontal', row: 4, startCol: 5, length: 2, sum: 5 },
          { type: 'horizontal', row: 5, startCol: 2, length: 3, sum: 14 },
          { type: 'vertical', col: 0, startRow: 2, length: 3, sum: 13 },
          { type: 'vertical', col: 1, startRow: 1, length: 3, sum: 16 },
          { type: 'vertical', col: 2, startRow: 1, length: 5, sum: 25 },
          { type: 'vertical', col: 3, startRow: 2, length: 2, sum: 8 },
          { type: 'vertical', col: 4, startRow: 3, length: 2, sum: 7 },
          { type: 'vertical', col: 5, startRow: 1, length: 4, sum: 20 },
          { type: 'vertical', col: 6, startRow: 1, length: 4, sum: 17 }
        ]
      },
      'Medium': {
        runs: [
          { type: 'horizontal', row: 0, startCol: 2, length: 4, sum: 22 },
          { type: 'horizontal', row: 1, startCol: 1, length: 2, sum: 9 },
          { type: 'horizontal', row: 1, startCol: 4, length: 3, sum: 16 },
          { type: 'horizontal', row: 2, startCol: 0, length: 3, sum: 15 },
          { type: 'horizontal', row: 2, startCol: 4, length: 4, sum: 26 },
          { type: 'horizontal', row: 3, startCol: 1, length: 4, sum: 19 },
          { type: 'horizontal', row: 3, startCol: 6, length: 2, sum: 11 },
          { type: 'horizontal', row: 4, startCol: 0, length: 2, sum: 6 },
          { type: 'horizontal', row: 4, startCol: 3, length: 3, sum: 17 },
          { type: 'horizontal', row: 5, startCol: 2, length: 4, sum: 21 },
          { type: 'vertical', col: 0, startRow: 2, length: 3, sum: 14 },
          { type: 'vertical', col: 1, startRow: 1, length: 3, sum: 18 },
          { type: 'vertical', col: 2, startRow: 0, length: 6, sum: 30 },
          { type: 'vertical', col: 3, startRow: 0, length: 5, sum: 28 },
          { type: 'vertical', col: 4, startRow: 1, length: 4, sum: 23 },
          { type: 'vertical', col: 5, startRow: 0, length: 6, sum: 32 },
          { type: 'vertical', col: 6, startRow: 3, length: 3, sum: 12 },
          { type: 'vertical', col: 7, startRow: 2, length: 4, sum: 19 }
        ]
      },
      'Hard': {
        runs: [
          { type: 'horizontal', row: 0, startCol: 1, length: 5, sum: 35 },
          { type: 'horizontal', row: 1, startCol: 0, length: 3, sum: 18 },
          { type: 'horizontal', row: 1, startCol: 4, length: 4, sum: 28 },
          { type: 'horizontal', row: 2, startCol: 2, length: 2, sum: 13 },
          { type: 'horizontal', row: 2, startCol: 5, length: 3, sum: 19 },
          { type: 'horizontal', row: 3, startCol: 0, length: 4, sum: 24 },
          { type: 'horizontal', row: 3, startCol: 5, length: 3, sum: 20 },
          { type: 'horizontal', row: 4, startCol: 1, length: 3, sum: 14 },
          { type: 'horizontal', row: 4, startCol: 5, length: 2, sum: 10 },
          { type: 'horizontal', row: 5, startCol: 0, length: 6, sum: 31 },
          { type: 'vertical', col: 0, startRow: 1, length: 5, sum: 29 },
          { type: 'vertical', col: 1, startRow: 0, length: 5, sum: 27 },
          { type: 'vertical', col: 2, startRow: 0, length: 5, sum: 26 },
          { type: 'vertical', col: 3, startRow: 0, length: 4, sum: 22 },
          { type: 'vertical', col: 4, startRow: 1, length: 4, sum: 25 },
          { type: 'vertical', col: 5, startRow: 0, length: 6, sum: 33 },
          { type: 'vertical', col: 6, startRow: 1, length: 5, sum: 30 },
          { type: 'vertical', col: 7, startRow: 2, length: 4, sum: 21 }
        ]
      }
    };
    
    return patterns[difficulty] || patterns['Easy'];
  }

  // Apply pattern to create the grid structure
  applyPattern(grid, solution, clues, patterns) {
    // First, fill grid with blocked cells
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        grid[row][col] = this.blocked;
        solution[row][col] = this.blocked;
      }
    }

    // Create runs and place clues
    patterns.runs.forEach((run, index) => {
      if (run.type === 'horizontal') {
        // Place clue cell
        const clueCol = run.startCol - 1;
        if (clueCol >= 0) {
          grid[run.row][clueCol] = this.clue;
          solution[run.row][clueCol] = this.clue;
          clues[`${run.row}-${clueCol}`] = { horizontal: run.sum };
        }
        
        // Create run cells with solutions
        const numbers = this.generateValidNumbers(run.length, run.sum);
        for (let i = 0; i < run.length; i++) {
          const col = run.startCol + i;
          if (col < this.size) {
            grid[run.row][col] = this.empty;
            solution[run.row][col] = numbers[i];
          }
        }
      } else if (run.type === 'vertical') {
        // Place clue cell
        const clueRow = run.startRow - 1;
        if (clueRow >= 0) {
          if (grid[clueRow][run.col] === this.blocked) {
            grid[clueRow][run.col] = this.clue;
            solution[clueRow][run.col] = this.clue;
            clues[`${clueRow}-${run.col}`] = { vertical: run.sum };
          } else if (grid[clueRow][run.col] === this.clue) {
            clues[`${clueRow}-${run.col}`] = { 
              ...clues[`${clueRow}-${run.col}`], 
              vertical: run.sum 
            };
          }
        }
        
        // Create run cells with solutions
        const numbers = this.generateValidNumbers(run.length, run.sum);
        for (let i = 0; i < run.length; i++) {
          const row = run.startRow + i;
          if (row < this.size) {
            grid[row][run.col] = this.empty;
            solution[row][run.col] = numbers[i];
          }
        }
      }
    });
  }

  // Generate valid numbers that sum to target without repetition
  generateValidNumbers(length, sum) {
    const numbers = [];
    let remainingSum = sum;
    const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    
    for (let i = 0; i < length; i++) {
      const remainingCells = length - i;
      const minPossible = remainingCells;
      const maxPossible = remainingSum - (remainingCells - 1);
      
      // Filter available numbers within valid range
      const validNumbers = availableNumbers.filter(num => 
        num >= Math.max(1, remainingSum - 36) && 
        num <= Math.min(9, maxPossible) &&
        num <= remainingSum
      );
      
      if (validNumbers.length === 0) {
        // Fallback: distribute remaining sum evenly
        const avg = Math.floor(remainingSum / remainingCells);
        return [...numbers, ...Array(remainingCells).fill(0).map(() => Math.max(1, avg))];
      }
      
      const randomIndex = Math.floor(Math.random() * validNumbers.length);
      const selectedNumber = validNumbers[randomIndex];
      
      numbers.push(selectedNumber);
      remainingSum -= selectedNumber;
      availableNumbers.splice(availableNumbers.indexOf(selectedNumber), 1);
    }
    
    return numbers;
  }

  // Check if a number is valid in a specific position
  isValidMove(grid, clues, row, col, num) {
    if (num < 1 || num > 9) return false;
    if (grid[row][col] !== this.empty) return false;

    // Check horizontal run
    const hRun = this.getHorizontalRun(grid, row, col);
    if (hRun.clue && !this.isValidInRun(grid, hRun, row, col, num, 'horizontal')) {
      return false;
    }

    // Check vertical run
    const vRun = this.getVerticalRun(grid, row, col);
    if (vRun.clue && !this.isValidInRun(grid, vRun, row, col, num, 'vertical')) {
      return false;
    }

    return true;
  }

  // Get horizontal run for a cell
  getHorizontalRun(grid, row, col) {
    const run = { cells: [], clue: null, sum: 0 };
    
    // Find start of run
    let startCol = col;
    while (startCol > 0 && grid[row][startCol - 1] === this.empty) {
      startCol--;
    }
    
    // Get clue
    if (startCol > 0 && grid[row][startCol - 1] === this.clue) {
      run.clue = `${row}-${startCol - 1}`;
    }
    
    // Get all cells in run
    let currentCol = startCol;
    while (currentCol < this.size && grid[row][currentCol] === this.empty) {
      run.cells.push({ row, col: currentCol });
      currentCol++;
    }
    
    return run;
  }

  // Get vertical run for a cell
  getVerticalRun(grid, row, col) {
    const run = { cells: [], clue: null, sum: 0 };
    
    // Find start of run
    let startRow = row;
    while (startRow > 0 && grid[startRow - 1][col] === this.empty) {
      startRow--;
    }
    
    // Get clue
    if (startRow > 0 && grid[startRow - 1][col] === this.clue) {
      run.clue = `${startRow - 1}-${col}`;
    }
    
    // Get all cells in run
    let currentRow = startRow;
    while (currentRow < this.size && grid[currentRow][col] === this.empty) {
      run.cells.push({ row: currentRow, col });
      currentRow++;
    }
    
    return run;
  }

  // Check if number is valid in a run
  isValidInRun(grid, run, row, col, num, direction) {
    // Check for duplicates
    for (const cell of run.cells) {
      if (cell.row !== row || cell.col !== col) {
        if (grid[cell.row][cell.col] === num) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Check if puzzle is completed
  isComplete(grid, clues) {
    // Check all cells are filled
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (grid[row][col] === this.empty) {
          return false;
        }
      }
    }
    
    // Check all run sums
    return this.areAllRunsValid(grid, clues);
  }

  // Check if all runs have valid sums
  areAllRunsValid(grid, clues) {
    for (const clueKey in clues) {
      const [row, col] = clueKey.split('-').map(Number);
      const clue = clues[clueKey];
      
      if (clue.horizontal) {
        const run = this.getHorizontalRun(grid, row, col + 1);
        const sum = run.cells.reduce((total, cell) => total + (grid[cell.row][cell.col] || 0), 0);
        if (sum !== clue.horizontal) return false;
        
        // Check for duplicates
        const values = run.cells.map(cell => grid[cell.row][cell.col]).filter(v => v > 0);
        if (new Set(values).size !== values.length) return false;
      }
      
      if (clue.vertical) {
        const run = this.getVerticalRun(grid, row + 1, col);
        const sum = run.cells.reduce((total, cell) => total + (grid[cell.row][cell.col] || 0), 0);
        if (sum !== clue.vertical) return false;
        
        // Check for duplicates
        const values = run.cells.map(cell => grid[cell.row][cell.col]).filter(v => v > 0);
        if (new Set(values).size !== values.length) return false;
      }
    }
    
    return true;
  }

  // Get conflicts in current grid
  getConflicts(grid, clues) {
    const conflicts = [];
    
    for (const clueKey in clues) {
      const [row, col] = clueKey.split('-').map(Number);
      const clue = clues[clueKey];
      
      if (clue.horizontal) {
        const run = this.getHorizontalRun(grid, row, col + 1);
        const values = run.cells.map(cell => grid[cell.row][cell.col]).filter(v => v > 0);
        
        // Check for duplicates
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        if (duplicates.length > 0) {
          run.cells.forEach(cell => {
            if (duplicates.includes(grid[cell.row][cell.col])) {
              conflicts.push(cell);
            }
          });
        }
        
        // Check if sum exceeds target
        const currentSum = values.reduce((sum, val) => sum + val, 0);
        if (currentSum > clue.horizontal) {
          run.cells.forEach(cell => {
            if (grid[cell.row][cell.col] > 0) {
              conflicts.push(cell);
            }
          });
        }
      }
      
      if (clue.vertical) {
        const run = this.getVerticalRun(grid, row + 1, col);
        const values = run.cells.map(cell => grid[cell.row][cell.col]).filter(v => v > 0);
        
        // Check for duplicates
        const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
        if (duplicates.length > 0) {
          run.cells.forEach(cell => {
            if (duplicates.includes(grid[cell.row][cell.col])) {
              conflicts.push(cell);
            }
          });
        }
        
        // Check if sum exceeds target
        const currentSum = values.reduce((sum, val) => sum + val, 0);
        if (currentSum > clue.vertical) {
          run.cells.forEach(cell => {
            if (grid[cell.row][cell.col] > 0) {
              conflicts.push(cell);
            }
          });
        }
      }
    }
    
    // Remove duplicates
    return conflicts.filter((conflict, index, self) =>
      index === self.findIndex(c => c.row === conflict.row && c.col === conflict.col)
    );
  }

  // Get hint for a cell
  getHint(grid, solution, row, col) {
    if (grid[row][col] === this.empty && solution[row][col] > 0) {
      return solution[row][col];
    }
    return null;
  }
}

const KakuroLogicGame = () => {
  const [gameState, setGameState] = useState('ready');
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes default
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints, setMaxHints] = useState(3);
  const [maxMistakes, setMaxMistakes] = useState(5);
  const [gameDuration, setGameDuration] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Kakuro game state
  const [kakuroGenerator] = useState(new KakuroGenerator());
  const [puzzle, setPuzzle] = useState([]);
  const [solution, setSolution] = useState([]);
  const [clues, setClues] = useState({});
  const [currentGrid, setCurrentGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
  const [conflicts, setConflicts] = useState([]);
  const [showConflicts, setShowConflicts] = useState(true);
  const [filledCells, setFilledCells] = useState(0);
  const [totalEmptyCells, setTotalEmptyCells] = useState(0);
  const [correctMoves, setCorrectMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);

  // Difficulty settings
  const difficultySettings = {
    Easy: {
      timeLimit: 1800, // 30 minutes
      maxHints: 5,
      maxMistakes: 8,
      description: 'Simple runs with manageable sums, generous hints and mistakes',
      gridSize: 'Small grid with basic patterns'
    },
    Medium: {
      timeLimit: 1200, // 20 minutes
      maxHints: 3,
      maxMistakes: 5,
      description: 'More complex runs and higher sums, moderate hints and mistakes',
      gridSize: 'Medium grid with intermediate patterns'
    },
    Hard: {
      timeLimit: 900, // 15 minutes
      maxHints: 2,
      maxMistakes: 3,
      description: 'Complex runs with challenging sums, limited hints and mistakes',
      gridSize: 'Large grid with advanced patterns'
    }
  };

  // Initialize game with difficulty settings
  const initializeGame = useCallback(() => {
    const settings = difficultySettings[difficulty];
    setScore(0);
    setFinalScore(0);
    setTimeRemaining(settings.timeLimit);
    setMaxHints(settings.maxHints);
    setMaxMistakes(settings.maxMistakes);
    setMistakes(0);
    setHintsUsed(0);
    setCorrectMoves(0);
    setTotalMoves(0);
    setCompletionPercentage(0);
    setConflicts([]);
    setSelectedCell({ row: -1, col: -1 });
  }, [difficulty]);

  // Generate new puzzle
  const generateNewPuzzle = useCallback(() => {
    const { puzzle: newPuzzle, solution: newSolution, clues: newClues } = kakuroGenerator.generatePuzzle(difficulty);
    setPuzzle(newPuzzle);
    setSolution(newSolution);
    setClues(newClues);
    setCurrentGrid(newPuzzle.map(row => [...row]));

    // Count empty cells
    const emptyCells = newPuzzle.flat().filter(cell => cell === kakuroGenerator.empty).length;
    setTotalEmptyCells(emptyCells);
    setFilledCells(0);
  }, [difficulty, kakuroGenerator]);

  // Handle cell selection
  const handleCellClick = (row, col) => {
    if (gameState !== 'playing') return;
    if (currentGrid[row][col] !== kakuroGenerator.empty) return; // Only select empty cells

    setSelectedCell({ row, col });
  };

  // Handle number input
  const handleNumberInput = (number) => {
    if (gameState !== 'playing' || selectedCell.row === -1 || selectedCell.col === -1) return;
    if (currentGrid[selectedCell.row][selectedCell.col] !== kakuroGenerator.empty) return;

    const newGrid = [...currentGrid];
    const previousValue = newGrid[selectedCell.row][selectedCell.col];
    newGrid[selectedCell.row][selectedCell.col] = number;

    setCurrentGrid(newGrid);
    setTotalMoves(prev => prev + 1);

    // Check if move is correct
    const isCorrect = number === solution[selectedCell.row][selectedCell.col];
    const isValid = kakuroGenerator.isValidMove(puzzle, clues, selectedCell.row, selectedCell.col, number);

    if (isCorrect) {
      setCorrectMoves(prev => prev + 1);
      if (previousValue === kakuroGenerator.empty) {
        setFilledCells(prev => prev + 1);
      }
    } else {
      setMistakes(prev => {
        const newMistakes = prev + 1;
        if (newMistakes >= maxMistakes) {
          endGame(false);
        }
        return newMistakes;
      });
    }

    // Check for conflicts
    const newConflicts = kakuroGenerator.getConflicts(newGrid, clues);
    setConflicts(newConflicts);

    // Check if puzzle is completed
    if (kakuroGenerator.isComplete(newGrid, clues)) {
      endGame(true);
    }

    // Move to next empty cell
    moveToNextCell();
  };

  // Clear selected cell
  const handleClearCell = () => {
    if (gameState !== 'playing' || selectedCell.row === -1 || selectedCell.col === -1) return;
    if (currentGrid[selectedCell.row][selectedCell.col] === kakuroGenerator.empty) return;

    const newGrid = [...currentGrid];
    if (newGrid[selectedCell.row][selectedCell.col] > 0) {
      newGrid[selectedCell.row][selectedCell.col] = kakuroGenerator.empty;
      setCurrentGrid(newGrid);
      setFilledCells(prev => prev - 1);

      // Update conflicts
      const newConflicts = kakuroGenerator.getConflicts(newGrid, clues);
      setConflicts(newConflicts);
    }
  };

  // Use hint
  const useHint = () => {
    if (gameState !== 'playing' || hintsUsed >= maxHints) return;
    if (selectedCell.row === -1 || selectedCell.col === -1) return;
    if (currentGrid[selectedCell.row][selectedCell.col] !== kakuroGenerator.empty) return;

    const hint = kakuroGenerator.getHint(currentGrid, solution, selectedCell.row, selectedCell.col);
    if (hint) {
      handleNumberInput(hint);
      setHintsUsed(prev => prev + 1);
    }
  };

  // Move to next empty cell
  const moveToNextCell = () => {
    const { row, col } = selectedCell;

    // Find next empty cell
    for (let r = row; r < kakuroGenerator.size; r++) {
      const startCol = r === row ? col + 1 : 0;
      for (let c = startCol; c < kakuroGenerator.size; c++) {
        if (currentGrid[r][c] === kakuroGenerator.empty) {
          setSelectedCell({ row: r, col: c });
          return;
        }
      }
    }

    // If no cell found, search from beginning
    for (let r = 0; r < kakuroGenerator.size; r++) {
      for (let c = 0; c < kakuroGenerator.size; c++) {
        if (currentGrid[r][c] === kakuroGenerator.empty) {
          setSelectedCell({ row: r, col: c });
          return;
        }
      }
    }
  };

  // End game
  const endGame = (success) => {
    const endTime = Date.now();
    const duration = Math.floor((endTime - gameStartTime) / 1000);
    setGameDuration(duration);
    setFinalScore(score);
    setGameState('finished');
    setShowCompletionModal(true);
  };

  // Calculate completion percentage
  useEffect(() => {
    if (totalEmptyCells > 0) {
      const percentage = Math.min(100, (filledCells / totalEmptyCells) * 100);
      setCompletionPercentage(percentage);
    }
  }, [filledCells, totalEmptyCells]);

  // Calculate score
  const calculateScore = useCallback(() => {
    if (gameState !== 'playing') return score;

    const settings = difficultySettings[difficulty];

    // Base completion score (0-80 points)
    const completionScore = (completionPercentage / 100) * 80;

    // Accuracy bonus (0-40 points)
    const accuracy = totalMoves > 0 ? correctMoves / totalMoves : 0;
    const accuracyBonus = accuracy * 40;

    // Time bonus (0-30 points)
    const timeUsed = settings.timeLimit - timeRemaining;
    const timeEfficiency = Math.max(0, 1 - (timeUsed / settings.timeLimit));
    const timeBonus = timeEfficiency * 30;

    // Mistake penalty (subtract up to 20 points)
    const mistakePenalty = (mistakes / settings.maxMistakes) * 20;

    // Hint penalty (subtract up to 15 points)
    const hintPenalty = (hintsUsed / settings.maxHints) * 15;

    // Difficulty multiplier
    const difficultyMultiplier = difficulty === 'Easy' ? 0.8 : difficulty === 'Medium' ? 1.0 : 1.2;

    // Speed bonus for fast completion (0-15 points)
    const avgTimePerCell = totalMoves > 0 ? (settings.timeLimit - timeRemaining) / totalMoves : 0;
    const speedBonus = Math.max(0, Math.min(15, (30 - avgTimePerCell) * 0.5));

    let finalScore = (completionScore + accuracyBonus + timeBonus + speedBonus - mistakePenalty - hintPenalty) * difficultyMultiplier;

    // Apply scaling to make 200 very challenging
    finalScore = finalScore * 0.9;

    return Math.round(Math.max(0, Math.min(200, finalScore)));
  }, [gameState, completionPercentage, totalMoves, correctMoves, timeRemaining, mistakes, hintsUsed, difficulty, score]);

  // Update score
  useEffect(() => {
    const newScore = calculateScore();
    setScore(newScore);
  }, [calculateScore]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endGame(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining, gameStartTime]);

  // Handle start game
  const handleStart = () => {
    initializeGame();
    generateNewPuzzle();
    setGameStartTime(Date.now());
  };

  // Handle reset game
  const handleReset = () => {
    initializeGame();
    setPuzzle([]);
    setSolution([]);
    setClues({});
    setCurrentGrid([]);
    setShowCompletionModal(false);
    setSelectedCell({ row: -1, col: -1 });
    setFilledCells(0);
    setTotalEmptyCells(0);
  };

  // Handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    if (gameState === 'ready') {
      setDifficulty(newDifficulty);
    }
  };

  // Handle game complete
  const handleGameComplete = (payload) => {
  };

  // Get cell class names
  const getCellClassName = (row, col) => {
    const cell = currentGrid[row] && currentGrid[row][col];
    const baseClass = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-gray-400 flex items-center justify-center text-sm sm:text-lg md:text-xl font-medium transition-all duration-300';
    
    const isSelected = selectedCell.row === row && selectedCell.col === col;
    const hasConflict = conflicts.some(c => c.row === row && c.col === col);
    const isEmpty = cell === kakuroGenerator.empty;
    const isClue = cell === kakuroGenerator.clue;
    const isBlocked = cell === kakuroGenerator.blocked;

    let className = baseClass;

    if (isBlocked) {
      className += ' bg-gray-800 cursor-default';
    } else if (isClue) {
      className += ' bg-gray-700 text-white text-xs cursor-default relative';
    } else if (isEmpty) {
      if (isSelected) {
        className += ' bg-blue-200 border-blue-500 shadow-lg ring-2 ring-blue-300 cursor-pointer transform hover:scale-105 active:scale-95';
      } else {
        className += ' bg-white hover:bg-blue-50 hover:shadow-md cursor-pointer transform hover:scale-105 active:scale-95';
      }
    } else {
      // Filled cell
      if (hasConflict && showConflicts) {
        className += ' bg-red-100 border-red-400 text-red-600 font-bold cursor-pointer animate-bounce';
      } else {
        className += ' bg-white text-blue-600 font-semibold cursor-pointer hover:bg-blue-50';
      }
    }

    return className;
  };

  // Render clue cell content
  const renderClueContent = (row, col) => {
    const clueKey = `${row}-${col}`;
    const clue = clues[clueKey];
    if (!clue) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-xs text-white font-bold">
          {clue.vertical && (
            <div className="absolute top-0 right-1 text-[8px]">
              {clue.vertical}
            </div>
          )}
          {clue.horizontal && (
            <div className="absolute bottom-0 left-1 text-[8px]">
              {clue.horizontal}
            </div>
          )}
          {clue.vertical && clue.horizontal && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-[1px] bg-white transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom stats for the framework
  const customStats = {
    mistakes,
    hintsUsed,
    completionPercentage: Math.round(completionPercentage),
    accuracy: totalMoves > 0 ? Math.round((correctMoves / totalMoves) * 100) : 100,
    filledCells,
    totalCells: totalEmptyCells
  };

  return (
    <div>
      <Header unreadCount={3} />

      <GameFramework
        gameTitle="Kakuro Logic Game"
        gameDescription={
          <div className="mx-auto px-4 lg:px-0 mb-0">
            <div className="bg-[#E8E8E8] rounded-lg p-6">
              {/* Header with toggle icon */}
              <div
                className="flex items-center justify-between mb-4 cursor-pointer"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                <h3 className="text-lg font-semibold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  How to Play Kakuro Logic Game
                </h3>
                <span className="text-blue-900 text-xl">
                  {showInstructions
                    ? <ChevronUp className="h-5 w-5 text-blue-900" />
                    : <ChevronDown className="h-5 w-5 text-blue-900" />}
                </span>
              </div>

              {/* Instructions */}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${showInstructions ? '' : 'hidden'}`}>
                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎯 Objective
                  </h4>
                  <p className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    Fill white squares with digits 1-9 so each run sums to the target clue number without repeating digits.
                  </p>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎚️ Difficulty Levels
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• <strong>Easy:</strong> Simple runs, 30min, 5 hints</li>
                    <li>• <strong>Medium:</strong> Complex runs, 20min, 3 hints</li>
                    <li>• <strong>Hard:</strong> Challenge runs, 15min, 2 hints</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    📊 Scoring System
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Completion progress (80pts max)</li>
                    <li>• Accuracy bonus (40pts max)</li>
                    <li>• Speed & time bonuses (45pts max)</li>
                    <li>• Mistake & hint penalties</li>
                  </ul>
                </div>

                <div className='bg-white p-3 rounded-lg'>
                  <h4 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    🎮 How to Play
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
                    <li>• Click white squares to select</li>
                    <li>• Numbers in clue cells show target sums</li>
                    <li>• Each run = no repeated digits</li>
                    <li>• Red highlights show conflicts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
        category="Mathematical Logic"
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
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
          {/* Game Controls */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 px-2">
            <button
              onClick={useHint}
              disabled={hintsUsed >= maxHints || selectedCell.row === -1}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${hintsUsed >= maxHints || selectedCell.row === -1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
            >
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
              Hint ({maxHints - hintsUsed})
            </button>

            <button
              onClick={handleClearCell}
              disabled={selectedCell.row === -1}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCell.row === -1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
            >
              <Eraser className="h-3 w-3 sm:h-4 sm:w-4" />
              Clear
            </button>

            <button
              onClick={() => setShowConflicts(!showConflicts)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${showConflicts
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-500 text-white hover:bg-gray-600 shadow-lg hover:shadow-xl'
                }`}
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(12px, 2.5vw, 14px)' }}
            >
              {showConflicts ? <Eye className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />}
              {showConflicts ? 'Hide' : 'Show'} Conflicts
            </button>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-2xl px-2">
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Progress
              </div>
              <div className="text-sm sm:text-lg font-semibold text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {Math.round(completionPercentage)}%
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Mistakes
              </div>
              <div className="text-sm sm:text-lg font-semibold text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {mistakes}/{maxMistakes}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Accuracy
              </div>
              <div className="text-sm sm:text-lg font-semibold text-green-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {customStats.accuracy}%
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-md hover:bg-gray-100">
              <div className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Filled
              </div>
              <div className="text-sm sm:text-lg font-semibold text-purple-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {filledCells}/{totalEmptyCells}
              </div>
            </div>
          </div>

          {/* Kakuro Grid */}
          {currentGrid.length > 0 && (
            <div className="bg-white p-2 sm:p-4 rounded-lg shadow-xl border-2 border-gray-800 transition-all duration-500 hover:shadow-2xl">
              <div className="grid grid-cols-10 gap-0 max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                {currentGrid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={getCellClassName(rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      style={{
                        animation: cell > 0 && cell !== kakuroGenerator.clue && cell !== kakuroGenerator.blocked ? 'fadeInScale 0.3s ease-out' : 'none'
                      }}
                    >
                      {cell === kakuroGenerator.clue ? (
                        renderClueContent(rowIndex, colIndex)
                      ) : cell > 0 ? (
                        cell
                      ) : (
                        ''
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Number Input Pad */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xs sm:max-w-sm px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
              <button
                key={number}
                onClick={() => handleNumberInput(number)}
                disabled={selectedCell.row === -1 || selectedCell.col === -1}
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg border-2 text-lg sm:text-xl md:text-2xl font-bold transition-all duration-300 transform hover:scale-110 active:scale-95 ${selectedCell.row === -1 || selectedCell.col === -1
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-500 shadow-md hover:shadow-lg'
                  }`}
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {number}
              </button>
            ))}
          </div>

          {/* Status Messages */}
          {conflicts.length > 0 && showConflicts && (
            <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-bounce shadow-lg">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} detected
              </span>
            </div>
          )}

          {completionPercentage === 100 && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg animate-pulse shadow-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                Puzzle completed! Excellent math skills!
              </span>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center max-w-2xl text-xs sm:text-sm text-gray-600 px-4" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            <p className="mb-2 leading-relaxed">
              Click on white squares and use numbers 1-9. Each run must sum to the clue number without repeating digits.
            </p>
            <p className="leading-relaxed">
              {difficulty} Mode: {difficultySettings[difficulty].description}
            </p>
          </div>
        </div>
      </GameFramework>

      <GameCompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        score={finalScore}
        difficulty={difficulty}
        duration={gameDuration}
        customStats={{
          correctAnswers: correctMoves,
          totalQuestions: totalMoves
        }}
      />
    </div>
  );
};

export default KakuroLogicGame;