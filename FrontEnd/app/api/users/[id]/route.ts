import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdmin, toSchemaRole } from "@/lib/roles";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication is required" },
        { status: 401 }
      );
    }

    // RBMS Enforcement: Only Administrators may remove users
    if (!isAdmin(session.user?.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators can remove users" },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const targetId = typeof id === "string" ? id.trim() : "";

    if (!UUID_REGEX.test(targetId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if (session.user.id === targetId) {
      return NextResponse.json(
        { error: "Administrators cannot remove their own account" },
        { status: 403 }
      );
    }

    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error: AUTH_SECRET is missing" },
        { status: 500 }
      );
    }

    // Sign an HS256 token verified by Spring Security's NimbusJwtDecoder
    const bearerToken = await new SignJWT({
      sub: session.user.id,
      email: session.user.email || "",
      role: toSchemaRole(session.user.role),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(new TextEncoder().encode(secret));

    const result = await prisma.users.delete({
      where: { UserID: targetId },
      bearerToken,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to remove user" },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User removed and GitHub OAuth credentials cleared",
      deletedUserId: targetId,
      githubCredentialsCleared: true,
      ...(result.data && typeof result.data === "object" ? result.data : {}),
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to remove user" },
      { status: 500 }
    );
  }
}

