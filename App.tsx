import React, { useState, useEffect, useMemo } from 'react';
import { FRENCH_NOUNS } from './constants';
import { Word, AppMode } from './types';
import { Flashcard } from './components/Flashcard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Simple shuffle function
const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const App: React.FC = () => {
  // Application State
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [currentDeck, setCurrentDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incorrectIds, setIncorrectIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  // Load persistence (incorrect IDs)
  useEffect(() => {
    const saved = localStorage.getItem('french_incorrect_ids');
    if (saved) {
      try {
        setIncorrectIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved state");
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('french_incorrect_ids', JSON.stringify(incorrectIds));
  }, [incorrectIds]);

  const startQuiz = (category?: string) => {
    let deck = category 
      ? FRENCH_NOUNS.filter(w => w.category === category)
      : FRENCH_NOUNS;
    
    // Shuffle deck
    deck = shuffle(deck);
    
    // Limit to reasonable session size (e.g., 10 or 20)
    deck = deck.slice(0, 15);

    setCurrentDeck(deck);
    setCurrentIndex(0);
    setScore(0);
    setSessionCount(deck.length);
    setMode(AppMode.QUIZ);
  };

  const startReview = () => {
    const reviewWords = FRENCH_NOUNS.filter(w => incorrectIds.includes(w.id));
    const deck = shuffle(reviewWords).slice(0, 20); // Limit review size
    
    setCurrentDeck(deck);
    setCurrentIndex(0);
    setScore(0);
    setSessionCount(deck.length);
    setMode(AppMode.REVIEW);
  };

  const handleAnswer = (correct: boolean) => {
    const currentWord = currentDeck[currentIndex];
    
    if (correct) {
      setScore(s => s + 1);
      // Remove from incorrect list if it was there (mastered)
      if (incorrectIds.includes(currentWord.id)) {
        setIncorrectIds(prev => prev.filter(id => id !== currentWord.id));
      }
    } else {
      // Add to incorrect list if not already there
      if (!incorrectIds.includes(currentWord.id)) {
        setIncorrectIds(prev => [...prev, currentWord.id]);
      }
    }

    if (currentIndex < currentDeck.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setMode(AppMode.STATS);
    }
  };

  // Render Helpers
  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-block p-4 rounded-full bg-indigo-100 text-indigo-600 mb-4 text-4xl shadow-sm">
          <i className="fas fa-language"></i>
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2 serif">Le ou La?</h1>
        <p className="text-slate-500">Master French noun genders with ease.</p>
      </div>

      <div className="w-full space-y-4">
        <button 
          onClick={() => startQuiz()}
          className="w-full bg-slate-900 text-white p-4 rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-between group"
        >
          <span className="flex items-center"><i className="fas fa-random mr-3 text-indigo-400"></i> All Categories</span>
          <i className="fas fa-chevron-right opacity-50 group-hover:opacity-100 transition-opacity"></i>
        </button>

        <div className="grid grid-cols-2 gap-3">
          {['Home', 'Work', 'Skiing', 'Exceptions'].map(cat => {
            let icon = 'question';
            if (cat === 'Home') icon = 'home';
            else if (cat === 'Work') icon = 'briefcase';
            else if (cat === 'Skiing') icon = 'snowflake';
            else if (cat === 'Exceptions') icon = 'exclamation-triangle';

            return (
              <button 
                key={cat}
                onClick={() => startQuiz(cat)}
                className={`bg-white border border-slate-200 text-slate-700 p-4 rounded-xl font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all flex flex-col items-center justify-center text-sm shadow-sm ${cat === 'Exceptions' ? 'text-amber-600 hover:text-amber-700 hover:border-amber-400' : ''}`}
              >
                <i className={`fas fa-${icon} mb-2 text-xl`}></i>
                {cat}
              </button>
            );
          })}
        </div>

        {incorrectIds.length > 0 && (
          <button 
            onClick={startReview}
            className="w-full bg-orange-50 text-orange-600 border border-orange-200 p-4 rounded-xl font-semibold hover:bg-orange-100 transition-all flex items-center justify-between mt-6"
          >
             <span className="flex items-center">
               <i className="fas fa-sync-alt mr-3"></i> 
               Review Mistakes
               <span className="ml-2 bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">{incorrectIds.length}</span>
             </span>
             <i className="fas fa-play text-sm"></i>
          </button>
        )}
      </div>
      
      <div className="mt-12 text-slate-400 text-sm">
        Contains {FRENCH_NOUNS.length} common nouns
      </div>
    </div>
  );

  const renderQuiz = () => {
    const currentWord = currentDeck[currentIndex];
    const progress = ((currentIndex) / currentDeck.length) * 100;

    return (
      <div className="flex flex-col min-h-screen bg-slate-50 relative">
        {/* Header */}
        <div className="p-6 flex justify-between items-center">
           <button onClick={() => setMode(AppMode.HOME)} className="text-slate-400 hover:text-slate-700">
             <i className="fas fa-times text-xl"></i>
           </button>
           <div className="text-sm font-semibold text-slate-500">
             {currentIndex + 1} / {currentDeck.length}
           </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-200">
          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Card Area */}
        <div className="flex-1 flex flex-col justify-center p-6">
           {currentWord && (
             <Flashcard 
                word={currentWord} 
                onAnswer={handleAnswer} 
                isReviewMode={mode === AppMode.REVIEW}
             />
           )}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const percentage = Math.round((score / sessionCount) * 100);
    const data = [
      { name: 'Correct', value: score, color: '#4F46E5' }, // Indigo 600
      { name: 'Incorrect', value: sessionCount - score, color: '#E2E8F0' }, // Slate 200
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto bg-white">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Session Complete!</h2>
        <p className="text-slate-500 mb-8">Here is how you did.</p>

        <div className="w-64 h-64 mb-8 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
             <span className="text-4xl font-bold text-indigo-600">{percentage}%</span>
             <span className="text-xs text-slate-400 uppercase tracking-wide">Accuracy</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
             <div className="text-2xl font-bold text-slate-800">{score}</div>
             <div className="text-xs text-slate-500 uppercase">Correct</div>
           </div>
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
             <div className="text-2xl font-bold text-slate-800">{sessionCount - score}</div>
             <div className="text-xs text-slate-500 uppercase">Incorrect</div>
           </div>
        </div>

        <button 
          onClick={() => setMode(AppMode.HOME)}
          className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
        >
          Back to Home
        </button>
      </div>
    );
  };

  return (
    <>
      {mode === AppMode.HOME && renderHome()}
      {(mode === AppMode.QUIZ || mode === AppMode.REVIEW) && renderQuiz()}
      {mode === AppMode.STATS && renderStats()}
    </>
  );
};

export default App;