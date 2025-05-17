import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";

// User interface
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'worker' | 'recruiter';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: 'worker' | 'recruiter') => Promise<void>;
  switchRole: (role: 'worker' | 'recruiter') => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default development user
const DEFAULT_DEV_USER: User = {
  _id: "dev-user-123",
  name: "Development User",
  email: "dev@example.com",
  role: 'worker', // Default role - can be switched
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is stored in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("bluehire_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse user from localStorage");
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const setCurrentUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("bluehire_user", JSON.stringify(userData));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("bluehire_user");
      setIsAuthenticated(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem("bluehire_users") || "[]");
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser) {
        throw new Error("User not found. Please register.");
      }
      
      if (foundUser.password !== password) {
        throw new Error("Incorrect password.");
      }
      
      // Successful login
      const { password: _, ...userWithoutPassword } = foundUser;
      setCurrentUser(userWithoutPassword);
      toast.success("Login successful!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: 'worker' | 'recruiter') => {
    setIsLoading(true);
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem("bluehire_users") || "[]");
      
      // Check if email already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error("Email already registered. Please login.");
      }
      
      // Create new user
      const newUser = {
        _id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        email,
        password,
        role,
      };
      
      // Save to localStorage
      users.push(newUser);
      localStorage.setItem("bluehire_users", JSON.stringify(users));
      
      // Log in the user (without password in context)
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      toast.success("Registration successful!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to switch roles
  const switchRole = (role: 'worker' | 'recruiter') => {
    if (!user) return;
    
    // Update role in context
    const updatedUser = { ...user, role };
    setCurrentUser(updatedUser);
    
    // Also update in users array
    const users = JSON.parse(localStorage.getItem("bluehire_users") || "[]");
    const updatedUsers = users.map((u: any) => {
      if (u.email === user.email) {
        return { ...u, role };
      }
      return u;
    });
    localStorage.setItem("bluehire_users", JSON.stringify(updatedUsers));
    
    toast.success(`Switched to ${role} role`);
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
    switchRole,
    isAuthenticated
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
