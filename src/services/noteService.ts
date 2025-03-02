// Define the Note type and export it
export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

// Define a type for creating a new note (omitting fields that are server-generated)
export type CreateNoteInput = {
  title: string;
  content: string;
  color?: string;
  tags?: string[];
};

// Error handling helper
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "An error occurred"
      );
    } catch {
      // If parsing JSON fails, use status text
      throw new Error(`API error (${response.status}): ${response.statusText}`);
    }
  }
  return response.json();
};

export const noteService = {
  /**
   * Get all notes for the current user
   */
  getAllNotes: async (): Promise<Note[]> => {
    try {
      const response = await fetch("/api/notes");

      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  },

  /**
   * Get a specific note by ID
   */
  getNoteById: async (id: string): Promise<Note | null> => {
    try {
      const response = await fetch(`/api/notes/${id}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch note: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching note ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new note
   */
  createNote: async (noteData: CreateNoteInput): Promise<Note> => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create note: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  /**
   * Update an existing note
   */
  updateNote: async (
    id: string,
    noteData: Partial<CreateNoteInput>
  ): Promise<Note> => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating note ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a note by ID
   * @param id The ID of the note to delete
   * @returns Promise resolving to true if deletion was successful
   * @throws Error if deletion fails
   */
  deleteNote: async (id: string): Promise<boolean> => {
    try {
      console.log(`Attempting to delete note with ID: ${id}`);

      // Ensure the ID is properly formatted (no leading/trailing spaces)
      const cleanId = id.trim();

      const response = await fetch(`/api/notes/${cleanId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Log response status for debugging
      console.log(`Delete response status: ${response.status}`);

      // Handle 404 separately - note not found is not necessarily an error
      if (response.status === 404) {
        console.log("Note not found or already deleted");
        throw new Error("Note not found or has already been deleted");
      }

      // For other error status codes, throw an error
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error || `Failed to delete note (${response.status})`;
        } catch {
          errorMessage = `Failed to delete note (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      console.log("Delete API call successful");
      return true;
    } catch (error) {
      console.error("Error in deleteNote service:", error);
      throw error;
    }
  },

  /**
   * Search notes by query
   */
  searchNotes: async (query: string): Promise<Note[]> => {
    try {
      const searchParams = new URLSearchParams();

      if (query) {
        searchParams.append("query", query);
      }

      const response = await fetch(`/api/notes?${searchParams.toString()}`, {
        credentials: "include",
      });

      return handleApiError(response);
    } catch (error) {
      console.error("Error in searchNotes:", error);
      throw error;
    }
  },

  /**
   * Filter notes by tag
   */
  getNotesByTag: async (tag: string): Promise<Note[]> => {
    try {
      const searchParams = new URLSearchParams();

      if (tag) {
        searchParams.append("tag", tag);
      }

      const response = await fetch(`/api/notes?${searchParams.toString()}`, {
        credentials: "include",
      });

      return handleApiError(response);
    } catch (error) {
      console.error("Error in getNotesByTag:", error);
      throw error;
    }
  },
};
