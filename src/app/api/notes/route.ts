import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET all notes for the current user
export async function GET(request: NextRequest) {
  // Check authentication
  const authCheck = await requireAuth();
  if (authCheck) return authCheck;

  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const query = searchParams.get("query");

    // Build the where clause for filtering
    const whereClause: Prisma.NoteWhereInput = { ownerId: user.id };

    // Add tag filter if provided
    if (tag) {
      whereClause.tags = { has: tag };
    }

    // Add search filter if provided
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ];
    }

    // Get all notes for the authenticated user with the filters applied
    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes", details: String(error) },
      { status: 500 }
    );
  }
}

// POST create a new note
export async function POST(request: NextRequest) {
  // Check authentication
  const authCheck = await requireAuth();
  if (authCheck) return authCheck;

  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const data = await request.json();

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!data.content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Create the note with proper data validation
    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        color: data.color || "bg-white dark:bg-dark-secondary",
        tags: Array.isArray(data.tags) ? data.tags : [], // Ensure tags is an array
        owner: { connect: { id: user.id } },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note", details: String(error) },
      { status: 500 }
    );
  }
}
