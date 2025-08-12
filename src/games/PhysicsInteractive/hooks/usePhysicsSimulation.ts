import { useState, useCallback, useRef, useEffect } from 'react';
import { Ball, PhysicsSettings, SimulationType, PhysicsGameState } from '../types';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const usePhysicsSimulation = () => {
  const [gameState, setGameState] = useState<PhysicsGameState>({
    balls: [],
    isRunning: false,
    simulationType: 'gravity',
    settings: {
      gravity: 0.5,
      friction: 0.99,
      bounce: 0.8,
      airResistance: 0.999
    },
    showTrails: true,
    showVectors: false,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT
  });

  const animationRef = useRef<number>();

  const createBall = useCallback((x: number, y: number, vx = 0, vy = 0): Ball => {
    return {
      id: Date.now() + Math.random(),
      x,
      y,
      vx,
      vy,
      radius: 15 + Math.random() * 20,
      mass: 1,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      trail: []
    };
  }, []);

  const addBall = useCallback((x: number, y: number, vx = 0, vy = 0) => {
    const newBall = createBall(x, y, vx, vy);
    setGameState(prev => ({
      ...prev,
      balls: [...prev.balls, newBall]
    }));
  }, [createBall]);

  const clearBalls = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      balls: []
    }));
  }, []);

  const updatePhysics = useCallback((balls: Ball[], settings: PhysicsSettings, simulationType: SimulationType) => {
    return balls.map(ball => {
      let newBall = { ...ball };

      // Add current position to trail
      if (gameState.showTrails) {
        newBall.trail = [...ball.trail.slice(-20), { x: ball.x, y: ball.y }];
      }

      // Apply different physics based on simulation type
      switch (simulationType) {
        case 'gravity':
          newBall.vy += settings.gravity;
          break;

        case 'orbit':
          // Simple orbital mechanics around center
          const centerX = CANVAS_WIDTH / 2;
          const centerY = CANVAS_HEIGHT / 2;
          const dx = centerX - ball.x;
          const dy = centerY - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = 2000 / (distance * distance);
          newBall.vx += (dx / distance) * force;
          newBall.vy += (dy / distance) * force;
          break;

        case 'pendulum':
          // Simple pendulum physics
          const pivotX = CANVAS_WIDTH / 2;
          const pivotY = 50;
          const pendulumDx = pivotX - ball.x;
          const pendulumDy = pivotY - ball.y;
          const pendulumAngle = Math.atan2(pendulumDy, pendulumDx);
          newBall.vx += Math.cos(pendulumAngle) * 0.1;
          newBall.vy += Math.sin(pendulumAngle) * 0.1;
          newBall.vy += settings.gravity * 0.5;
          break;

        case 'collision':
          // Just basic gravity for collision demo
          newBall.vy += settings.gravity;
          break;
      }

      // Apply air resistance
      newBall.vx *= settings.airResistance;
      newBall.vy *= settings.airResistance;

      // Update position
      newBall.x += newBall.vx;
      newBall.y += newBall.vy;

      // Boundary collisions
      if (newBall.x - newBall.radius < 0) {
        newBall.x = newBall.radius;
        newBall.vx *= -settings.bounce;
      }
      if (newBall.x + newBall.radius > CANVAS_WIDTH) {
        newBall.x = CANVAS_WIDTH - newBall.radius;
        newBall.vx *= -settings.bounce;
      }
      if (newBall.y - newBall.radius < 0) {
        newBall.y = newBall.radius;
        newBall.vy *= -settings.bounce;
      }
      if (newBall.y + newBall.radius > CANVAS_HEIGHT) {
        newBall.y = CANVAS_HEIGHT - newBall.radius;
        newBall.vy *= -settings.bounce;
        newBall.vx *= settings.friction;
      }

      return newBall;
    });
  }, [gameState.showTrails]);

  const checkCollisions = useCallback((balls: Ball[]) => {
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const ball1 = balls[i];
        const ball2 = balls[j];

        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball1.radius + ball2.radius) {
          // Simple elastic collision
          const angle = Math.atan2(dy, dx);
          const sin = Math.sin(angle);
          const cos = Math.cos(angle);

          // Separate balls
          const overlap = ball1.radius + ball2.radius - distance;
          ball1.x -= overlap * 0.5 * cos;
          ball1.y -= overlap * 0.5 * sin;
          ball2.x += overlap * 0.5 * cos;
          ball2.y += overlap * 0.5 * sin;

          // Exchange velocities
          const v1 = ball1.vx * cos + ball1.vy * sin;
          const v2 = ball2.vx * cos + ball2.vy * sin;

          ball1.vx = ball1.vx - v1 * cos + v2 * cos;
          ball1.vy = ball1.vy - v1 * sin + v2 * sin;
          ball2.vx = ball2.vx - v2 * cos + v1 * cos;
          ball2.vy = ball2.vy - v2 * sin + v1 * sin;
        }
      }
    }
  }, []);

  const animate = useCallback(() => {
    setGameState(prev => {
      const updatedBalls = updatePhysics(prev.balls, prev.settings, prev.simulationType);

      if (prev.simulationType === 'collision') {
        checkCollisions(updatedBalls);
      }

      return {
        ...prev,
        balls: updatedBalls
      };
    });
  }, [updatePhysics, checkCollisions]);

  const startSimulation = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const stopSimulation = useCallback(() => {
    setGameState(prev => ({ ...prev, isRunning: false }));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const setSimulationType = useCallback((type: SimulationType) => {
    setGameState(prev => ({ ...prev, simulationType: type, balls: [] }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<PhysicsSettings>) => {
    setGameState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  const toggleTrails = useCallback(() => {
    setGameState(prev => ({ ...prev, showTrails: !prev.showTrails }));
  }, []);

  const toggleVectors = useCallback(() => {
    setGameState(prev => ({ ...prev, showVectors: !prev.showVectors }));
  }, []);

  // Animation loop
  useEffect(() => {
    if (gameState.isRunning) {
      const loop = () => {
        animate();
        animationRef.current = requestAnimationFrame(loop);
      };
      animationRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isRunning, animate]);

  return {
    gameState,
    addBall,
    clearBalls,
    startSimulation,
    stopSimulation,
    setSimulationType,
    updateSettings,
    toggleTrails,
    toggleVectors
  };
};
