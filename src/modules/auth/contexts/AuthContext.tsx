import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, loginUser, getUserProfile } from '../services/authService';
import { setAuthToken as setProjectAuthToken } from '../services/projectService';
import { setAuthToken as setAuthAuthToken } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      // Set the auth token for API calls
      setProjectAuthToken(storedToken);
      setAuthAuthToken(storedToken);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await loginUser({ email, password });
      
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Set the auth token for API calls
      setProjectAuthToken(response.token);
      setAuthAuthToken(response.token);
    } catch (error) {
      throw error;
    }
  };

  // Function to refresh user profile from API
  const refreshUserProfile = async () => {
    if (token) {
      try {
        const profile = await getUserProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear the auth token for API calls
    setProjectAuthToken(null);
    setAuthAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, refreshUserProfile }}>
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