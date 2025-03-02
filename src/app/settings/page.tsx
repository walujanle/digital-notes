"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import DataSettings from "@/components/settings/DataSettings";
import DangerZone from "@/components/settings/DangerZone";
import { User } from "@/types/user";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { Alert } from "@/components/Alert";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Check if user is authenticated
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          // Redirect to login if not authenticated
          router.push("/login?redirect=/settings");
          return;
        }

        const userData = await userService.getCurrentUser();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load your account information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Handle section navigation
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Handle profile update
  const handleProfileUpdate = async (name: string, email: string) => {
    try {
      const updatedUser = await userService.updateProfile({ name, email });
      setUser(updatedUser);
      Alert.success("Profile updated successfully!");
      return true;
    } catch (err: Error | unknown) {
      console.error("Failed to update profile:", err);
      Alert.error(
        err instanceof Error
          ? err.message
          : "Failed to update profile. Please try again."
      );
      return false;
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      await userService.updatePassword(currentPassword, newPassword);
      Alert.success("Password updated successfully!");
      return true;
    } catch (err: Error | unknown) {
      console.error("Failed to update password:", err);
      Alert.error(
        err instanceof Error
          ? err.message
          : "Failed to update password. Please verify your current password and try again."
      );
      return false;
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (password: string) => {
    try {
      await userService.deleteAccount(password);
      Alert.success("Account deleted successfully. Redirecting to homepage...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return true;
    } catch (err: Error | unknown) {
      console.error("Failed to delete account:", err);
      Alert.error(
        err instanceof Error
          ? err.message
          : "Failed to delete account. Please verify your password and try again."
      );
      return false;
    }
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      const data = await userService.exportUserData();

      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `digital-notes-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      Alert.success("Data exported successfully!");
      return true;
    } catch (err: Error | unknown) {
      console.error("Failed to export data:", err);
      Alert.error(
        err instanceof Error
          ? err.message
          : "Failed to export data. Please try again."
      );
      return false;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-primary transition-colors duration-200">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Loading your account settings...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-primary transition-colors duration-200">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full inline-flex mb-4">
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-red-600 dark:text-red-400 mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No user found case
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-primary transition-colors duration-200">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-full inline-flex mb-4">
              <svg
                className="h-10 w-10 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please log in to access your account settings.
            </p>
            <button
              onClick={() => router.push("/login?redirect=/settings")}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Go to Login
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-primary transition-colors duration-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account preferences and personal information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SettingsSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              user={user}
            />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Render appropriate section based on active tab */}
            {activeSection === "profile" && (
              <ProfileSettings user={user} onSave={handleProfileUpdate} />
            )}

            {activeSection === "security" && (
              <SecuritySettings onSave={handlePasswordUpdate} />
            )}

            {activeSection === "data" && (
              <DataSettings onExport={handleExportData} />
            )}

            {activeSection === "danger" && (
              <DangerZone onDelete={handleDeleteAccount} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
