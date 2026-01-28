import { GoogleGenAI } from "@google/genai";
import { Word, Gender } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getWordExplanation = async (word: Word): Promise<string> => {
  if (!apiKey) {
    return "API Key missing. Cannot generate explanation.";
  }

  try {
    const genderStr = word.gender === Gender.Masculine ? 'masculine' : 'feminine';
    const prompt = `
      The French word "${word.french}" (${word.english}) is ${genderStr}. 
      Explain briefly why it has this gender (if there's a rule, pattern, or ending like -e, -tion) 
      or provide a very short mnemonic. 
      Then provide one simple French sentence using the word correctly.
      
      Formatting rules:
      - Use **bold** for the French word and key grammar terms.
      - Use *italics* for the example sentence.
      - Keep it under 50 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not load explanation at this time.";
  }
};