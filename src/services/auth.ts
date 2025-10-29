import { User } from '../types';

interface StoredUser {
  id: string;
  email: string;
  displayName: string;
  password: string;
  photoURL: string;
}

let currentUser: User | null = null;
const USERS_KEY = 'nexameet_users';
const CURRENT_USER_KEY = 'nexameet_current_user';

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get users from local storage
const getUsers = (): StoredUser[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to local storage
const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Create a new account
export const createLocalAccount = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  const users = getUsers();
  
  if (users.find(u => u.email === email)) {
    throw new Error('auth/email-already-in-use');
  }
  
  const newUser: StoredUser = {
    id: generateId(),
    email,
    password,
    displayName,
    photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
  };
  
  users.push(newUser);
  saveUsers(users);
  
  const user: User = {
    uid: newUser.id,
    email: newUser.email,
    displayName: newUser.displayName,
    photoURL: newUser.photoURL
  };
  
  currentUser = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  
  return user;
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('auth/wrong-password');
  }
  
  const authUser: User = {
    uid: user.id,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
  
  currentUser = authUser;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
  
  return authUser;
};

// Sign out
export const signOut = async (): Promise<void> => {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Subscribe to auth changes
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  // Initial call with current user
  const storedUser = localStorage.getItem(CURRENT_USER_KEY);
  currentUser = storedUser ? JSON.parse(storedUser) : null;
  callback(currentUser);
  
  // Listen for storage events (for multi-tab support)
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === CURRENT_USER_KEY) {
      currentUser = event.newValue ? JSON.parse(event.newValue) : null;
      callback(currentUser);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

export const isAuthenticated = (): boolean => {
  return !!currentUser;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};