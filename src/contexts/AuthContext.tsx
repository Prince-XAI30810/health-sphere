import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Record<UserRole, User> = {
  patient: {
    id: 'p1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    role: 'patient',
    avatar: 'RS',
  },
  doctor: {
    id: 'd1',
    name: 'Dr. Priya Patel',
    email: 'dr.priya@mediverse.com',
    role: 'doctor',
    avatar: 'PP',
  },
  admin: {
    id: 'a1',
    name: 'Amit Kumar',
    email: 'amit.admin@mediverse.com',
    role: 'admin',
    avatar: 'AK',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUser(mockUsers[role]);
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
