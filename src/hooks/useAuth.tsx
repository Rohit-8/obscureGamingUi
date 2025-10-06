import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Real login via API
    try {
      const resp = await apiService.login({ usernameOrEmail: username, password });
      if (resp?.accessToken && resp.user) {
        localStorage.setItem('accessToken', resp.accessToken);
        localStorage.setItem('user', JSON.stringify(resp.user));
        setUser(resp.user as User);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err) {
      // rethrow so callers can show errors
      throw err;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    // Real registration via API
    try {
      const resp = await apiService.register({ username, email, password });
      if (resp?.accessToken && resp.user) {
        localStorage.setItem('accessToken', resp.accessToken);
        localStorage.setItem('user', JSON.stringify(resp.user));
        setUser(resp.user as User);
      } else {
        throw new Error('Invalid register response');
      }
    } catch (err) {
      // bubble up to UI
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
