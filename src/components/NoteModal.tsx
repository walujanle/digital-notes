"use client";

import { useState, useEffect, useRef } from "react";
import { formatDate } from "@/utils/dateUtils";
import ModalButton from "@/components/ModalButton";
import WysiwygEditor from "@/components/WysiwygEditor";
import ModalWrapper from "@/components/notes/ModalWrapper";
import TagsInput from "@/components/notes/TagsInput";
import ColorPicker from "@/components/notes/ColorPicker";
import DeleteConfirmation from "@/components/notes/DeleteConfirmation";
import { Note } from "@/services/noteService";

interface NoteModalProps {
  note: Note;
  onClose: () => void;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteModal({
  note,
  onClose,
  onUpdate,
  onDelete,
}: NoteModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editedNote, setEditedNote] = useState<Note>({ ...note });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // When note changes, update the editedNote state
  useEffect(() => {
    setEditedNote({ ...note });
  }, [note]);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditing) {
        setIsEditing(false);
        setEditedNote({ ...note });
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && isEditing) {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, editedNote, note]);

  // Handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedNote.title.trim() === "" || editedNote.content.trim() === "") {
      return; // Prevent saving empty notes
    }

    onUpdate({
      ...editedNote,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedNote({ ...note });
    setIsEditing(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setEditedNote((prev) => ({ ...prev, content }));
  };

  const handleAddTag = (tag: string) => {
    setEditedNote((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tag],
    }));
  };

  const handleRemoveTag = (tag: string) => {
    setEditedNote((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const handleColorChange = (color: string) => {
    setEditedNote((prev) => ({ ...prev, color }));
  };

  // Updated delete handler with better error handling and feedback
  const handleDelete = async () => {
    try {
      setDeleteError(null);
      console.log("Deleting note with ID:", note.id);

      if (!note.id) {
        throw new Error("Cannot delete note: Missing note ID");
      }

      await onDelete(note.id);
      console.log("Delete operation completed successfully");

      // Close the modal after successful deletion
      onClose();
      return true;
    } catch (error) {
      console.error("Error in handleDelete:", error);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete note. Please try again."
      );
      setIsDeleting(false); // Keep the modal open but reset the deleting state
      return false;
    }
  };

  const modalContent = (
    <>
      {/* Modal header */}
      <div
        className={`${
          isEditing
            ? editedNote.color || "bg-white dark:bg-dark-secondary"
            : note.color || "bg-white dark:bg-dark-secondary"
        } relative`}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 dark:via-indigo-400/50 to-transparent"></div>

        <div className="p-6 md:p-8 flex justify-between items-start">
          <div className="flex-grow pr-4">
            {isEditing ? (
              <input
                ref={titleInputRef}
                name="title"
                value={editedNote.title}
                onChange={handleChange}
                className="w-full text-2xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 pb-2 mb-2 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-gray-900 dark:text-white"
                placeholder="Note Title"
              />
            ) : (
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words mb-2">
                {note.title}
              </h2>
            )}

            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <svg
                  className="w-3.5 h-3.5 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Created: {formatDate(note.createdAt)}
              </span>
              {note.updatedAt !== note.createdAt && (
                <span className="flex items-center">
                  <svg
                    className="w-3.5 h-3.5 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Updated: {formatDate(note.updatedAt, "relative")}
                </span>
              )}
            </div>
          </div>

          {/* Color picker button & close button */}
          <div className="flex items-center space-x-2">
            {isEditing && (
              <ColorPicker
                selectedColor={
                  editedNote.color || "bg-white dark:bg-dark-secondary"
                }
                onColorChange={handleColorChange}
                popover={true}
              />
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title="Close"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modal body - Optimized content display */}
      <div
        className="px-6 md:px-8 pt-6 md:pt-6 pb-4 md:pb-6 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 14rem)" }}
      >
        {/* Note content - Improved rendering */}
        {isEditing ? (
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Note Content
            </label>
            <WysiwygEditor
              initialValue={editedNote.content}
              onChange={handleContentChange}
              minHeight="12rem"
              className="mt-1"
            />
          </div>
        ) : (
          <div className="mb-8 rounded-lg overflow-hidden">
            <div className="bg-white dark:bg-dark-secondary/60 shadow-sm rounded-lg overflow-hidden">
              {/* Enhanced content display with better CSS */}
              <div
                className="wysiwyg-content prose dark:prose-invert max-w-none p-5 text-gray-800 dark:text-gray-200"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
          </div>
        )}

        {/* Tags section */}
        <div className="mt-6 mb-2">
          <TagsInput
            tags={editedNote.tags || []}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            readonly={!isEditing}
          />
        </div>
      </div>

      {/* Modal footer */}
      <div className="px-6 md:px-8 py-4 md:py-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
        {isEditing ? (
          <>
            <ModalButton
              variant="secondary"
              onClick={handleCancel}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              }
              className="px-5 py-2.5"
            >
              Cancel
            </ModalButton>

            <ModalButton
              variant="primary"
              onClick={handleSave}
              disabled={!editedNote.title.trim() || !editedNote.content.trim()}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
              className="px-5 py-2.5"
            >
              Save
            </ModalButton>
          </>
        ) : (
          <>
            <ModalButton
              variant="primary"
              onClick={handleEdit}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
              className="px-5 py-2.5"
            >
              Edit
            </ModalButton>

            <ModalButton
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this note? This action cannot be undone."
                  )
                ) {
                  handleDelete();
                }
              }}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              }
              className="px-5 py-2.5"
            >
              Delete
            </ModalButton>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <ModalWrapper onClose={onClose}>{modalContent}</ModalWrapper>

      {isDeleting && (
        <DeleteConfirmation
          onDelete={handleDelete}
          onCancel={() => setIsDeleting(false)}
          error={deleteError}
        />
      )}
    </>
  );
}
