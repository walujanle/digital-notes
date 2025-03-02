// Common type definitions for notes

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  ownerId?: string;
}
