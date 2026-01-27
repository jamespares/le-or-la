export enum Gender {
  Masculine = 'm',
  Feminine = 'f'
}

export interface Word {
  id: string;
  french: string;
  english: string;
  gender: Gender;
  category: 'Common' | 'Home' | 'Work' | 'Skiing';
  example?: string;
}

export interface QuizState {
  currentWordIndex: number;
  correctCount: number;
  incorrectIds: string[];
  isFinished: boolean;
  history: { wordId: string; correct: boolean }[];
}

export enum AppMode {
  HOME = 'HOME',
  QUIZ = 'QUIZ',
  REVIEW = 'REVIEW',
  STATS = 'STATS'
}