
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@/lib/models";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("bluehire_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage");
      }
    }
    setIsLoading(false);
  }, []);

  const setCurrentUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("bluehire_user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("bluehire_user");
    }
  };

  // Mock login function
  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      // This would be an API call in a real app
      // For demo, we'll use mock data
      if (email && password) {
        const mockUser: User = {
          _id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email,
          role: role as 'worker' | 'recruiter' | 'admin',
          languages: ['English'],
          createdAt: new Date(),
        };
        
        setCurrentUser(mockUser);
        toast.success("Login successful!");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      // This would be an API call in a real app
      if (name && email && password && role) {
        const mockUser: User = {
          _id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          role: role as 'worker' | 'recruiter' | 'admin',
          languages: ['English'],
          createdAt: new Date(),
        };
        
        setCurrentUser(mockUser);
        toast.success("Registration successful!");
      } else {
        throw new Error("Please fill all required fields");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    setCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
