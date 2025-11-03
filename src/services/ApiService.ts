import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User, Game, LeaderboardEntry } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private normalizeAuthResponse(payload: any): AuthResponse {
    if (!payload) {
      throw new Error('Empty authentication response');
    }

    const tokens = payload.tokens ?? {};
    const profile = payload.profile ?? {};
    const statistics = profile.statistics ?? {};

    const roles = Array.isArray(profile.roles)
      ? profile.roles.map((role: unknown) => String(role))
      : typeof profile.roles === 'string' && profile.roles.length > 0
        ? profile.roles.split(',').map((role: string) => role.trim()).filter(Boolean)
        : [];

    const authResponse: AuthResponse = {
      accessToken: tokens.accessToken ?? '',
      refreshToken: tokens.refreshToken ?? undefined,
      tokenType: tokens.tokenType ?? 'Bearer',
      expiresAt: tokens.expiresAt ?? '',
      user: {
        id: profile.id ?? '',
        username: profile.username ?? '',
        email: profile.email ?? '',
        firstName: profile.firstName ?? undefined,
        lastName: profile.lastName ?? undefined,
        avatarUrl: profile.avatarUrl ?? undefined,
        isOnline: profile.online ?? false,
        lastSeen: profile.lastSeen ?? '',
        roles,
        stats: {
          gamesPlayed: statistics.gamesPlayed ?? 0,
          gamesWon: statistics.gamesWon ?? 0,
          totalScore: statistics.totalScore ?? 0,
          favoriteCategory: statistics.favoriteCategory ?? undefined,
          winRate: statistics.winRate ?? 0,
        },
      },
    };

    if (!authResponse.accessToken || !authResponse.user.id) {
      throw new Error('Incomplete authentication response');
    }

    return authResponse;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse = await this.api.post('/auth/login', credentials);
    return this.normalizeAuthResponse(response.data);
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse = await this.api.post('/auth/register', userData);
    return this.normalizeAuthResponse(response.data);
  }

  async logout(userId: string): Promise<void> {
    await this.api.post('/auth/logout', null, { params: { userId } });
  }

  // Game endpoints
  async getAllGames(): Promise<Game[]> {
    const response: AxiosResponse<Game[]> = await this.api.get('/games');
    return response.data;
  }

  async getGameById(id: string): Promise<Game> {
    const response: AxiosResponse<Game> = await this.api.get(`/games/${id}`);
    return response.data;
  }

  async getGamesByCategory(category: string): Promise<Game[]> {
    const response: AxiosResponse<Game[]> = await this.api.get(`/games/category/${category}`);
    return response.data;
  }

  async searchGames(query: string): Promise<Game[]> {
    const response: AxiosResponse<Game[]> = await this.api.get('/games/search', { params: { query } });
    return response.data;
  }

  async getPopularGames(): Promise<Game[]> {
    const response: AxiosResponse<Game[]> = await this.api.get('/games/popular');
    return response.data;
  }

  async incrementPlayCount(gameId: string): Promise<void> {
    await this.api.post(`/games/${gameId}/play`);
  }

  // User endpoints
  async getOnlineUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users/online');
    return response.data;
  }

  async getUserProfile(userId: string): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get(`/users/profile/${userId}`);
    return response.data;
  }

  async getLeaderboard(timeframe?: string): Promise<LeaderboardEntry[]> {
    const params = timeframe ? { timeframe } : undefined;
    const response: AxiosResponse<LeaderboardEntry[]> = await this.api.get('/leaderboard', { params });
    return response.data;
  }

  // Health check endpoint
  async health(): Promise<boolean> {
    try {
      const response: AxiosResponse = await this.api.get('/health', { timeout: 3000 });
      return response.status === 200;
    } catch (err) {
      return false;
    }
  }
}

export const apiService = new ApiService();
