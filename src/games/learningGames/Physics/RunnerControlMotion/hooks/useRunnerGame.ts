import { useState, useEffect, useCallback, useRef } from 'react';
import { MotionGameState, Velocity, Position, PhysicsObject } from '../../../types';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PLAYER_RADIUS = 15;
const TARGET_RADIUS = 10;
const OBSTACLE_RADIUS = 12;
const FRICTION = 0.98;
const MAX_VELOCITY = 200;
const TIME_STEP = 0.016; // 60 FPS

export const useRunnerGame = () => {
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetsHit, setTargetsHit] = useState(0);
  const [totalTargets, setTotalTargets] = useState(0);

  const [gameState, setGameState] = useState<MotionGameState>({
    score: 0,
    level: 1,
    isPlaying: false,
    timeElapsed: 0,
    lives: 3,
    player: {
      position: { x: 50, y: CANVAS_HEIGHT / 2 },
      velocity: { vx: 0, vy: 0 },
      acceleration: { vx: 0, vy: 0 },
      mass: 1,
      radius: PLAYER_RADIUS,
      color: '#2196f3',
    },
    targets: [],
    obstacles: [],
    currentVelocity: { vx: 0, vy: 0 },
    timeStep: TIME_STEP,
  });

  const generateTargets = useCallback((level: number): PhysicsObject[] => {
    const targets: PhysicsObject[] = [];
    const targetCount = Math.min(3 + level, 8);
    
    for (let i = 0; i < targetCount; i++) {
      const x = 200 + (i * (CANVAS_WIDTH - 300)) / (targetCount - 1);
      const y = 50 + Math.random() * (CANVAS_HEIGHT - 100);
      
      targets.push({
        position: { x, y },
        velocity: { vx: 0, vy: 0 },
        radius: TARGET_RADIUS,
        color: '#4caf50',
      });
    }
    
    return targets;
  }, []);

  const generateObstacles = useCallback((level: number): PhysicsObject[] => {
    const obstacles: PhysicsObject[] = [];
    const obstacleCount = Math.floor(level / 2);
    
    for (let i = 0; i < obstacleCount; i++) {
      const x = 150 + Math.random() * (CANVAS_WIDTH - 200);
      const y = 30 + Math.random() * (CANVAS_HEIGHT - 60);
      
      obstacles.push({
        position: { x, y },
        velocity: { vx: 0, vy: 0 },
        radius: OBSTACLE_RADIUS,
        color: '#f44336',
      });
    }
    
    return obstacles;
  }, []);

  const startLevel = useCallback(() => {
    const targets = generateTargets(currentLevel);
    const obstacles = generateObstacles(currentLevel);
    
    setGameState((prev: MotionGameState) => ({
      ...prev,
      isPlaying: true,
      targets,
      obstacles,
      player: {
        ...prev.player,
        position: { x: 50, y: CANVAS_HEIGHT / 2 },
        velocity: { vx: 0, vy: 0 },
        acceleration: { vx: 0, vy: 0 },
      },
    }));
    
    setTargetsHit(0);
    setTotalTargets(targets.length);
    setTimeElapsed(0);
    setIsPlaying(true);
  }, [currentLevel, generateTargets, generateObstacles]);

  const pauseGame = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resetGame = useCallback(() => {
    setCurrentLevel(1);
    setScore(0);
    setTimeElapsed(0);
    setIsPlaying(false);
    setTargetsHit(0);
    setTotalTargets(0);
    
    setGameState((prev: MotionGameState) => ({
      ...prev,
      isPlaying: false,
      score: 0,
      level: 1,
      timeElapsed: 0,
      player: {
        ...prev.player,
        position: { x: 50, y: CANVAS_HEIGHT / 2 },
        velocity: { vx: 0, vy: 0 },
        acceleration: { vx: 0, vy: 0 },
      },
      targets: [],
      obstacles: [],
    }));
  }, []);

  const updateVelocity = useCallback((velocity: Velocity) => {
    // Clamp velocity to maximum values
    const clampedVx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity.vx));
    const clampedVy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocity.vy));
    
    setGameState((prev: MotionGameState) => ({
      ...prev,
      player: {
        ...prev.player,
        velocity: { vx: clampedVx, vy: clampedVy },
      },
      currentVelocity: { vx: clampedVx, vy: clampedVy },
    }));
  }, []);

  const updateAcceleration = useCallback((acceleration: Velocity) => {
    setGameState((prev: MotionGameState) => ({
      ...prev,
      player: {
        ...prev.player,
        acceleration,
      },
    }));
  }, []);

  const checkCollisions = useCallback((player: PhysicsObject, targets: PhysicsObject[], obstacles: PhysicsObject[]) => {
    let newTargets = [...targets];
    let hitTarget = false;
    let hitObstacle = false;

    // Check target collisions
    newTargets = newTargets.filter(target => {
      const dx = player.position.x - target.position.x;
      const dy = player.position.y - target.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < (player.radius || 0) + (target.radius || 0)) {
        hitTarget = true;
        return false;
      }
      return true;
    });

    // Check obstacle collisions
    obstacles.forEach(obstacle => {
      const dx = player.position.x - obstacle.position.x;
      const dy = player.position.y - obstacle.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < (player.radius || 0) + (obstacle.radius || 0)) {
        hitObstacle = true;
      }
    });

    return { newTargets, hitTarget, hitObstacle };
  }, []);

  const updatePhysics = useCallback((deltaTime: number) => {
    setGameState((prev: MotionGameState) => {
      if (!prev.isPlaying) return prev;

      const player = { ...prev.player };
      const acceleration = player.acceleration || { vx: 0, vy: 0 };
      
      // Update velocity based on acceleration
      player.velocity.vx += acceleration.vx * deltaTime;
      player.velocity.vy += acceleration.vy * deltaTime;
      
      // Apply friction
      player.velocity.vx *= FRICTION;
      player.velocity.vy *= FRICTION;
      
      // Update position based on velocity
      player.position.x += player.velocity.vx * deltaTime;
      player.position.y += player.velocity.vy * deltaTime;
      
      // Boundary constraints
      player.position.x = Math.max(player.radius || 0, Math.min(CANVAS_WIDTH - (player.radius || 0), player.position.x));
      player.position.y = Math.max(player.radius || 0, Math.min(CANVAS_HEIGHT - (player.radius || 0), player.position.y));
      
      // Check collisions
      const { newTargets, hitTarget, hitObstacle } = checkCollisions(player, prev.targets, prev.obstacles);
      
      let newScore = prev.score;
      if (hitTarget) {
        newScore += 100 * currentLevel;
        setTargetsHit(prev => prev + 1);
      }
      
      if (hitObstacle) {
        // Reduce velocity when hitting obstacles
        player.velocity.vx *= 0.5;
        player.velocity.vy *= 0.5;
      }

      return {
        ...prev,
        player,
        targets: newTargets,
        score: newScore,
        currentVelocity: player.velocity,
      };
    });
  }, [checkCollisions, currentLevel]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!isPlaying) return;

    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    if (deltaTime < 0.1) { // Prevent large time jumps
      updatePhysics(deltaTime);
      setTimeElapsed(prev => prev + deltaTime);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, updatePhysics]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  // Check level completion
  useEffect(() => {
    if (targetsHit === totalTargets && totalTargets > 0) {
      setIsPlaying(false);
      setScore(prev => prev + 500 * currentLevel + Math.floor((30 - timeElapsed) * 10));
      
      setTimeout(() => {
        setCurrentLevel(prev => prev + 1);
        // Auto-start next level after a short delay
        setTimeout(startLevel, 1000);
      }, 2000);
    }
  }, [targetsHit, totalTargets, currentLevel, timeElapsed, startLevel]);

  return {
    gameState,
    startLevel,
    pauseGame,
    resetGame,
    updateVelocity,
    updateAcceleration,
    isPlaying,
    currentLevel,
    score,
    timeElapsed,
    targetsHit,
    totalTargets,
  };
};