import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { Ball } from '../types';

interface PhysicsCanvasProps {
  balls: Ball[];
  showTrails: boolean;
  showVectors: boolean;
  width: number;
  height: number;
  onCanvasClick: (x: number, y: number) => void;
}

export const PhysicsCanvas: React.FC<PhysicsCanvasProps> = ({
  balls,
  showTrails,
  showVectors,
  width,
  height,
  onCanvasClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, width, height);

    // Draw trails
    if (showTrails) {
      balls.forEach(ball => {
        if (ball.trail.length > 1) {
          ctx.strokeStyle = ball.color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
          ball.trail.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
    }

    // Draw balls
    balls.forEach(ball => {
      // Ball shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(ball.x + 3, ball.y + 3, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ball
      const gradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3,
        ball.y - ball.radius * 0.3,
        0,
        ball.x,
        ball.y,
        ball.radius
      );
      gradient.addColorStop(0, ball.color);
      gradient.addColorStop(1, ball.color.replace('60%', '30%'));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ball outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Velocity vectors
      if (showVectors) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + ball.vx * 5, ball.y + ball.vy * 5);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(ball.vy, ball.vx);
        const headLength = 10;
        ctx.beginPath();
        ctx.moveTo(ball.x + ball.vx * 5, ball.y + ball.vy * 5);
        ctx.lineTo(
          ball.x + ball.vx * 5 - headLength * Math.cos(angle - Math.PI / 6),
          ball.y + ball.vy * 5 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(ball.x + ball.vx * 5, ball.y + ball.vy * 5);
        ctx.lineTo(
          ball.x + ball.vx * 5 - headLength * Math.cos(angle + Math.PI / 6),
          ball.y + ball.vy * 5 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });
  }, [balls, showTrails, showVectors, width, height]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    onCanvasClick(x, y);
  };

  return (
    <Box sx={{ border: '2px solid rgba(255, 255, 255, 0.2)', borderRadius: 2 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleClick}
        style={{
          display: 'block',
          cursor: 'crosshair',
          background: 'radial-gradient(circle at 30% 30%, #001122, #000011)'
        }}
      />
    </Box>
  );
};
