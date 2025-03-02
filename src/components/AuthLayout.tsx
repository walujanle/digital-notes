"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "./Footer";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full px-4 py-3 bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-800 dark:text-white transition-colors">
              Digital Notes
            </span>
          </Link>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-6xl flex rounded-2xl shadow-xl overflow-hidden">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 p-8 md:p-12 bg-white dark:bg-dark-secondary">
            <div className="max-w-md mx-auto">
              <Link
                href="/"
                className="inline-flex items-center mb-6 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to home
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {subtitle}
              </p>

              {children}
            </div>
          </div>

          {/* Right side - Decorative */}
          <div className="hidden md:block md:w-1/2 relative bg-indigo-600">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-700 dark:to-purple-900"></div>

            {/* Decorative patterns - reducing opacity to prevent overlay issues */}
            <div className="absolute inset-0 opacity-10">
              <svg
                className="absolute bottom-0 left-0 w-full"
                viewBox="0 0 1440 320"
                fill="currentColor"
              >
                <path d="M0,224L48,213.3C96,203,192,181,288,149.3C384,117,480,75,576,69.3C672,64,768,96,864,96C960,96,1056,64,1152,69.3C1248,75,1344,117,1392,138.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>

            {/* Content card - moved outside the pattern div for better visibility */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-white text-center z-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">
                Digital Notes
              </h2>
              <p className="text-lg font-medium text-white drop-shadow-md">
                Capture your thoughts, organize your life. Access your notes
                from any device, anytime.
              </p>
            </div>

            {/* Floating shapes - moved to a higher z-index */}
            <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm z-0"></div>
            <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-purple-500/20 backdrop-blur-sm z-0"></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
