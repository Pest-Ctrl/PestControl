import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    // Only Project Managers (Super Admins) can change roles
    if (!session || session.user?.role !== "Project Manager") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();
    if (!role || !["Developer", "QA Engineer", "Project Manager", "Repository Importer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role provided" }, { status: 400 });
    }

    // You cannot change your own role to prevent locking yourself out
    if (session.user.id === params.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 403 });
    }

    const updatedUser = await prisma.users.update({
      where: { UserID: params.id },
      data: { Role: role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
