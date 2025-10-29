import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { 
  signOut, 
  subscribeToAuthChanges,
  createLocalAccount,
  signInWithEmail
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const user = await signInWithEmail(email, password);
      setUser(user);
    } catch (err: any) {
      if (err.message === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError('Failed to sign in');
      }
      console.error('Login error:', err);
    }
  };

  const createAccount = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      const user = await createLocalAccount(email, password, displayName);
      setUser(user);
    } catch (err: any) {
      if (err.message === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else {
        setError('Failed to create account');
      }
      console.error('Account creation error:', err);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut();
      setUser(null);
    } catch (err) {
      setError('Failed to sign out');
      console.error('Logout error:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    loginWithEmail,
    createAccount,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};