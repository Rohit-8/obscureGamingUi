// Physics Learning Games - All games properly exported from their respective folders
export { CircuitBuilder } from './CircuitBuilder';
export { OpticsLab } from './OpticsLab';
export { ThermodynamicsLab } from './ThermodynamicsLab';
export { ProjectileMotion } from './ProjectileMotion';
export { ElectromagneticField } from './ElectromagneticField';
export { QuantumPhysics } from './QuantumPhysics';
export { AtomicStructure } from './AtomicStructure';
export { GravitySimulator } from './GravitySimulator';

// Physics Games Registry
export const physicsGames = [
  {
    id: 'circuit-builder',
    name: 'Circuit Builder',
    component: 'CircuitBuilder',
    description: 'Build and analyze electrical circuits with realistic component behavior',
    difficulty: 'Intermediate',
    concepts: ['Ohm\'s Law', 'Circuit Analysis', 'Electrical Components', 'Current Flow'],
    icon: '⚡',
  },
  {
    id: 'optics-lab',
    name: 'Optics Laboratory',
    component: 'OpticsLab',
    description: 'Explore light behavior through lenses, mirrors, and prisms',
    difficulty: 'Advanced',
    concepts: ['Light Refraction', 'Ray Tracing', 'Optical Elements', 'Snell\'s Law'],
    icon: '🔬',
  },
  {
    id: 'thermodynamics-lab',
    name: 'Thermodynamics Lab',
    component: 'ThermodynamicsLab',
    description: 'Study gas behavior and thermodynamic properties with particle simulation',
    difficulty: 'Advanced',
    concepts: ['Gas Laws', 'Kinetic Theory', 'Heat Transfer', 'Thermodynamic Processes'],
    icon: '🌡️',
  },
  {
    id: 'projectile-motion',
    name: 'Projectile Motion',
    component: 'ProjectileMotion',
    description: 'Analyze trajectories with environmental factors and physics calculations',
    difficulty: 'Intermediate',
    concepts: ['Ballistics', 'Trajectory Analysis', 'Air Resistance', 'Launch Parameters'],
    icon: '🎯',
  },
  {
    id: 'electromagnetic-field',
    name: 'Electromagnetic Field',
    component: 'ElectromagneticField',
    description: 'Visualize electromagnetic fields and particle interactions',
    difficulty: 'Advanced',
    concepts: ['Electric Fields', 'Magnetic Fields', 'Lorentz Force', 'Maxwell Equations'],
    icon: '🧲',
  },
  {
    id: 'quantum-physics',
    name: 'Quantum Physics Lab',
    component: 'QuantumPhysics',
    description: 'Explore quantum mechanics through interactive experiments',
    difficulty: 'Expert',
    concepts: ['Wave-Particle Duality', 'Quantum Tunneling', 'Superposition', 'Uncertainty Principle'],
    icon: '🔬',
  },
  {
    id: 'atomic-structure',
    name: 'Atomic Structure Builder',
    component: 'AtomicStructure',
    description: 'Build atoms and explore nuclear physics with isotope simulation',
    difficulty: 'Advanced',
    concepts: ['Atomic Structure', 'Nuclear Physics', 'Electron Shells', 'Radioactive Decay'],
    icon: '⚛️',
  },
  {
    id: 'gravity-simulator',
    name: 'Gravity Simulator',
    component: 'GravitySimulator',
    description: 'Create gravitational systems and explore orbital mechanics',
    difficulty: 'Advanced',
    concepts: ['Gravitational Physics', 'Orbital Mechanics', 'Celestial Bodies', 'Kepler\'s Laws'],
    icon: '🌌',
  },
];

export default physicsGames;