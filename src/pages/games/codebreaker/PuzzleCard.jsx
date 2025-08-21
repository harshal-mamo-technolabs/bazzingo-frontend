import React, { useState } from 'react';
import { Lightbulb, Send, Eye, Scroll, Lock, Unlock } from 'lucide-react';

const PuzzleCard = ({ 
  puzzle, 
  onSubmit, 
  onHint, 
  hintUsed, 
  showFeedback, 
  feedbackType, 
  feedbackMessage,
  attempts 
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userAnswer.trim()) {
      onSubmit(userAnswer.trim());
    }
  };

  const handleHintClick = () => {
    if (!hintUsed) {
      onHint();
      setShowHint(true);
    }
  };

  const getPuzzleTypeIcon = (type) => {
    switch (type) {
      case 'caesar': return '🏛️';
      case 'morse': return '📡';
      case 'symbols': return '🗿';
      default: return '📜';
    }
  };

  const getPuzzleTypeDescription = (type) => {
    switch (type) {
      case 'caesar': return 'Caesar Cipher - Letters shifted in alphabet';
      case 'morse': return 'Morse Code - Dots and dashes';
      case 'symbols': return 'Symbol Cipher - Ancient Croatian symbols';
      default: return 'Unknown cipher type';
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-4 border-amber-600 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
      {/* Parchment-style header */}
      <div className="bg-amber-200 border-2 border-amber-700 rounded-lg p-4 mb-6 relative">
        <div className="absolute -top-2 -left-2 text-2xl">📜</div>
        <div className="absolute -top-2 -right-2 text-2xl">🔒</div>
        
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{getPuzzleTypeIcon(puzzle.type)}</span>
          <div>
            <h3 className="text-xl font-bold text-amber-900">{puzzle.title}</h3>
            <p className="text-sm text-amber-700">{getPuzzleTypeDescription(puzzle.type)}</p>
          </div>
        </div>
        
        <p className="text-amber-800 mb-3">{puzzle.description}</p>
        
        {/* Context information */}
        <div className="bg-amber-100 border border-amber-400 rounded p-2 text-xs text-amber-700 italic">
          💡 {puzzle.context}
        </div>
      </div>

      {/* Encrypted message display */}
      <div className="bg-stone-800 text-green-400 font-mono p-4 rounded-lg mb-6 border-2 border-stone-600">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-semibold">Intercepted Message:</span>
        </div>
        <div className="text-lg tracking-wider break-all">
          {puzzle.encryptedMessage}
        </div>
      </div>

      {/* Hint section */}
      <div className="mb-6">
        <button
          onClick={handleHintClick}
          disabled={hintUsed}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            hintUsed 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-yellow-500 text-white hover:bg-yellow-600'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          {hintUsed ? 'Hint Used' : 'Use Hint'}
        </button>
        
        {showHint && hintUsed && (
          <div className="mt-3 bg-yellow-100 border border-yellow-400 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Hint:</span>
            </div>
            <p className="text-yellow-700 text-sm">{puzzle.hint}</p>
          </div>
        )}
      </div>

      {/* Answer input */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your decoded message..."
            className="flex-1 px-4 py-3 border-2 border-amber-400 rounded-lg focus:border-amber-600 focus:outline-none bg-white"
            disabled={showFeedback}
          />
          <button
            type="submit"
            disabled={!userAnswer.trim() || showFeedback}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Decode
          </button>
        </div>
      </form>

      {/* Attempts counter */}
      <div className="text-center mb-4">
        <span className="text-sm text-gray-600">
          Attempts: <span className="font-semibold text-red-600">{attempts}</span>
        </span>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`p-4 rounded-lg border-2 ${
          feedbackType === 'correct' 
            ? 'bg-green-100 border-green-400 text-green-800' 
            : 'bg-red-100 border-red-400 text-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {feedbackType === 'correct' ? (
              <Unlock className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-red-600" />
            )}
            <span className="font-semibold">
              {feedbackType === 'correct' ? 'Message Decoded!' : 'Decoding Failed'}
            </span>
          </div>
          <p className="text-sm">{feedbackMessage}</p>
          {feedbackType === 'correct' && (
            <div className="mt-2 text-sm font-medium">
              Points earned: +{hintUsed ? '10' : '20'}
            </div>
          )}
        </div>
      )}

      {/* Symbol legend for symbol puzzles */}
      {puzzle.type === 'symbols' && (
        <div className="mt-6 bg-stone-100 border-2 border-stone-400 rounded-lg p-4">
          <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
            <Scroll className="h-4 w-4" />
            Ancient Croatian Symbol Legend
          </h4>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 text-xs">
            {Object.entries({
              '⚓': 'A', '🏰': 'B', '🌊': 'C', '🐟': 'D', '🦅': 'E', '🌸': 'F',
              '⛵': 'G', '🏛️': 'H', '🗿': 'I', '🦋': 'J', '🔱': 'K', '🏺': 'L',
              '🌙': 'M', '🐚': 'N', '🌞': 'O', '🏖️': 'P', '👑': 'Q', '🌿': 'R',
              '⭐': 'S', '🌴': 'T', '🏔️': 'U', '🍇': 'V', '🌺': 'W', '⚡': 'X',
              '🦉': 'Y', '🌈': 'Z'
            }).map(([symbol, letter]) => (
              <div key={symbol} className="text-center bg-white rounded p-1 border">
                <div className="text-lg">{symbol}</div>
                <div className="font-bold text-stone-700">{letter}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleCard;