import { useState, useCallback, useEffect, useRef } from 'react';
import { Mole, GameState, WhackAMoleGameState } from '../types';

const GAME_DURATION = 60; // seconds
const MOLE_COUNT = 9;

export const useWhackAMole = () => {
  const [gameState, setGameState] = useState<WhackAMoleGameState>({
    moles: Array.from({ length: MOLE_COUNT }, (_, i) => ({
      id: i,
      isVisible: false,
      timeLeft: 0,
      wasHit: false
    })),
    score: 0,
    timeLeft: GAME_DURATION,
    gameState: 'ready',
    highScore: parseInt(localStorage.getItem('whackAMoleHighScore') || '0'),
    showResult: false,
    difficulty: 'medium',
    missedMoles: 0
  });

  const gameTimerRef = useRef<NodeJS.Timeout>();
  const moleTimersRef = useRef<NodeJS.Timeout[]>([]);

  const getDifficultySettings = useCallback(() => {
    switch (gameState.difficulty) {
      case 'easy': return { minInterval: 1500, maxInterval: 3000, moleTime: 2000 };
      case 'medium': return { minInterval: 1000, maxInterval: 2000, moleTime: 1500 };
      case 'hard': return { minInterval: 500, maxInterval: 1200, moleTime: 1000 };
    }
  }, [gameState.difficulty]);

  const spawnMole = useCallback(() => {
    if (gameState.gameState !== 'playing') return;

    const visibleMoles = gameState.moles.filter(m => m.isVisible);
    if (visibleMoles.length >= 3) return; // Max 3 moles at once

    const availableMoles = gameState.moles.filter(m => !m.isVisible);
    if (availableMoles.length === 0) return;

    const randomMole = availableMoles[Math.floor(Math.random() * availableMoles.length)];
    const { moleTime } = getDifficultySettings();

    setGameState(prev => ({
      ...prev,
      moles: prev.moles.map(m =>
        m.id === randomMole.id
          ? { ...m, isVisible: true, timeLeft: moleTime, wasHit: false }
          : m
      )
    }));

    // Auto-hide mole after timeout
    const timer = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        moles: prev.moles.map(m =>
          m.id === randomMole.id && !m.wasHit
            ? { ...m, isVisible: false, timeLeft: 0 }
            : m
        ),
        missedMoles: prev.moles.find(m => m.id === randomMole.id)?.wasHit
          ? prev.missedMoles
          : prev.missedMoles + 1
      }));
    }, moleTime);

    moleTimersRef.current[randomMole.id] = timer;
  }, [gameState.gameState, gameState.moles, getDifficultySettings]);

  const whackMole = useCallback((moleId: number) => {
    const mole = gameState.moles.find(m => m.id === moleId);
    if (!mole || !mole.isVisible || mole.wasHit) return;

    // Clear the auto-hide timer
    if (moleTimersRef.current[moleId]) {
      clearTimeout(moleTimersRef.current[moleId]);
    }

    setGameState(prev => ({
      ...prev,
      moles: prev.moles.map(m =>
        m.id === moleId
          ? { ...m, isVisible: false, wasHit: true, timeLeft: 0 }
          : m
      ),
      score: prev.score + 10
    }));
  }, [gameState.moles]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameState: 'playing',
      score: 0,
      timeLeft: GAME_DURATION,
      missedMoles: 0,
      moles: prev.moles.map(m => ({ ...m, isVisible: false, timeLeft: 0, wasHit: false }))
    }));

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, gameState: 'finished', showResult: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    // Start mole spawning
    const spawnInterval = setInterval(() => {
      spawnMole();
    }, 800);

    moleTimersRef.current.push(spawnInterval);
  }, [spawnMole]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameState: 'paused' }));
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameState: 'playing' }));
    startGame();
  }, [startGame]);

  const endGame = useCallback(() => {
    const newHighScore = Math.max(gameState.score, gameState.highScore);
    if (newHighScore > gameState.highScore) {
      localStorage.setItem('whackAMoleHighScore', newHighScore.toString());
    }

    setGameState(prev => ({
      ...prev,
      gameState: 'finished',
      highScore: newHighScore,
      showResult: true
    }));

    // Clear all timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    moleTimersRef.current.forEach(timer => clearTimeout(timer));
    moleTimersRef.current = [];
  }, [gameState.score, gameState.highScore]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameState: 'ready',
      score: 0,
      timeLeft: GAME_DURATION,
      missedMoles: 0,
      showResult: false,
      moles: prev.moles.map(m => ({ ...m, isVisible: false, timeLeft: 0, wasHit: false }))
    }));

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    moleTimersRef.current.forEach(timer => clearTimeout(timer));
    moleTimersRef.current = [];
  }, []);

  const closeResult = useCallback(() => {
    setGameState(prev => ({ ...prev, showResult: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      moleTimersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    resetGame,
    whackMole,
    closeResult
  };
};
