import { GameClass, DifficultySettings } from '../types';

export class DifficultyProgression {
  static getDifficultySettings(gameClass: GameClass, currentLevel: number): DifficultySettings {
    const baseSettings: DifficultySettings = {
      level: currentLevel,
      complexityMultiplier: 1,
      hintsAvailable: 3,
      mistakesAllowed: 5,
    };

    // Adjust settings based on class level
    const classMultiplier = (gameClass - 8) * 0.2; // 9th class = 0.2, 12th class = 0.8
    
    // Adjust settings based on current level
    const levelMultiplier = Math.min(currentLevel * 0.1, 2.0);

    return {
      ...baseSettings,
      complexityMultiplier: 1 + classMultiplier + levelMultiplier,
      timeLimit: Math.max(30, 120 - (currentLevel * 5) - (gameClass - 9) * 10),
      hintsAvailable: Math.max(1, 3 - Math.floor(currentLevel / 3)),
      mistakesAllowed: Math.max(1, 5 - Math.floor(currentLevel / 2)),
    };
  }

  static calculateScore(baseScore: number, settings: DifficultySettings, timeBonus: number = 0): number {
    const difficultyBonus = settings.complexityMultiplier * 100;
    const levelBonus = settings.level * 50;
    return Math.round(baseScore + difficultyBonus + levelBonus + timeBonus);
  }

  static getNextLevelRequirement(currentLevel: number): number {
    return Math.round(1000 * Math.pow(1.5, currentLevel - 1));
  }

  static shouldUnlockFeature(totalScore: number, feature: string): boolean {
    const unlockRequirements: Record<string, number> = {
      'advanced_controls': 500,
      'custom_levels': 1000,
      'multiplayer': 2000,
      'achievements': 100,
      'leaderboard': 300,
    };

    return totalScore >= (unlockRequirements[feature] || 0);
  }
}

export const gameAchievements = {
  physics: [
    { id: 'first_motion', title: 'Newton\'s Apprentice', description: 'Complete first motion level', icon: '🍎' },
    { id: 'wave_master', title: 'Wave Master', description: 'Create perfect wave interference', icon: '🌊' },
    { id: 'optics_expert', title: 'Light Bender', description: 'Complete all optics challenges', icon: '🔍' },
    { id: 'circuit_genius', title: 'Circuit Genius', description: 'Build complex circuits', icon: '⚡' },
  ],
  chemistry: [
    { id: 'particle_explorer', title: 'Particle Explorer', description: 'Observe all phase transitions', icon: '⚛️' },
    { id: 'reaction_master', title: 'Reaction Master', description: 'Balance 50 chemical equations', icon: '🧪' },
    { id: 'molecule_builder', title: 'Molecule Architect', description: 'Build complex organic molecules', icon: '🔬' },
    { id: 'periodic_pro', title: 'Periodic Pro', description: 'Master periodic trends', icon: '🧮' },
  ],
  mathematics: [
    { id: 'number_navigator', title: 'Number Navigator', description: 'Complete number classification maze', icon: '🔢' },
    { id: 'polynomial_pro', title: 'Polynomial Pro', description: 'Factor complex polynomials', icon: '📊' },
    { id: 'geometry_genius', title: 'Geometry Genius', description: 'Solve coordinate geometry puzzles', icon: '📐' },
    { id: 'calculus_champion', title: 'Calculus Champion', description: 'Master derivatives and integrals', icon: '∫' },
  ],
};