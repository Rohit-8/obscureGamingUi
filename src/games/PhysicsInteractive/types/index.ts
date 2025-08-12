export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  trail: { x: number; y: number }[];
}

export interface PhysicsSettings {
  gravity: number;
  friction: number;
  bounce: number;
  airResistance: number;
}

export type SimulationType = 'gravity' | 'pendulum' | 'collision' | 'orbit';

export interface PhysicsGameState {
  balls: Ball[];
  isRunning: boolean;
  simulationType: SimulationType;
  settings: PhysicsSettings;
  showTrails: boolean;
  showVectors: boolean;
  canvasWidth: number;
  canvasHeight: number;
}
