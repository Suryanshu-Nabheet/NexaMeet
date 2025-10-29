import { useState, useEffect } from 'react';
import { User } from '../types';
import { subscribeToAuthChanges, signOut } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    try {
      setError(null);
      await signOut();
    } catch (err) {
      setError('Failed to sign out');
      console.error(err);
    }
  };
  
  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user
  };
};