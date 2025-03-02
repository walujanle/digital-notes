"use client";

import { useState } from "react";

interface TagsInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  readonly?: boolean;
}

export default function TagsInput({
  tags,
  onAddTag,
  onRemoveTag,
  readonly = false,
}: TagsInputProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onAddTag(tagInput.trim());
      setTagInput("");
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-elevated/50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags
        </h3>
        {!readonly && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Add tags to organize your notes
          </span>
        )}
      </div>

      {/* Tag list */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags && tags.length > 0 ? (
          tags.map((tag) => (
            <div
              key={tag}
              className={`px-3 py-1.5 rounded-full text-xs flex items-center ${
                !readonly
                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {tag}
              {!readonly && (
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="ml-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none"
                  aria-label={`Remove ${tag} tag`}
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
            {readonly ? "No tags" : "Add tags below"}
          </span>
        )}
      </div>

      {/* Add tag input (only when not readonly) */}
      {!readonly && (
        <div className="flex mt-4">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
            placeholder="Add a tag"
            className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-dark-elevated text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 text-sm"
          />
          <button
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="rounded-r-md bg-indigo-500 text-white px-4 py-2 text-sm hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
