import { User } from "@/types/user";

export interface LoginCredentials {
  identifier: string;
  password: string;
  rememberMe?: boolean; // Add rememberMe option
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

// Function to get CSRF token from cookies
const getCsrfToken = (): string | null => {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1] || null
  );
};

export const authService = {
  /**
   * Login a user
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    return data.user;
  },

  /**
   * Register a new user
   */
  register: async (userData: RegisterData): Promise<User> => {
    const csrfToken = getCsrfToken();

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    return data.user;
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    const csrfToken = getCsrfToken();

    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Logout failed");
    }
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error("Failed to get current user");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const user = await authService.getCurrentUser();
    return user !== null;
  },

  /**
   * Fetch a new CSRF token when needed
   */
  refreshCsrfToken: async (): Promise<void> => {
    await fetch("/api/auth/csrf", {
      method: "GET",
    });
  },
};
