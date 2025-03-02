"use client";

import { useState } from "react";

// Available colors for note customization
export const colorOptions = [
  { value: "bg-white dark:bg-dark-secondary", label: "Default" },
  { value: "bg-yellow-100 dark:bg-yellow-900/30", label: "Yellow" },
  { value: "bg-green-100 dark:bg-green-900/30", label: "Green" },
  { value: "bg-blue-100 dark:bg-blue-900/30", label: "Blue" },
  { value: "bg-purple-100 dark:bg-purple-900/30", label: "Purple" },
  { value: "bg-red-100 dark:bg-red-900/30", label: "Red" },
  { value: "bg-indigo-100 dark:bg-indigo-900/30", label: "Indigo" },
  { value: "bg-pink-100 dark:bg-pink-900/30", label: "Pink" },
  { value: "bg-teal-100 dark:bg-teal-900/30", label: "Teal" },
  { value: "bg-orange-100 dark:bg-orange-900/30", label: "Orange" },
];

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  popover?: boolean;
}

export default function ColorPicker({
  selectedColor,
  onColorChange,
  popover = false,
}: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (color: string) => {
    onColorChange(color);
    if (popover) setShowPicker(false);
  };

  const togglePicker = () => {
    if (popover) setShowPicker(!showPicker);
  };

  // Render as popover button + panel
  if (popover) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={togglePicker}
          className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title="Change note color"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        </button>

        {showPicker && (
          <div className="absolute right-0 top-12 bg-white dark:bg-dark-elevated border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-xl z-10 animate-fadeIn">
            <div className="grid grid-cols-5 gap-3">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleColorChange(option.value)}
                  className={`w-9 h-9 rounded-full ${option.value} border-2 ${
                    selectedColor === option.value
                      ? "border-indigo-500 dark:border-indigo-400 ring-2 ring-offset-2 ring-indigo-500/50"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  title={option.label}
                  aria-label={`Set note color to ${option.label}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render as grid
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
      {colorOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleColorChange(option.value)}
          className={`w-9 h-9 rounded-full ${option.value} border-2 ${
            selectedColor === option.value
              ? "border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-600/50 dark:ring-indigo-400/50"
              : "border-gray-300 dark:border-gray-600"
          }`}
          title={option.label}
          aria-label={`Set note color to ${option.label}`}
        />
      ))}
    </div>
  );
}
