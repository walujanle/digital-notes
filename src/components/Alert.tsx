"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

// Alert types for different visual styles
export type AlertType = "success" | "error" | "info" | "warning";

// Props for each alert item
interface AlertItem {
  id: string;
  message: string;
  type: AlertType;
  duration?: number;
}

// Context interface for our alert system
interface AlertContextType {
  alerts: AlertItem[];
  showAlert: (message: string, type: AlertType, duration?: number) => void;
  hideAlert: (id: string) => void;
}

// Create the context with default values
const AlertContext = createContext<AlertContextType>({
  alerts: [],
  showAlert: () => {},
  hideAlert: () => {},
});

// Custom hook to use the alert context within components
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

// Standalone function to show alerts outside of React components
const alertQueue: Array<{
  message: string;
  type: AlertType;
  duration?: number;
}> = [];
let eventTarget: EventTarget | null = null;

if (typeof window !== "undefined") {
  eventTarget = window;
}

export const Alert = {
  success: (message: string, duration = 5000) => {
    if (eventTarget) {
      window.dispatchEvent(
        new CustomEvent("show-alert", {
          detail: { message, type: "success", duration },
        })
      );
    } else {
      alertQueue.push({ message, type: "success", duration });
    }
  },
  error: (message: string, duration = 5000) => {
    if (eventTarget) {
      window.dispatchEvent(
        new CustomEvent("show-alert", {
          detail: { message, type: "error", duration },
        })
      );
    } else {
      alertQueue.push({ message, type: "error", duration });
    }
  },
  info: (message: string, duration = 5000) => {
    if (eventTarget) {
      window.dispatchEvent(
        new CustomEvent("show-alert", {
          detail: { message, type: "info", duration },
        })
      );
    } else {
      alertQueue.push({ message, type: "info", duration });
    }
  },
  warning: (message: string, duration = 5000) => {
    if (eventTarget) {
      window.dispatchEvent(
        new CustomEvent("show-alert", {
          detail: { message, type: "warning", duration },
        })
      );
    } else {
      alertQueue.push({ message, type: "warning", duration });
    }
  },
};

// Provider component to manage alerts state
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Process any queued alerts when component mounts
  useEffect(() => {
    if (alertQueue.length > 0) {
      alertQueue.forEach(({ message, type, duration = 5000 }) => {
        const id =
          Date.now().toString() + Math.random().toString(36).substr(2, 9);
        setAlerts((prev) => [...prev, { id, message, type, duration }]);
      });
      alertQueue.length = 0; // Clear queue
    }

    // Listen for global events
    const handleShowAlert = (e: Event) => {
      const customEvent = e as CustomEvent<{
        message: string;
        type: AlertType;
        duration?: number;
      }>;
      const { message, type, duration = 5000 } = customEvent.detail;
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setAlerts((prev) => [...prev, { id, message, type, duration }]);
    };

    window.addEventListener("show-alert", handleShowAlert);
    return () => window.removeEventListener("show-alert", handleShowAlert);
  }, []);

  // Remove an alert
  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  // Add a new alert
  const showAlert = useCallback(
    (message: string, type: AlertType, duration = 5000) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      setAlerts((prev) => [...prev, { id, message, type, duration }]);

      // Auto remove alert after duration
      if (duration > 0) {
        setTimeout(() => hideAlert(id), duration);
      }
    },
    [hideAlert]
  );

  return (
    <AlertContext.Provider value={{ alerts, showAlert, hideAlert }}>
      {children}
      <AlertContainer alerts={alerts} hideAlert={hideAlert} />
    </AlertContext.Provider>
  );
};

// Container component to render all active alerts
const AlertContainer: React.FC<{
  alerts: AlertItem[];
  hideAlert: (id: string) => void;
}> = ({ alerts, hideAlert }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-3">
      <AnimatePresence initial={false}>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            layout
          >
            <AlertMessage alert={alert} onClose={() => hideAlert(alert.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual alert message component
const AlertMessage: React.FC<{ alert: AlertItem; onClose: () => void }> = ({
  alert,
  onClose,
}) => {
  const { message, type, duration = 5000 } = alert;
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const pausedTimeRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(duration);

  // Set up the progress bar animation
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.animationDuration = `${duration}ms`;
    }
  }, [duration]);

  // Handle timer pausing and resuming on hover
  useEffect(() => {
    const timerElapsed = () => {
      if (!isPaused) {
        const elapsedTime = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, duration - elapsedTime);

        if (remainingTimeRef.current <= 0) {
          onClose();
        }
      }
    };

    // Set up interval to check timer
    const interval = setInterval(timerElapsed, 100);

    return () => clearInterval(interval);
  }, [duration, isPaused, onClose]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();

    // Pause the animation
    if (progressRef.current) {
      const computedStyle = window.getComputedStyle(progressRef.current);
      const width = computedStyle.getPropertyValue("width");
      progressRef.current.style.animationPlayState = "paused";
      progressRef.current.style.width = width;
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);

    if (pausedTimeRef.current !== null) {
      const pauseDuration = Date.now() - pausedTimeRef.current;
      startTimeRef.current += pauseDuration;
      pausedTimeRef.current = null;
    }

    // Resume the animation with the remaining time
    if (progressRef.current) {
      progressRef.current.style.animationPlayState = "running";
    }
  };

  const getAlertStyles = () => {
    const baseStyles =
      "rounded-lg shadow-lg flex items-center p-4 pr-2 min-w-[300px] max-w-sm border-l-4 relative overflow-hidden";

    switch (type) {
      case "success":
        return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400`;
      case "error":
        return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400`;
      case "info":
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400`;
      case "warning":
        return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-400`;
      default:
        return baseStyles;
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500 dark:bg-green-400";
      case "error":
        return "bg-red-500 dark:bg-red-400";
      case "info":
        return "bg-blue-500 dark:bg-blue-400";
      case "warning":
        return "bg-yellow-500 dark:bg-yellow-400";
      default:
        return "bg-gray-500 dark:bg-gray-400";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-500 dark:text-green-400";
      case "error":
        return "text-red-500 dark:text-red-400";
      case "info":
        return "text-blue-500 dark:text-blue-400";
      case "warning":
        return "text-yellow-500 dark:text-yellow-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "info":
        return "text-blue-800 dark:text-blue-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      default:
        return "text-gray-800 dark:text-gray-200";
    }
  };

  // Get the appropriate icon for the alert type
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={getAlertStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`flex-shrink-0 mr-3 ${getIconColor()}`}>{getIcon()}</div>
      <div className={`mr-3 flex-grow ${getTextColor()}`}>{message}</div>
      <button
        onClick={onClose}
        className="ml-auto rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-500 dark:text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Progress bar to show remaining time */}
      <div
        ref={progressRef}
        className={`absolute bottom-0 left-0 h-1 ${getProgressBarColor()} animate-progress-shrink`}
        style={{
          width: "100%",
          animationDuration: `${duration}ms`,
          animationTimingFunction: "linear",
          animationFillMode: "forwards",
        }}
      ></div>
    </div>
  );
};
