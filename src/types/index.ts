// Types for the application
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: string;
  roles: string[];
  stats: UserStats;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  favoriteCategory?: string;
  winRate: number;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  type: 'INTERNAL' | 'EXTERNAL';
  gameUrl?: string;
  isActive: boolean;
  playCount: number;
  rating: number;
  createdAt: string;
  metadata?: GameMetadata;
}

export interface GameMetadata {
  minPlayers: number;
  maxPlayers: number;
  difficulty: string;
  estimatedPlayTime: number;
  tags: string[];
  isMultiplayer: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
  expiresAt: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface GameSession {
  id: string;
  gameId: string;
  gameName: string;
  players: Player[];
  status: 'WAITING' | 'ACTIVE' | 'FINISHED' | 'CANCELLED';
  currentPlayerTurn?: string;
  gameState: any;
  winnerId?: string;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  maxPlayers: number;
}

export interface Player {
  userId: string;
  username: string;
  avatarUrl?: string;
  score: number;
  isReady: boolean;
  joinedAt: string;
}
