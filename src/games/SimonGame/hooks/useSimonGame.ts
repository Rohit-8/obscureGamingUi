import { useState, useCallback, useEffect } from 'react';
import { GameColor, GameState, SimonGameState, ColorConfig } from '../types';

const colors: GameColor[] = ['red', 'blue', 'green', 'yellow'];

export const colorMap: Record<GameColor, ColorConfig> = {
  red: { bg: '#ff4444', active: '#ff6666', sound: 260 },
  blue: { bg: '#4444ff', active: '#6666ff', sound: 330 },
  green: { bg: '#44ff44', active: '#66ff66', sound: 392 },
  yellow: { bg: '#ffff44', active: '#ffff66', sound: 523 },
};

export const useSimonGame = () => {
  const [gameState, setGameState] = useState<SimonGameState>({
    sequence: [],
    playerSequence: [],
    isDisplaying: false,
    activeColor: null,
    gameState: 'ready',
    level: 0,
    highScore: parseInt(localStorage.getItem('simonHighScore') || '0'),
    showResult: false,
    soundEnabled: true,
  });

  const playSound = useCallback((frequency: number, duration: number = 300) => {
    if (!gameState.soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [gameState.soundEnabled]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      sequence: [],
      playerSequence: [],
      level: 0,
      gameState: 'playing',
      showResult: false
    }));
  }, []);

  const addToSequence = useCallback(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setGameState(prev => ({
      ...prev,
      sequence: [...prev.sequence, randomColor],
      playerSequence: []
    }));
  }, []);

  const displaySequence = useCallback(async (seq: GameColor[]) => {
    setGameState(prev => ({
      ...prev,
      isDisplaying: true,
      gameState: 'waiting'
    }));

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setGameState(prev => ({ ...prev, activeColor: seq[i] }));
      playSound(colorMap[seq[i]].sound);
      await new Promise(resolve => setTimeout(resolve, 400));
      setGameState(prev => ({ ...prev, activeColor: null }));
    }

    setGameState(prev => ({
      ...prev,
      isDisplaying: false,
      gameState: 'playing'
    }));
  }, [playSound]);

  const handleColorClick = useCallback((color: GameColor) => {
    if (gameState.gameState !== 'playing' || gameState.isDisplaying) return;

    playSound(colorMap[color].sound, 200);
    setGameState(prev => ({ ...prev, activeColor: color }));
    setTimeout(() => setGameState(prev => ({ ...prev, activeColor: null })), 200);

    const newPlayerSequence = [...gameState.playerSequence, color];

    // Check if the current input is correct
    if (color !== gameState.sequence[newPlayerSequence.length - 1]) {
      gameOver();
      return;
    }

    setGameState(prev => ({ ...prev, playerSequence: newPlayerSequence }));

    // Check if player completed the sequence
    if (newPlayerSequence.length === gameState.sequence.length) {
      const newLevel = gameState.level + 1;
      setGameState(prev => ({ ...prev, level: newLevel }));

      setTimeout(() => {
        addToSequence();
      }, 1000);
    }
  }, [gameState.gameState, gameState.isDisplaying, gameState.playerSequence, gameState.sequence, gameState.level, playSound, addToSequence]);

  const gameOver = useCallback(() => {
    const newHighScore = Math.max(gameState.level, gameState.highScore);

    if (newHighScore > gameState.highScore) {
      localStorage.setItem('simonHighScore', newHighScore.toString());
    }

    setGameState(prev => ({
      ...prev,
      gameState: 'game-over',
      highScore: newHighScore,
      showResult: true
    }));
  }, [gameState.level, gameState.highScore]);

  const toggleSound = useCallback(() => {
    setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  }, []);

  const closeResultDialog = useCallback(() => {
    setGameState(prev => ({ ...prev, showResult: false, gameState: 'ready' }));
  }, []);

  // Effect to start sequence display when sequence changes
  useEffect(() => {
    if (gameState.sequence.length > 0 && gameState.gameState === 'playing') {
      displaySequence(gameState.sequence);
    }
  }, [gameState.sequence, displaySequence]);

  // Effect to add to sequence when starting
  useEffect(() => {
    if (gameState.gameState === 'playing' && gameState.sequence.length === 0) {
      addToSequence();
    }
  }, [gameState.gameState, gameState.sequence.length, addToSequence]);

  return {
    gameState,
    startGame,
    handleColorClick,
    toggleSound,
    closeResultDialog,
    colorMap
  };
};
