import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

// Define user interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isSubscribed: boolean;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string, newPassword: string) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database of users
const USERS_STORAGE_KEY = 'app_users';
const CURRENT_USER_KEY = 'current_user';

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or load users from localStorage
  const initializeUsers = () => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      // Create admin user if no users exist
      const adminUser = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        password: 'admin123', // In a real app, this would be hashed
        role: 'admin' as const,
        isSubscribed: false,
        resetCode: null,
      };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([adminUser]));
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    initializeUsers();
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  // Register new user
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const existingUser = storedUsers.find((u: any) => u.email === email);
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        name,
        password, // In a real app, this would be hashed
        role: 'user' as const,
        isSubscribed: false,
        resetCode: null,
      };

      // Save to localStorage
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...storedUsers, newUser]));
      
      // Log in the new user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const foundUser = storedUsers.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Set current user
      const { password: _, resetCode: __, ...userWithoutSensitiveInfo } = foundUser;
      setUser(userWithoutSensitiveInfo);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutSensitiveInfo));
      
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.email === email);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Generate reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user with reset code
      storedUsers[userIndex].resetCode = resetCode;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
      
      // In a real app, this would send an email with the reset code
      console.log(`Reset code for ${email}: ${resetCode}`);
      
      toast({
        title: "Success",
        description: "Password reset code sent to your email!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Verify reset code and set new password
  const verifyResetCode = async (email: string, code: string, newPassword: string) => {
    try {
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const userIndex = storedUsers.findIndex(
        (u: any) => u.email === email && u.resetCode === code
      );

      if (userIndex === -1) {
        throw new Error('Invalid reset code');
      }

      // Update password and clear reset code
      storedUsers[userIndex].password = newPassword;
      storedUsers[userIndex].resetCode = null;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(storedUsers));
      
      toast({
        title: "Success",
        description: "Password reset successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    resetPassword,
    verifyResetCode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
