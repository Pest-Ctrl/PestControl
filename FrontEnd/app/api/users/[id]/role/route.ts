import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { toSchemaRole, isAdmin, SCHEMA_ROLES } from "@/lib/roles";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    // Only Admins (Super Admins / Project Managers) can change roles
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();
    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const schemaRole = toSchemaRole(role);
    if (!SCHEMA_ROLES.includes(schemaRole)) {
      return NextResponse.json({ error: "Invalid role provided" }, { status: 400 });
    }

    const { id } = await context.params;
    
    // You cannot change your own role to prevent locking yourself out
    if (session.user?.id === id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 403 });
    }

    const updatedUser = await prisma.users.update({
      where: { UserID: id },
      data: { Role: schemaRole },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
