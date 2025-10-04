import React, { useRef, useEffect } from 'react';
import { MotionGameState } from '../../../types';

interface MotionCanvasProps {
  gameState: MotionGameState;
  width: number;
  height: number;
}

export const MotionCanvas: React.FC<MotionCanvasProps> = ({
  gameState,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0b1220'; // Dark background to match theme
    ctx.fillRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.2)'; // Blue-tinted grid lines
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw player
    if (gameState.player) {
      const player = gameState.player;
      ctx.fillStyle = player.color || '#2196f3';
      ctx.beginPath();
      ctx.arc(player.position.x, player.position.y, player.radius || 15, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw player direction indicator
      const speed = Math.sqrt(player.velocity.vx ** 2 + player.velocity.vy ** 2);
      if (speed > 5) {
        const angle = Math.atan2(player.velocity.vy, player.velocity.vx);
        const arrowLength = Math.min(speed / 3, 30);
        
        ctx.strokeStyle = '#1976d2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.position.x, player.position.y);
        ctx.lineTo(
          player.position.x + Math.cos(angle) * arrowLength,
          player.position.y + Math.sin(angle) * arrowLength
        );
        ctx.stroke();
        
        // Arrow head
        ctx.fillStyle = '#1976d2';
        const headLength = 8;
        const headAngle = Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(
          player.position.x + Math.cos(angle) * arrowLength,
          player.position.y + Math.sin(angle) * arrowLength
        );
        ctx.lineTo(
          player.position.x + Math.cos(angle - headAngle) * (arrowLength - headLength),
          player.position.y + Math.sin(angle - headAngle) * (arrowLength - headLength)
        );
        ctx.lineTo(
          player.position.x + Math.cos(angle + headAngle) * (arrowLength - headLength),
          player.position.y + Math.sin(angle + headAngle) * (arrowLength - headLength)
        );
        ctx.closePath();
        ctx.fill();
      }
    }

    // Draw targets
    gameState.targets.forEach((target, index) => {
      ctx.fillStyle = target.color || '#4caf50';
      ctx.beginPath();
      ctx.arc(target.position.x, target.position.y, target.radius || 10, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add target number
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        (index + 1).toString(),
        target.position.x,
        target.position.y + 4
      );
      
      // Pulsing effect
      ctx.strokeStyle = target.color || '#4caf50';
      ctx.lineWidth = 2;
      const pulseRadius = (target.radius || 10) + Math.sin(Date.now() * 0.005) * 5;
      ctx.beginPath();
      ctx.arc(target.position.x, target.position.y, pulseRadius, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Draw obstacles
    gameState.obstacles.forEach((obstacle) => {
      ctx.fillStyle = obstacle.color || '#f44336';
      ctx.beginPath();
      ctx.arc(obstacle.position.x, obstacle.position.y, obstacle.radius || 12, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add warning symbol
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('!', obstacle.position.x, obstacle.position.y + 5);
    });

    // Draw trajectory path (if player is moving)
    if (gameState.player && (gameState.player.velocity.vx !== 0 || gameState.player.velocity.vy !== 0)) {
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      let x = gameState.player.position.x;
      let y = gameState.player.position.y;
      let vx = gameState.player.velocity.vx;
      let vy = gameState.player.velocity.vy;
      const ax = gameState.player.acceleration?.vx || 0;
      const ay = gameState.player.acceleration?.vy || 0;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      // Draw trajectory for next 2 seconds
      const timeStep = 0.1;
      for (let t = timeStep; t <= 2; t += timeStep) {
        // Update position using kinematic equations
        const newX = gameState.player.position.x + vx * t + 0.5 * ax * t * t;
        const newY = gameState.player.position.y + vy * t + 0.5 * ay * t * t;
        
        if (newX < 0 || newX > width || newY < 0 || newY > height) break;
        
        ctx.lineTo(newX, newY);
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [gameState, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        border: '1px solid rgba(96, 165, 250, 0.3)',
        borderRadius: '8px',
        width: '100%',
        height: 'auto',
        maxWidth: `${width}px`,
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
};