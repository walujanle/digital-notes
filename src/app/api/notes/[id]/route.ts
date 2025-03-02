import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { isValidObjectId } from "@/utils/validation";

// GET a specific note by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authCheck = await requireAuth();
  if (authCheck) return authCheck;

  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Make sure the ID is valid
    if (!id) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Get the note and verify ownership
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (note.ownerId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT update a note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authCheck = await requireAuth();
  if (authCheck) return authCheck;

  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Find the note and check ownership
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (existingNote.ownerId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update the note with proper validation
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : existingNote.title,
        content:
          data.content !== undefined ? data.content : existingNote.content,
        color: data.color !== undefined ? data.color : existingNote.color,
        tags:
          data.tags !== undefined
            ? Array.isArray(data.tags)
              ? data.tags
              : existingNote.tags
            : existingNote.tags,
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authCheck = await requireAuth();
  if (authCheck) return authCheck;

  console.log(`DELETE /api/notes/${params.id} called`);

  try {
    const user = await getAuthUser();

    if (!user) {
      console.log("Unauthorized delete attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    console.log(`Attempting to delete note with ID: ${id}`);

    // Validate the MongoDB ObjectId format
    if (!isValidObjectId(id)) {
      console.log(`Invalid ObjectId format: ${id}`);
      return NextResponse.json(
        { error: "Invalid note ID format" },
        { status: 400 }
      );
    }

    // Find the note and check ownership
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      console.log(`Note not found: ${id}`);
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    console.log(
      `Found note. Owner ID: ${existingNote.ownerId}, User ID: ${user.id}`
    );

    if (existingNote.ownerId !== user.id) {
      console.log("Access denied - user doesn't own this note");
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("Deleting note from database");

    // Delete the note
    await prisma.note.delete({
      where: { id },
    });

    console.log("Note deleted successfully");

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE note endpoint:", error);
    return NextResponse.json(
      { error: "Failed to delete note", details: String(error) },
      { status: 500 }
    );
  }
}
