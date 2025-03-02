import { User, UserProfile } from "@/types/user";
import { Note } from "./noteService";

export interface UserData {
  user: User;
  notes: Note[];
}

export const userService = {
  /**
   * Get the current logged in user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await fetch("/api/auth/me");

    if (!response.ok) {
      throw new Error("Failed to get current user");
    }

    const data = await response.json();
    return data.user;
  },

  /**
   * Update user profile information
   */
  updateProfile: async (profile: UserProfile): Promise<User> => {
    const response = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    const data = await response.json();
    return data.user;
  },

  /**
   * Update user password
   */
  updatePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    const response = await fetch("/api/user/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update password");
    }

    return true;
  },

  /**
   * Delete user account
   */
  deleteAccount: async (password: string): Promise<boolean> => {
    const response = await fetch("/api/user/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete account");
    }

    return true;
  },

  /**
   * Export user data including all notes
   */
  exportUserData: async (): Promise<UserData> => {
    const response = await fetch("/api/user/export");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to export data");
    }

    const data = await response.json();
    return data;
  },
};
