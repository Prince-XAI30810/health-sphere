import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - adjust if your backend runs on a different port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check if the backend server is running.');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
