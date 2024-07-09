'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';

export default function TypingTest() {
  const [words, setWords] = useState<string[]>([]);
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [typedWords, setTypedWords] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [wordStates, setWordStates] = useState<
    ('correct' | 'incorrect' | 'current' | 'upcoming')[]
  >([]);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const inputRef = useRef<HTMLInputElement>(null);

  const wordsPerLine = 16;

  const translations = {
    en: {
      title: 'Speed Test',
      time: 'Time',
      restart: 'Restart',
      typeHere: 'Type here...',
      correctWords: 'Correctly typed words',
      errors: 'Errors',
      accuracy: 'Accuracy',
      speed: 'Speed',
      wpm: 'WPM',
    },
    fr: {
      title: 'Test de Vitesse',
      time: 'Temps',
      restart: 'Recommencer',
      typeHere: 'Tapez ici...',
      correctWords: 'Mots correctement tapés',
      errors: 'Erreurs',
      accuracy: 'Précision',
      speed: 'Vitesse',
      wpm: 'MPM',
    },
  };

  const t = translations[language];

  const fetchWords = (lang: 'en' | 'fr') => {
    const endpoint = lang === 'en' ? '/api/en_words' : '/api/fr_words';
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => {
        const cleanedWords = data.map((word: string) =>
          word
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        );
        setWords(cleanedWords);
        restartTest(cleanedWords);
      })
      .catch((error) => console.error(`Error fetching ${lang} words:`, error));
  };

  useEffect(() => {
    fetchWords(language);
  }, [language]);

  const getRandomWords = (wordList: string[], count: number): string[] => {
    const shuffled = [...wordList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const restartTest = (wordList: string[] = words) => {
    const initialWords = getRandomWords(wordList, 200);
    setCurrentWords(initialWords);
    setWordStates(
      initialWords.map((_, index) => (index === 0 ? 'current' : 'upcoming'))
    );
    setTimeLeft(60);
    setIsActive(false);
    setTypedWords(0);
    setMistakes(0);
    setCurrentWordIndex(0);
    setCurrentLine(0);
    setInputValue('');
    if (inputRef.current) inputRef.current.focus();
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'fr' : 'en'));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (interval) clearInterval(interval);
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!isActive) {
      setIsActive(true);
    }

    if (value.endsWith(' ')) {
      const typedWord = value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const currentWord = currentWords[currentWordIndex];

      setWordStates((prev) => {
        const newStates = [...prev];
        newStates[currentWordIndex] =
          typedWord === currentWord ? 'correct' : 'incorrect';
        newStates[currentWordIndex + 1] = 'current';
        return newStates;
      });

      if (typedWord === currentWord) {
        setTypedWords((prev) => prev + 1);
      } else {
        setMistakes((prev) => prev + 1);
      }

      const nextWordIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextWordIndex);

      if (nextWordIndex % wordsPerLine === 0) {
        setCurrentLine((prev) => prev + 1);
      }

      setInputValue('');
    }
  };

  const accuracy =
    typedWords + mistakes > 0
      ? ((typedWords / (typedWords + mistakes)) * 100).toFixed(2)
      : '100.00';
  const wpm = Math.round((typedWords / 60) * 60);

  if (words.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-900 text-gray-100">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
        <h1 className="text-5xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          {t.title}
        </h1>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-semibold">
            {t.time}:{' '}
            <span className="text-blue-400 font-bold">{timeLeft}s</span>
          </div>
          <div className="space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-200 transform hover:scale-105"
            >
              {language === 'en' ? 'Français' : 'English'}
            </button>
            <button
              onClick={() => restartTest()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 transform hover:scale-105"
            >
              {t.restart}
            </button>
          </div>
        </div>
        <div className="p-6 bg-gray-700 rounded-lg shadow-inner overflow-hidden h-28 flex items-center">
          <div className="flex flex-wrap gap-2">
            {currentWords
              .slice(
                currentLine * wordsPerLine,
                (currentLine + 1) * wordsPerLine
              )
              .map((word, index) => (
                <span
                  key={index + currentLine * wordsPerLine}
                  className={`text-xl px-2 py-1 rounded ${
                    wordStates[index + currentLine * wordsPerLine] === 'current'
                      ? 'bg-yellow-300 text-gray-900 font-bold'
                      : wordStates[index + currentLine * wordsPerLine] ===
                        'correct'
                      ? 'text-green-400'
                      : wordStates[index + currentLine * wordsPerLine] ===
                        'incorrect'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}
                >
                  {word}
                </span>
              ))}
          </div>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full p-4 text-xl bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
          placeholder={t.typeHere}
          disabled={timeLeft === 0}
        />
        <div className="mt-6 p-6 bg-gray-700 rounded-lg shadow-inner space-y-4">
          <p className="text-2xl font-bold flex justify-between items-center">
            <span>{t.correctWords}:</span>
            <span className="text-green-400">{typedWords}</span>
          </p>
          <p className="text-2xl font-bold flex justify-between items-center">
            <span>{t.errors}:</span>
            <span className="text-red-400">{mistakes}</span>
          </p>
          <p className="text-2xl font-bold flex justify-between items-center">
            <span>{t.accuracy}:</span>
            <span className="text-blue-400">{accuracy}%</span>
          </p>
          <p className="text-2xl font-bold flex justify-between items-center">
            <span>{t.speed}:</span>
            <span className="text-purple-400">
              {wpm} {t.wpm}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
