"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NoteCard from "@/components/NoteCard";
import NoteModal from "@/components/NoteModal";
import CreateNoteModal from "@/components/CreateNoteModal";
import { noteService, Note, CreateNoteInput } from "@/services/noteService";
import { Alert } from "@/components/Alert";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">(
    "updatedAt"
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes on initial render with improved error handling
  useEffect(() => {
    let isMounted = true;

    const fetchNotes = async () => {
      try {
        if (isMounted) setIsLoading(true);
        const fetchedNotes = await noteService.getAllNotes();

        if (isMounted) {
          setNotes(fetchedNotes || []); // Ensure we always have an array
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        if (isMounted) {
          setError("Failed to load notes. Please try again later.");
          setNotes([]); // Reset notes to empty array on error
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchNotes();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  // Get all unique tags from notes with safeguard
  const allTags = Array.from(
    new Set(notes?.flatMap((note) => note.tags || []) || [])
  ).filter(Boolean);

  // Filter and sort notes with safeguards
  const filteredNotes = (notes || [])
    .filter((note) => {
      if (!note) return false;

      const matchesSearch =
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTag =
        selectedTag === null || note.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "createdAt") {
        return (
          new Date(b.createdAt || Date.now()).getTime() -
          new Date(a.createdAt || Date.now()).getTime()
        );
      } else {
        // default: updatedAt
        return (
          new Date(b.updatedAt || Date.now()).getTime() -
          new Date(a.updatedAt || Date.now()).getTime()
        );
      }
    });

  // Handlers
  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
  };

  const handleCloseModal = () => {
    setSelectedNote(null);
  };

  const handleCreateNote = async (newNote: CreateNoteInput) => {
    try {
      const createdNote = await noteService.createNote(newNote);
      setNotes((prevNotes) => [...prevNotes, createdNote]);
      setIsCreateModalOpen(false);
      Alert.success("Note created successfully!", 4000);
    } catch (err) {
      console.error("Failed to create note:", err);
      Alert.error("Failed to create note. Please try again.", 5000);
    }
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      // Extract only the fields that can be updated
      const { title, content, color, tags } = updatedNote;
      const updateData = { title, content, color, tags };

      const result = await noteService.updateNote(updatedNote.id, updateData);
      if (result) {
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === updatedNote.id ? result : note))
        );
        setSelectedNote(null);
        Alert.success("Note updated successfully!", 4000);
      }
    } catch (err) {
      console.error("Failed to update note:", err);
      Alert.error("Failed to update note. Please try again.", 5000);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const success = await noteService.deleteNote(id);
      if (success) {
        setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
        setSelectedNote(null);
        Alert.success("Note deleted successfully!", 4000);
      } else {
        Alert.error("Note not found!", 5000);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
      Alert.error("Failed to delete note. Please try again.", 5000);
    }
  };

  // Loading state with better UI feedback
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-primary transition-colors duration-200">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 flex items-center justify-center">
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-indigo-500 mx-auto mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              data-testid="loading-spinner"
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
            <p className="text-gray-600 dark:text-gray-300">Loading notes...</p>
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
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 flex items-center justify-center">
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-primary transition-colors duration-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              My Notes
            </h1>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-primary"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Note
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-dark-elevated border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-4 block w-full focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors duration-200"
              />
            </div>

            {/* Filter and sort controls */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "updatedAt" | "createdAt" | "title"
                    )
                  }
                  className="appearance-none bg-white dark:bg-dark-elevated border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors duration-200"
                >
                  <option value="updatedAt">Recently Updated</option>
                  <option value="createdAt">Recently Created</option>
                  <option value="title">Alphabetical</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedTag || ""}
                  onChange={(e) => setSelectedTag(e.target.value || null)}
                  className="appearance-none bg-white dark:bg-dark-elevated border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors duration-200"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes grid - responsive: 1 column on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredNotes && filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleNoteClick(note)}
              />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16">
              <div className="bg-gray-100 dark:bg-dark-secondary rounded-full p-4 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-1">
                {searchTerm || selectedTag
                  ? "No matching notes found"
                  : "No notes yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
                {searchTerm || selectedTag
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first note to get started"}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-primary"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Note
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* View/Edit Note Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={handleCloseModal}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
        />
      )}

      {/* Create Note Modal */}
      {isCreateModalOpen && (
        <CreateNoteModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateNote}
        />
      )}
    </div>
  );
}
