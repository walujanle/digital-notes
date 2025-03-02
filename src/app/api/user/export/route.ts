import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Verify authentication
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get user data (excluding password)
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all notes for the user
    const notes = await prisma.note.findMany({
      where: { ownerId: authUser.id },
      orderBy: { createdAt: "desc" },
    });

    // Format the data for export
    const exportData = {
      user,
      notes: notes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        tags: note.tags,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(exportData, { status: 200 });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export user data" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
