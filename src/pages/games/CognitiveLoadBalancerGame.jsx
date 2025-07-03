import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import GameFramework from '../../components/GameFramework';

const CognitiveLoadBalancerGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('ready');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [difficulty, setDifficulty] = useState('Easy');

  // Game-specific state
  const [currentTasks, setCurrentTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [failedTasks, setFailedTasks] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [activeTaskCount, setActiveTaskCount] = useState(1);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Task types with cognitive load
  const taskTypes = [
    {
      id: 'math',
      name: 'Math',
      icon: '🔢',
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-700',
      generate: (level) => {
        const max = Math.min(10 + level * 2, 50);
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * max) + 1;
        const operations = ['+', '-', '×'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        let answer, question;

        switch (op) {
          case '+': answer = a + b; question = `${a} + ${b}`; break;
          case '-': answer = Math.abs(a - b); question = `${Math.max(a, b)} - ${Math.min(a, b)}`; break;
          case '×': answer = a * b; question = `${a} × ${b}`; break;
          default: answer = a + b; question = `${a} + ${b}`;
        }

        return { question, answer: answer.toString(), options: generateMathOptions(answer) };
      }
    },
    {
      id: 'color',
      name: 'Color Match',
      icon: '🎨',
      color: '#EF4444',
      gradient: 'from-red-500 to-red-700',
      generate: (level) => {
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        const targetColor = colors[Math.floor(Math.random() * colors.length)];
        const displayColor = Math.random() > 0.3 ? targetColor : colors[Math.floor(Math.random() * colors.length)];
        return {
          question: `Color of text: "${targetColor}"`,
          answer: displayColor,
          displayColor: targetColor,
          textColor: displayColor,
          options: colors.slice(0, 4)
        };
      }
    },
    {
      id: 'pattern',
      name: 'Pattern',
      icon: '🔄',
      color: '#10B981',
      gradient: 'from-emerald-500 to-emerald-700',
      generate: (level) => {
        const length = Math.min(3 + Math.floor(level / 2), 8);
        const sequence = Array.from({ length }, () => Math.floor(Math.random() * 4));
        const missing = Math.floor(Math.random() * length);
        const answer = sequence[missing];
        const displaySequence = [...sequence];
        displaySequence[missing] = '?';

        return {
          question: `Complete: ${displaySequence.join(' → ')}`,
          answer: answer.toString(),
          options: ['0', '1', '2', '3']
        };
      }
    },
    {
      id: 'memory',
      name: 'Memory',
      icon: '🧠',
      color: '#8B5CF6',
      gradient: 'from-violet-500 to-violet-700',
      generate: (level) => {
        const digits = Math.min(3 + Math.floor(level / 3), 7);
        const sequence = Array.from({ length: digits }, () => Math.floor(Math.random() * 10)).join('');
        return {
          question: `Remember: ${sequence}`,
          answer: sequence,
          options: [],
          isMemory: true,
          hideAfter: 2000 + (digits * 500)
        };
      }
    }
  ];

  const generateMathOptions = (correct) => {
    const options = [correct];
    while (options.length < 4) {
      const wrong = correct + (Math.floor(Math.random() * 10) - 5);
      if (wrong !== correct && wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    return options.sort(() => Math.random() - 0.5).map(n => n.toString());
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setCurrentTasks([]);
    setCompletedTasks(0);
    setFailedTasks(0);
    setCurrentLevel(1);
    setStreakCount(0);
    setMaxStreak(0);

    const initialTime = difficulty === 'Easy' ? 120 : difficulty === 'Moderate' ? 90 : 60;
    setTimeRemaining(initialTime);
    setActiveTaskCount(difficulty === 'Easy' ? 1 : difficulty === 'Moderate' ? 2 : 3);
  }, [difficulty]);

  // Generate new task
  const generateNewTask = useCallback(() => {
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    const taskData = taskType.generate(currentLevel);

    return {
      id: Date.now() + Math.random(),
      type: taskType.id,
      typeData: taskType,
      ...taskData,
      timeLimit: 8000 + (difficulty === 'Easy' ? 4000 : difficulty === 'Moderate' ? 2000 : 0),
      startTime: Date.now()
    };
  }, [currentLevel, difficulty, taskTypes]);

  // Add new tasks
  const addNewTasks = useCallback(() => {
    if (gameState !== 'playing') return;

    const newTasks = [];
    const tasksNeeded = activeTaskCount - currentTasks.length;

    for (let i = 0; i < tasksNeeded; i++) {
      newTasks.push(generateNewTask());
    }

    setCurrentTasks(prev => [...prev, ...newTasks]);
  }, [gameState, activeTaskCount, currentTasks.length, generateNewTask]);

  // Handle task completion
  const handleTaskComplete = useCallback((taskId, userAnswer) => {
    setCurrentTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (!task) return prev;

      const isCorrect = userAnswer === task.answer;
      const timeBonus = Math.max(0, task.timeLimit - (Date.now() - task.startTime)) / 100;
      const points = isCorrect ? Math.floor(10 + timeBonus + (currentLevel * 2)) : 0;

      if (isCorrect) {
        setScore(s => s + points);
        setCompletedTasks(c => c + 1);
        setStreakCount(s => {
          const newStreak = s + 1;
          setMaxStreak(max => Math.max(max, newStreak));
          return newStreak;
        });
      } else {
        setFailedTasks(f => f + 1);
        setStreakCount(0);
      }

      return prev.filter(t => t.id !== taskId);
    });
  }, [currentLevel]);

  // Game timer
  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeRemaining]);

  // Task management
  useEffect(() => {
    if (gameState === 'playing') {
      addNewTasks();

      // Level progression
      if (completedTasks > 0 && completedTasks % 10 === 0) {
        setCurrentLevel(prev => prev + 1);
      }
    }
  }, [gameState, addNewTasks, completedTasks]);

  // Task timeout management
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState === 'playing') {
        setCurrentTasks(prev => {
          const now = Date.now();
          const activeTasks = prev.filter(task => {
            if (now - task.startTime > task.timeLimit) {
              setFailedTasks(f => f + 1);
              setStreakCount(0);
              return false;
            }
            return true;
          });
          return activeTasks;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState]);

  const handleStart = () => {
    initializeGame();
    setGameState('playing');
  };

  const handleReset = () => {
    initializeGame();
    setGameState('ready');
  };

  const handleGameComplete = (payload) => {
    console.log('Cognitive Load Balancer completed:', payload);
  };

  const customStats = {
    completedTasks,
    failedTasks,
    currentLevel,
    streakCount,
    maxStreak,
    activeTasks: currentTasks.length
  };

  return (
    <div>
      <Header unreadCount={3} />
      <GameFramework
        gameTitle="Cognitive Load Balancer"
        gameDescription="Master the art of multitasking! Handle multiple cognitive challenges simultaneously to test your mental flexibility and working memory."
        category="Executive Function"
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
          {/* Enhanced Game Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-6xl">
            <div className="text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-blue-200">
              <div className="text-xs sm:text-sm text-blue-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Level
              </div>
              <div className="text-lg sm:text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentLevel}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-emerald-200">
              <div className="text-xs sm:text-sm text-emerald-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Completed
              </div>
              <div className="text-lg sm:text-2xl font-bold text-emerald-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {completedTasks}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-red-200">
              <div className="text-xs sm:text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Failed
              </div>
              <div className="text-lg sm:text-2xl font-bold text-red-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {failedTasks}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-purple-200">
              <div className="text-xs sm:text-sm text-purple-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {streakCount}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-amber-200">
              <div className="text-xs sm:text-sm text-amber-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Max Streak
              </div>
              <div className="text-lg sm:text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {maxStreak}
              </div>
            </div>

            <div className="text-center bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-3 sm:p-4 shadow-xl border-2 border-gray-200">
              <div className="text-xs sm:text-sm text-gray-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Active Tasks
              </div>
              <div className="text-lg sm:text-2xl font-bold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {currentTasks.length}
              </div>
            </div>
          </div>

          {/* Active Tasks Display */}
          {gameState === 'playing' && (
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {currentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleTaskComplete}
                    gameState={gameState}
                  />
                ))}
              </div>

              {/* Task Queue Indicator */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200">
                  <div className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Cognitive Load:
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: activeTaskCount }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${i < currentTasks.length ? 'bg-[#FF6B3E]' : 'bg-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions for ready state */}
          {gameState === 'ready' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🧠⚖️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Cognitive Load Balancer
                </h3>
                <div className="text-left space-y-3 text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <p><strong>🎯 Objective:</strong> Handle multiple cognitive tasks simultaneously</p>
                  <p><strong>🔢 Math Tasks:</strong> Solve arithmetic problems quickly</p>
                  <p><strong>🎨 Color Tasks:</strong> Identify the color of text (ignore the word)</p>
                  <p><strong>🔄 Pattern Tasks:</strong> Complete number sequences</p>
                  <p><strong>🧠 Memory Tasks:</strong> Remember and recall digit sequences</p>
                  <p><strong>⏱️ Time Pressure:</strong> Each task has a time limit</p>
                  <p><strong>📈 Difficulty:</strong> More tasks appear as you progress</p>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Summary */}
          {gameState === 'finished' && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Cognitive Assessment Complete!
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="text-sm text-blue-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Final Score</div>
                    <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{score}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="text-sm text-green-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Tasks Completed</div>
                    <div className="text-2xl font-bold text-green-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{completedTasks}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="text-sm text-purple-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Max Streak</div>
                    <div className="text-2xl font-bold text-purple-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{maxStreak}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="text-sm text-amber-700" style={{ fontFamily: 'Roboto, sans-serif' }}>Max Level</div>
                    <div className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{currentLevel}</div>
                  </div>
                </div>
                <div className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Accuracy: {completedTasks > 0 ? Math.round((completedTasks / (completedTasks + failedTasks)) * 100) : 0}%
                </div>
              </div>
            </div>
          )}
        </div>
      </GameFramework>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onComplete, gameState }) => {
  const [userInput, setUserInput] = useState('');
  const [isMemoryPhase, setIsMemoryPhase] = useState(task.isMemory);
  const [timeLeft, setTimeLeft] = useState(task.timeLimit);

  useEffect(() => {
    if (task.isMemory && task.hideAfter) {
      const timer = setTimeout(() => {
        setIsMemoryPhase(false);
      }, task.hideAfter);
      return () => clearTimeout(timer);
    }
  }, [task.isMemory, task.hideAfter]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - task.startTime;
      const remaining = Math.max(0, task.timeLimit - elapsed);
      setTimeLeft(remaining);
    }, 100);
    return () => clearInterval(interval);
  }, [task.startTime, task.timeLimit]);

  const handleAnswer = (answer) => {
    onComplete(task.id, answer);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      handleAnswer(userInput.trim());
    }
  };

  const progressPercentage = (timeLeft / task.timeLimit) * 100;

  return (
    <div className={`bg-gradient-to-br ${task.typeData.gradient} rounded-2xl p-4 shadow-xl border-2 border-white/20 text-white relative overflow-hidden`}>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Task Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{task.typeData.icon}</span>
          <span className="font-semibold text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {task.typeData.name}
          </span>
        </div>
        <div className="text-xs opacity-75" style={{ fontFamily: 'Roboto, sans-serif' }}>
          {Math.ceil(timeLeft / 1000)}s
        </div>
      </div>

      {/* Task Content */}
      <div className="mb-4">
        {task.type === 'color' ? (
          <div className="text-center">
            <div className="text-sm mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              What COLOR is this text?
            </div>
            <div
              className="text-2xl font-bold mb-3"
              style={{
                color: task.textColor,
                fontFamily: 'Roboto, sans-serif'
              }}
            >
              {task.displayColor}
            </div>
          </div>
        ) : task.isMemory && isMemoryPhase ? (
          <div className="text-center">
            <div className="text-sm mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Memorize this sequence:
            </div>
            <div className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {task.answer}
            </div>
          </div>
        ) : task.isMemory && !isMemoryPhase ? (
          <div className="text-center">
            <div className="text-sm mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
              Enter the sequence:
            </div>
            <form onSubmit={handleInputSubmit}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-gray-900 text-center font-mono"
                placeholder="Type sequence..."
                autoFocus
              />
            </form>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-lg font-semibold mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {task.question}
            </div>
          </div>
        )}
      </div>

      {/* Answer Options */}
      {!task.isMemory && task.options && task.options.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {task.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="bg-white/20 hover:bg-white/30 rounded-lg py-2 px-3 text-sm font-medium transition-colors"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CognitiveLoadBalancerGame;