"use client";

import { useState, useRef, useEffect } from "react";
import ModalButton from "@/components/ModalButton";
import WysiwygEditor from "@/components/WysiwygEditor";
import ModalWrapper from "@/components/notes/ModalWrapper";
import TagsInput from "@/components/notes/TagsInput";
import ColorPicker from "@/components/notes/ColorPicker";

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface CreateNoteModalProps {
  onClose: () => void;
  onCreate: (note: Note) => void;
}

export default function CreateNoteModal({
  onClose,
  onCreate,
}: CreateNoteModalProps) {
  const [newNote, setNewNote] = useState<Omit<Note, "id">>({
    title: "",
    content: "",
    color: "bg-white dark:bg-dark-secondary",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
  });

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input on mount
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Handle keyboard shortcuts for create button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleCreateNote();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [newNote]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setNewNote((prev) => ({ ...prev, content }));
  };

  const handleAddTag = (tag: string) => {
    setNewNote((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tag],
    }));
  };

  const handleRemoveTag = (tag: string) => {
    setNewNote((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }));
  };

  const handleColorChange = (color: string) => {
    setNewNote((prev) => ({ ...prev, color }));
  };

  const handleCreateNote = () => {
    // Validate required fields
    if (!newNote.title.trim() || !newNote.content.trim()) {
      return;
    }

    // Create new note
    onCreate(newNote as Note);
  };

  const modalContent = (
    <>
      {/* Modal header */}
      <div className={`${newNote.color} relative`}>
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 dark:via-indigo-400/50 to-transparent"></div>

        <div className="p-6 md:p-8 flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Create New Note
          </h2>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
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

      {/* Modal body */}
      <div
        className="px-6 md:px-8 pt-6 md:pt-6 pb-4 md:pb-6 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 14rem)" }}
      >
        <form className="space-y-6">
          {/* Title input */}
          <div>
            <label
              htmlFor="title"
              className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Note Title
            </label>
            <input
              ref={titleInputRef}
              id="title"
              name="title"
              type="text"
              value={newNote.title}
              onChange={handleChange}
              placeholder="Enter a title for your note"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-elevated text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 py-2.5 px-3.5"
              required
            />
          </div>

          {/* Content input - using WYSIWYG editor */}
          <div>
            <label
              htmlFor="content"
              className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Content
            </label>
            <WysiwygEditor
              initialValue=""
              onChange={handleContentChange}
              minHeight="12rem"
              className="mt-1"
              placeholder="Write your note content here..."
            />
          </div>

          {/* Tags section - now using TagsInput component */}
          <TagsInput
            tags={newNote.tags || []}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            readonly={false}
          />

          {/* Color picker - now using ColorPicker component */}
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
              Note Color
            </label>
            <ColorPicker
              selectedColor={newNote.color}
              onColorChange={handleColorChange}
              popover={false}
            />
          </div>
        </form>
      </div>

      {/* Modal footer */}
      <div className="px-6 md:px-8 py-4 md:py-6 bg-gray-50 dark:bg-dark-elevated border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4">
        <ModalButton
          variant="secondary"
          onClick={onClose}
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
          onClick={handleCreateNote}
          disabled={!newNote.title.trim() || !newNote.content.trim()}
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
          Create Note
        </ModalButton>
      </div>
    </>
  );

  return <ModalWrapper onClose={onClose}>{modalContent}</ModalWrapper>;
}
