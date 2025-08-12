import { useState, useCallback } from 'react';
import { DiceGameState, Die, DicePattern, ScoreCalculation } from '../types';

const INITIAL_ROLLS = 3;
const DICE_COUNT = 3;

export const useDiceGame = () => {
  const [gameState, setGameState] = useState<DiceGameState>({
    dice: Array(DICE_COUNT).fill(null).map(() => ({ value: 1, isRolling: false })),
    score: 0,
    bestScore: parseInt(localStorage.getItem('diceGameBestScore') || '0'),
    rollsLeft: INITIAL_ROLLS,
    isRolling: false,
    currentRoundScore: 0,
  });

  const calculateScore = useCallback((dice: Die[]): ScoreCalculation => {
    const values = dice.map(die => die.value).sort();
    const sum = values.reduce((acc, val) => acc + val, 0);

    // Check for triple same
    if (values[0] === values[1] && values[1] === values[2]) {
      return { pattern: 'triple-same', score: sum * 10, multiplier: 10 };
    }

    // Check for straight (1,2,3 or 2,3,4 or 3,4,5 or 4,5,6)
    if (values[0] + 1 === values[1] && values[1] + 1 === values[2]) {
      return { pattern: 'straight', score: sum * 4, multiplier: 4 };
    }

    // Check for triple different (all different values)
    if (values[0] !== values[1] && values[1] !== values[2] && values[0] !== values[2]) {
      return { pattern: 'triple-different', score: sum * 3, multiplier: 3 };
    }

    // Check for pair
    if (values[0] === values[1] || values[1] === values[2] || values[0] === values[2]) {
      return { pattern: 'pair', score: sum * 2, multiplier: 2 };
    }

    // Regular
    return { pattern: 'regular', score: sum, multiplier: 1 };
  }, []);

  const rollDice = useCallback(() => {
    if (gameState.rollsLeft <= 0 || gameState.isRolling) return;

    setGameState(prev => ({
      ...prev,
      isRolling: true,
      dice: prev.dice.map(die => ({ ...die, isRolling: true }))
    }));

    // Simulate rolling animation
    setTimeout(() => {
      const newDice = gameState.dice.map(() => ({
        value: Math.floor(Math.random() * 6) + 1,
        isRolling: false
      }));

      const scoreCalc = calculateScore(newDice);
      const newScore = gameState.score + scoreCalc.score;
      const newBestScore = Math.max(newScore, gameState.bestScore);

      if (newBestScore > gameState.bestScore) {
        localStorage.setItem('diceGameBestScore', newBestScore.toString());
      }

      setGameState(prev => ({
        ...prev,
        dice: newDice,
        score: newScore,
        bestScore: newBestScore,
        rollsLeft: prev.rollsLeft - 1,
        isRolling: false,
        currentRoundScore: scoreCalc.score
      }));
    }, 500);
  }, [gameState.dice, gameState.rollsLeft, gameState.isRolling, gameState.score, gameState.bestScore, calculateScore]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      dice: Array(DICE_COUNT).fill(null).map(() => ({ value: 1, isRolling: false })),
      score: 0,
      rollsLeft: INITIAL_ROLLS,
      isRolling: false,
      currentRoundScore: 0,
    }));
  }, []);

  return {
    gameState,
    rollDice,
    resetGame,
    calculateScore,
  };
};
