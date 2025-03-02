"use client";

import { useState } from "react";
import ModalButton from "@/components/ModalButton";

interface DeleteConfirmationProps {
  onDelete: () => void | Promise<void> | boolean | Promise<boolean>;
  onCancel: () => void;
  error?: string | null;
}

export default function DeleteConfirmation({
  onDelete,
  onCancel,
  error = null,
}: DeleteConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Call the delete function
      const result = await onDelete();

      // If onDelete returns false explicitly, we keep the modal open
      if (result === false) {
        setIsDeleting(false);
        return;
      }

      // Otherwise assume success and let the parent component handle closing
    } catch (error) {
      console.error("Error in DeleteConfirmation handleDelete:", error);
      setIsDeleting(false);
      // Error will be displayed through the error prop
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-dark-secondary rounded-xl shadow-xl overflow-hidden transition-all duration-300 animate-fadeIn">
        <div className="p-6 md:p-8">
          <div className="flex items-center mb-5">
            <div className="mr-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <svg
                className="w-7 h-7 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Delete Note
            </h3>
          </div>

          <p className="mb-2 text-base text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this note?
          </p>
          <p className="mb-6 text-sm text-red-600 dark:text-red-400 font-medium">
            This action cannot be undone.
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <ModalButton
              variant="secondary"
              onClick={onCancel}
              disabled={isDeleting}
              className="px-4 py-2.5"
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
              className="px-4 py-2.5"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </ModalButton>
          </div>
        </div>
      </div>
    </div>
  );
}
