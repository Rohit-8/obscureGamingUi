export type GameClass = 9 | 10 | 11 | 12;
export type Subject = 'Physics' | 'Chemistry' | 'Mathematics';

export interface Game {
  id: string;
  title: string;
  topic: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number; // in minutes
}

export interface LearningGameData {
  [key: number]: {
    [subject in Subject]?: Game[];
  };
}

// Game-specific interfaces
export interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  timeElapsed: number;
  lives?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface PhysicsObject {
  position: Position;
  velocity: Velocity;
  acceleration?: Velocity;
  mass?: number;
  radius?: number;
  color?: string;
}

// Physics Game Types
export interface MotionGameState extends GameState {
  player: PhysicsObject;
  targets: PhysicsObject[];
  obstacles: PhysicsObject[];
  currentVelocity: Velocity;
  timeStep: number;
}

export interface WaveSimulationState {
  frequency: number;
  amplitude: number;
  wavelength: number;
  phase: number;
  waveType: 'sine' | 'cosine' | 'square' | 'triangle';
  waves: Wave[];
}

export interface Wave {
  id: string;
  frequency: number;
  amplitude: number;
  phase: number;
  color: string;
  type: 'sine' | 'cosine' | 'square' | 'triangle';
}

export interface OpticsGameState extends GameState {
  lightRays: LightRay[];
  lenses: OpticalElement[];
  mirrors: OpticalElement[];
  targets: Position[];
}

export interface LightRay {
  id: string;
  start: Position;
  direction: number; // angle in radians
  color: string;
  intensity: number;
  path: Position[];
}

export interface OpticalElement {
  id: string;
  type: 'lens' | 'mirror' | 'prism';
  position: Position;
  angle: number;
  focalLength?: number;
  reflectance?: number;
  refractiveIndex?: number;
}

// Chemistry Game Types
export interface Particle {
  id: string;
  type: 'atom' | 'molecule';
  element?: string;
  position: Position;
  velocity: Velocity;
  temperature: number;
  state: 'solid' | 'liquid' | 'gas' | 'plasma';
}

export interface ChemicalReaction {
  id: string;
  reactants: Molecule[];
  products: Molecule[];
  catalysts?: Molecule[];
  energyChange: number;
  rate: number;
  equilibriumConstant?: number;
}

export interface Molecule {
  id: string;
  formula: string;
  name: string;
  atoms: Atom[];
  bonds: Bond[];
  color: string;
  state: 'solid' | 'liquid' | 'gas';
}

export interface Atom {
  id: string;
  element: string;
  atomicNumber: number;
  massNumber: number;
  charge: number;
  position: Position;
  electronegativity: number;
}

export interface Bond {
  id: string;
  atom1Id: string;
  atom2Id: string;
  type: 'single' | 'double' | 'triple' | 'ionic' | 'metallic';
  strength: number;
}

// Mathematics Game Types
export interface NumberMazeState extends GameState {
  maze: MazeCell[][];
  playerPosition: Position;
  targetPosition: Position;
  collectedNumbers: number[];
  requiredClassification: 'rational' | 'irrational' | 'natural' | 'whole' | 'integer' | 'real';
}

export interface MazeCell {
  type: 'wall' | 'path' | 'number' | 'target';
  value?: number;
  classification?: string[];
}

export interface PolynomialGameState extends GameState {
  polynomials: Polynomial[];
  targetGraph: GraphPoint[];
  currentGraph: GraphPoint[];
  coefficients: number[];
}

export interface Polynomial {
  id: string;
  coefficients: number[];
  degree: number;
  factored?: string;
  roots?: number[];
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GeometryGameState extends GameState {
  shapes: Shape[];
  constraints: Constraint[];
  selectedPoints: Position[];
  currentTool: 'line' | 'circle' | 'polygon' | 'measure';
}

export interface Shape {
  id: string;
  type: 'line' | 'circle' | 'triangle' | 'rectangle' | 'polygon';
  points: Position[];
  properties: {
    area?: number;
    perimeter?: number;
    radius?: number;
    angles?: number[];
  };
  color: string;
}

export interface Constraint {
  id: string;
  type: 'distance' | 'angle' | 'parallel' | 'perpendicular' | 'equal';
  targets: string[]; // shape IDs
  value?: number;
  satisfied: boolean;
}

// Difficulty and Progression
export interface DifficultySettings {
  level: number;
  timeLimit?: number;
  complexityMultiplier: number;
  hintsAvailable: number;
  mistakesAllowed: number;
}

export interface PlayerProgress {
  gameId: string;
  currentLevel: number;
  bestScore: number;
  totalPlayTime: number;
  completedLevels: number[];
  unlockedFeatures: string[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: Date;
  icon: string;
}

// Animation and Effects
export interface AnimationState {
  isAnimating: boolean;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  loop: boolean;
}

export interface ParticleEffect {
  id: string;
  type: 'explosion' | 'sparkle' | 'trail' | 'glow' | 'ripple';
  position: Position;
  color: string;
  intensity: number;
  duration: number;
  particles: EffectParticle[];
}

export interface EffectParticle {
  id: string;
  position: Position;
  velocity: Velocity;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}