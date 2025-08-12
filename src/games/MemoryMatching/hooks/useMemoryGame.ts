import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, GameState, MemoryGameState } from '../types';

const cardValues = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

export const useMemoryGame = () => {
  const [gameState, setGameState] = useState<MemoryGameState>({
    cards: [],
    flippedCards: [],
    score: 0,
    moves: 0,
    timeElapsed: 0,
    gameState: 'ready',
    showResult: false,
    bestScore: parseInt(localStorage.getItem('memoryGameBestScore') || '0')
  });

  const timerRef = useRef<NodeJS.Timeout>();

  const initializeGame = useCallback(() => {
    const shuffledCards = [...cardValues, ...cardValues]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));

    setGameState(prev => ({
      ...prev,
      cards: shuffledCards,
      flippedCards: [],
      score: 0,
      moves: 0,
      timeElapsed: 0,
      gameState: 'ready',
      showResult: false
    }));

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameState: 'playing' }));

    timerRef.current = setInterval(() => {
      setGameState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);
  }, []);

  const finishGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const finalScore = Math.max(0, 1000 - (gameState.moves * 10) - gameState.timeElapsed);
    const newBestScore = Math.max(finalScore, gameState.bestScore);

    if (newBestScore > gameState.bestScore) {
      localStorage.setItem('memoryGameBestScore', newBestScore.toString());
    }

    setGameState(prev => ({
      ...prev,
      gameState: 'finished',
      score: finalScore,
      bestScore: newBestScore,
      showResult: true
    }));
  }, [gameState.moves, gameState.timeElapsed, gameState.bestScore]);

  const flipCard = useCallback((cardId: number) => {
    if (gameState.gameState !== 'playing' || gameState.flippedCards.length >= 2) return;

    const card = gameState.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...gameState.flippedCards, cardId];

    setGameState(prev => ({
      ...prev,
      flippedCards: newFlippedCards,
      cards: prev.cards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    }));

    if (newFlippedCards.length === 2) {
      setGameState(prev => ({ ...prev, moves: prev.moves + 1 }));

      const [firstId, secondId] = newFlippedCards;
      const firstCard = gameState.cards.find(c => c.id === firstId);
      const secondCard = gameState.cards.find(c => c.id === secondId);

      setTimeout(() => {
        if (firstCard?.value === secondCard?.value) {
          // Match found
          setGameState(prev => ({
            ...prev,
            cards: prev.cards.map(c =>
              newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c
            ),
            flippedCards: []
          }));

          // Check if game is complete
          const updatedCards = gameState.cards.map(c =>
            newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c
          );

          if (updatedCards.every(c => c.isMatched || newFlippedCards.includes(c.id))) {
            finishGame();
          }
        } else {
          // No match, flip cards back
          setGameState(prev => ({
            ...prev,
            cards: prev.cards.map(c =>
              newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
            ),
            flippedCards: []
          }));
        }
      }, 1000);
    }
  }, [gameState.gameState, gameState.flippedCards, gameState.cards, finishGame]);

  const closeResultDialog = useCallback(() => {
    setGameState(prev => ({ ...prev, showResult: false }));
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    gameState,
    initializeGame,
    startGame,
    flipCard,
    closeResultDialog
  };
};
