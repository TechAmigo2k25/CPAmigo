import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole, user: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 🔥 important

  // ✅ Restore auth state on reload
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false); // done loading
  }, []);

  const login = async (email: string, password: string, role: UserRole, user: User) => {
    setIsLoading(true);

    // simulate API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ✅ set user
    setUser(user);

    // ✅ persist
    localStorage.setItem("user", JSON.stringify(user));

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // ✅ clear storage
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}