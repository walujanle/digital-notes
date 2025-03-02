import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "default";

interface ModalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
}

export default function ModalButton({
  children,
  onClick,
  variant = "default",
  icon,
  className = "",
  disabled = false,
  type = "button",
  isLoading = false,
}: ModalButtonProps) {
  // Base button styles
  const baseStyle =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

  // Variant specific styles
  const variantStyles = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-white dark:focus:ring-offset-dark-secondary",
    secondary:
      "bg-white hover:bg-gray-50 text-gray-700 dark:bg-dark-elevated dark:hover:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500 dark:focus:ring-red-400",
    success:
      "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow dark:bg-green-500 dark:hover:bg-green-600 focus:ring-green-500 dark:focus:ring-green-400",
    default:
      "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 focus:ring-gray-500 dark:focus:ring-gray-400",
  };

  const buttonStyle = `${baseStyle} ${variantStyles[variant]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonStyle}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
