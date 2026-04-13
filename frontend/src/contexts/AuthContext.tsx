import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';
import { useKiosk } from './KioskContext';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  walletBalance: number;
  is_active: boolean;
  avatar?: string; // add avatar field
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<any>;
  register: (username: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  updateWalletBalance: (amount: number) => void;
  updateUser: (updatedUser: Partial<User>) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { setKioskMode } = useKiosk();

  // Helper to update user in both state and storage
  const updateUserInStorage = (updatedUser: User) => {
    if (localStorage.getItem('tamcc_user')) {
      localStorage.setItem('tamcc_user', JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem('tamcc_user')) {
      sessionStorage.setItem('tamcc_user', JSON.stringify(updatedUser));
    }
  };

  // On initial load, restore user from storage
  useEffect(() => {
    const token = localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token');
    let storedUser = localStorage.getItem('tamcc_user');
    if (!storedUser) {
      storedUser = sessionStorage.getItem('tamcc_user');
    }
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setKioskMode(parsedUser.role === 'kiosk');
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('tamcc_user');
        sessionStorage.removeItem('tamcc_user');
      }
    } else {
      setKioskMode(false);
    }
  }, [setKioskMode]);

  const login = async (email: string, password: string, remember: boolean) => {
    const data = await authService.login(email, password, remember);
    const { user, token } = data;
    if (remember) {
      localStorage.setItem('tamcc_token', token);
      localStorage.setItem('tamcc_user', JSON.stringify(user));
      sessionStorage.removeItem('tamcc_token');
      sessionStorage.removeItem('tamcc_user');
    } else {
      sessionStorage.setItem('tamcc_token', token);
      sessionStorage.setItem('tamcc_user', JSON.stringify(user));
      localStorage.removeItem('tamcc_token');
      localStorage.removeItem('tamcc_user');
    }
    setUser(user);
    setKioskMode(user.role === 'kiosk');
    return data;
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await authService.register(username, email, password);
    const { user, token } = data;
    sessionStorage.setItem('tamcc_token', token);
    sessionStorage.setItem('tamcc_user', JSON.stringify(user));
    localStorage.removeItem('tamcc_token');
    localStorage.removeItem('tamcc_user');
    setUser(user);
    setKioskMode(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('tamcc_token');
    localStorage.removeItem('tamcc_user');
    sessionStorage.removeItem('tamcc_token');
    sessionStorage.removeItem('tamcc_user');
    setUser(null);
    setKioskMode(false);
  };

  const updateWalletBalance = (amount: number) => {
    if (user) {
      const newBalance = user.walletBalance + amount;
      const updatedUser = { ...user, walletBalance: newBalance };
      setUser(updatedUser);
      updateUserInStorage(updatedUser);
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      updateUserInStorage(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateWalletBalance, updateUser, setUser }}>
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