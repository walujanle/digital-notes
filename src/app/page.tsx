"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { authService } from "@/services/authService";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authStatus = await authService.isAuthenticated();
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error("Error checking authentication status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section with full-width appearance */}
        <section className="relative py-16 md:py-24 backdrop-blur-sm bg-white/30 dark:bg-dark-secondary/30 transition-colors duration-300">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/20 to-white dark:from-dark-primary dark:via-indigo-900/10 dark:to-dark-primary z-0"></div>

          {/* SVG illustrations */}
          <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5">
            <svg
              className="absolute right-0 top-20 w-1/4 md:w-1/3 h-auto text-indigo-500 dark:text-indigo-400"
              viewBox="0 0 200 200"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M160 0H40C26.7 0 16 10.7 16 24V176C16 189.3 26.7 200 40 200H160C173.3 200 184 189.3 184 176V24C184 10.7 173.3 0 160 0ZM40 16H160C164.4 16 168 19.6 168 24V176C168 180.4 164.4 184 160 184H40C35.6 184 32 180.4 32 176V24C32 19.6 35.6 16 40 16ZM60 48H140C144.4 48 148 44.4 148 40C148 35.6 144.4 32 140 32H60C55.6 32 52 35.6 52 40C52 44.4 55.6 48 60 48ZM60 80H140C144.4 80 148 76.4 148 72C148 67.6 144.4 64 140 64H60C55.6 64 52 67.6 52 72C52 76.4 55.6 80 60 80ZM60 112H140C144.4 112 148 108.4 148 104C148 99.6 144.4 96 140 96H60C55.6 96 52 99.6 52 104C52 108.4 55.6 112 60 112ZM100 144H140C144.4 144 148 140.4 148 136C148 131.6 144.4 128 140 128H100C95.6 128 92 131.6 92 136C92 140.4 95.6 144 100 144Z" />
            </svg>

            <svg
              className="absolute left-5 bottom-10 w-1/5 md:w-1/4 h-auto text-indigo-400 dark:text-indigo-300"
              viewBox="0 0 200 200"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M194.3 5.7C190.4 1.8 185.1 0 179.3 0C173.5 0 168.2 1.8 164.3 5.7L36.8 133.2L32.9 164.3C32.5 167.3 33.6 170.2 35.9 172.4C38.1 174.7 41.1 175.7 44.1 175.3L76.4 171.3L194.3 53.4C198.2 49.5 200 44.2 200 38.4C200 32.6 198.2 27.3 194.3 23.4L194.3 5.7ZM70.1 157L47.4 160.1L50.6 137.4L145 43L175 73L70.1 157ZM185.7 44.8L179 51.5L149 21.5L155.7 14.8C157.6 12.9 160.1 11.9 162.9 11.9C165.7 11.9 168.2 12.9 170.1 14.8L185.7 30.4C187.6 32.3 188.6 34.9 188.6 37.6C188.6 40.3 187.6 42.9 185.7 44.8Z" />
            </svg>

            <svg
              className="absolute left-1/3 top-1/4 w-1/6 md:w-1/5 h-auto text-indigo-300 dark:text-indigo-200"
              viewBox="0 0 200 200"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M180 0H20C9 0 0 9 0 20V180C0 191 9 200 20 200H180C191 200 200 191 200 180V20C200 9 191 0 180 0ZM20 180V20H90V180H20ZM180 180H110V20H180V180ZM160 40H130C125.6 40 122 43.6 122 48C122 52.4 125.6 56 130 56H160C164.4 56 168 52.4 168 48C168 43.6 164.4 40 160 40ZM160 80H130C125.6 80 122 83.6 122 88C122 92.4 125.6 96 130 96H160C164.4 96 168 92.4 168 88C168 83.6 164.4 80 160 80ZM160 120H130C125.6 120 122 123.6 122 128C122 132.4 125.6 136 130 136H160C164.4 136 168 132.4 168 128C168 123.6 164.4 120 160 120Z" />
            </svg>

            <svg
              className="absolute right-1/4 bottom-1/4 w-1/7 md:w-1/6 h-auto text-indigo-200 dark:text-indigo-100"
              viewBox="0 0 200 200"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="10" />
              <circle cx="60" cy="20" r="10" />
              <circle cx="100" cy="20" r="10" />
              <circle cx="140" cy="20" r="10" />
              <circle cx="180" cy="20" r="10" />
              <circle cx="20" cy="60" r="10" />
              <circle cx="60" cy="60" r="10" />
              <circle cx="100" cy="60" r="10" />
              <circle cx="140" cy="60" r="10" />
              <circle cx="180" cy="60" r="10" />
              <circle cx="20" cy="100" r="10" />
              <circle cx="60" cy="100" r="10" />
              <circle cx="100" cy="100" r="10" />
              <circle cx="140" cy="100" r="10" />
              <circle cx="180" cy="100" r="10" />
              <circle cx="20" cy="140" r="10" />
              <circle cx="60" cy="140" r="10" />
              <circle cx="100" cy="140" r="10" />
              <circle cx="140" cy="140" r="10" />
              <circle cx="180" cy="140" r="10" />
              <circle cx="20" cy="180" r="10" />
              <circle cx="60" cy="180" r="10" />
              <circle cx="100" cy="180" r="10" />
              <circle cx="140" cy="180" r="10" />
              <circle cx="180" cy="180" r="10" />
            </svg>
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-10 left-5 w-48 h-48 md:w-64 md:h-64 rounded-full bg-indigo-200/20 dark:bg-indigo-600/10 blur-3xl"></div>
          <div className="absolute bottom-5 right-5 w-56 h-56 md:w-72 md:h-72 rounded-full bg-indigo-300/20 dark:bg-indigo-500/10 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/5 w-36 h-36 md:w-48 md:h-48 rounded-full bg-purple-200/20 dark:bg-purple-700/10 blur-3xl"></div>

          {/* Content - Now displayed full width with center-aligned text */}
          <div className="relative w-full z-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
                A simple way to{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  capture
                </span>{" "}
                <br className="hidden md:block" />
                and{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  organize
                </span>{" "}
                your thoughts
              </h1>
              <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-300 mb-10 max-w-2xl mx-auto transition-colors duration-200">
                Your ideas deserve a beautiful, secure place. Try our digital
                note-taking app today.
              </p>
              <div className="flex flex-wrap justify-center gap-5">
                {isLoading ? (
                  // Show loading state while checking authentication
                  <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
                ) : isAuthenticated ? (
                  // Show "View Your Notes" button for authenticated users
                  <Button
                    href="/notes"
                    variant="primary"
                    className="text-base px-8 py-3 shadow-md hover:shadow-lg transition-all"
                  >
                    View Your Notes
                  </Button>
                ) : (
                  // Show "Get Started" button for unauthenticated users
                  <Button
                    href="/register"
                    variant="primary"
                    className="text-base px-8 py-3 shadow-md hover:shadow-lg transition-all"
                  >
                    Get Started - It&apos;s Free
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
