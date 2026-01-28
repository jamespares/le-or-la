import React, { useState, useEffect } from 'react';
import { Word, Gender } from '../types';
import { getWordExplanation } from '../services/geminiService';

interface FlashcardProps {
  word: Word;
  onAnswer: (correct: boolean) => void;
  isReviewMode?: boolean;
}

// Simple formatter to parse **bold** and *italic* markdown from Gemini
const formatAIResponse = (text: string) => {
  if (!text) return null;
  
  // Split by bold (**...**) first
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900 bg-indigo-50 px-1 rounded">{part.slice(2, -2)}</strong>;
    }
    
    // Split remaining parts by italic (*...*)
    return part.split(/(\*.*?\*)/g).map((subPart, j) => {
      if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
         return <em key={`${i}-${j}`} className="italic text-slate-800">{subPart.slice(1, -1)}</em>;
      }
      return <span key={`${i}-${j}`}>{subPart}</span>;
    });
  });
};

export const Flashcard: React.FC<FlashcardProps> = ({ word, onAnswer, isReviewMode = false }) => {
  const [flipped, setFlipped] = useState(false);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Reset state when word changes
  useEffect(() => {
    setFlipped(false);
    setSelectedGender(null);
    setExplanation(null);
    setLoadingExplanation(false);
  }, [word]);

  const handleChoice = (choice: Gender) => {
    if (flipped) return; // Prevent double guessing
    setSelectedGender(choice);
    setFlipped(true);
    // Don't call onAnswer immediately, let the user see the result first
  };

  const handleNext = () => {
    if (selectedGender) {
      onAnswer(selectedGender === word.gender);
    }
  };

  const isCorrect = selectedGender === word.gender;

  const fetchExplanation = async () => {
    setLoadingExplanation(true);
    const text = await getWordExplanation(word);
    setExplanation(text);
    setLoadingExplanation(false);
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 h-[550px]">
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}
      >
        {/* FRONT OF CARD */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col justify-between items-center">
          <div className="flex justify-between w-full text-slate-400 text-sm uppercase tracking-wider font-semibold">
             <span>{word.category}</span>
             {isReviewMode && <span className="text-orange-500"><i className="fas fa-sync-alt mr-1"></i> Review</span>}
          </div>
          
          <div className="text-center">
            <h2 className="text-5xl font-bold text-slate-800 mb-4 serif capitalize">{word.french}</h2>
            <p className="text-slate-500 text-xl italic">{word.english}</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleChoice(Gender.Masculine)}
              className="py-4 px-6 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg hover:bg-blue-100 transition-colors border-2 border-transparent hover:border-blue-200"
            >
              <span className="block text-sm font-normal mb-1 text-blue-400">Masculine</span>
              Un / Le
            </button>
            <button 
              onClick={() => handleChoice(Gender.Feminine)}
              className="py-4 px-6 rounded-xl bg-rose-50 text-rose-600 font-bold text-lg hover:bg-rose-100 transition-colors border-2 border-transparent hover:border-rose-200"
            >
              <span className="block text-sm font-normal mb-1 text-rose-400">Feminine</span>
              Une / La
            </button>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col justify-between overflow-hidden">
           <div className={`absolute top-0 left-0 w-full h-2 ${word.gender === Gender.Masculine ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
           
           <div className="mt-4 text-center flex-1 flex flex-col">
              <div className="mb-4">
                {isCorrect ? (
                  <span className="inline-block p-3 rounded-full bg-green-100 text-green-600 text-2xl">
                    <i className="fas fa-check"></i>
                  </span>
                ) : (
                  <span className="inline-block p-3 rounded-full bg-red-100 text-red-600 text-2xl">
                    <i className="fas fa-times"></i>
                  </span>
                )}
              </div>
              
              <h3 className="text-xl text-slate-500 mb-1">The correct answer is</h3>
              <div className={`text-4xl font-bold serif mb-6 ${word.gender === Gender.Masculine ? 'text-blue-600' : 'text-rose-600'}`}>
                {word.gender === Gender.Masculine ? "Un / Le " : "Une / La "}
                <span className="capitalize">{word.french}</span>
              </div>

              {!explanation && !loadingExplanation && (
                 <button 
                   onClick={fetchExplanation}
                   className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center justify-center mx-auto space-x-2 mt-auto mb-auto"
                 >
                   <i className="fas fa-sparkles"></i>
                   <span>Why? Ask AI</span>
                 </button>
              )}

              {loadingExplanation && (
                <div className="text-slate-400 text-sm animate-pulse mt-auto mb-auto">
                   Asking Gemini...
                </div>
              )}

              {explanation && (
                <div className="mt-2 p-4 bg-slate-50 rounded-lg text-left text-sm text-slate-600 leading-relaxed border border-slate-100 shadow-inner max-h-[160px] overflow-y-auto">
                  <div className="flex gap-3">
                    <i className="fas fa-robot text-indigo-400 mt-1 flex-shrink-0"></i>
                    <div>
                      {formatAIResponse(explanation)}
                    </div>
                  </div>
                </div>
              )}
           </div>

           <button 
             onClick={handleNext}
             className="w-full py-4 mt-4 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center space-x-2 flex-shrink-0"
           >
             <span>Next Word</span>
             <i className="fas fa-arrow-right"></i>
           </button>
        </div>
      </div>
    </div>
  );
};