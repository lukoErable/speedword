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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/words')
      .then((response) => response.json())
      .then((data) => {
        setWords(data);
        setCurrentWords(getRandomWords(data, 50));
      })
      .catch((error) => console.error('Error fetching words:', error));
  }, []);

  const getRandomWords = (wordList: string[], count: number): string[] => {
    const shuffled = [...wordList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
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
      const typedWord = value.trim();
      const currentWord = currentWords[0];

      if (typedWord === currentWord) {
        setTypedWords((prev) => prev + 1);
      } else {
        setMistakes((prev) => prev + 1);
      }

      setCurrentWords((prev) => [
        ...prev.slice(1),
        ...getRandomWords(words, 1),
      ]);
      setInputValue('');
    }
  };

  if (words.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-2xl mb-4">Test de vitesse de frappe</h1>
        <div className="mb-4">Temps restant: {timeLeft} secondes</div>
        <div className="mb-4">
          Mots à taper: {currentWords.slice(0, 10).join(' ')}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          placeholder="Commencez à taper ici..."
          disabled={timeLeft === 0}
        />
        {timeLeft === 0 && (
          <div className="mt-4">
            <p>Mots correctement tapés: {typedWords}</p>
            <p>Erreurs: {mistakes}</p>
          </div>
        )}
      </div>
    </main>
  );
}
