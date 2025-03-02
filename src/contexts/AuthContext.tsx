"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { User } from "@/types/user";
import { Alert } from "@/components/Alert";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean,
    redirectTo?: string
  ) => Promise<void>;
  register: (
    name: string,
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        console.log("Current user from auth service:", currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login handler
  const login = async (
    identifier: string,
    password: string,
    rememberMe: boolean = false,
    redirectTo: string = "/notes"
  ) => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login({
        identifier,
        password,
        rememberMe,
      });
      console.log("Login successful, user:", loggedInUser);
      setUser(loggedInUser); // Update the user state immediately
      Alert.success("Logged in successfully!");

      // Redirect to notes page or specified redirect path
      router.push(redirectTo);
    } catch (error) {
      console.error("Login failed:", error);
      Alert.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (
    name: string,
    username: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register({
        name,
        username,
        email,
        password,
      });
      console.log("Registration successful, user:", newUser);
      setUser(newUser); // Update the user state immediately
      Alert.success("Account created successfully! Please login.");
      router.push("/notes");
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.error(
        error instanceof Error ? error.message : "Registration failed"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null); // Clear the user state immediately
      Alert.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.error("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Log whenever the auth state changes
  useEffect(() => {
    console.log("Auth state changed:", { user, isLoading });
  }, [user, isLoading]);

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
