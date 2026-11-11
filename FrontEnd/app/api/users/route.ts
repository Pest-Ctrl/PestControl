import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdmin, toSchemaRole } from "@/lib/roles";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.users.findMany({
      orderBy: {
        CreatedAt: "desc"
      }
    });

    const safeUsers = Array.isArray(users)
      ? users.map((u: Record<string, unknown>) => ({
          UserID: u.UserID || u.UserId || u.id,
          Username: u.Username || u.username || "",
          Email: u.Email || u.email || "",
          Role: toSchemaRole((u.Role || u.role) as string | undefined),
          CreatedAt: u.CreatedAt || u.createdAt || null,
        }))
      : [];

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, email, password, role } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.users.findUnique({ where: { Email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Username or Email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await prisma.users.create({
      data: {
        Username: String(username).trim(),
        Email: normalizedEmail,
        PassHash: hashedPassword,
        Role: toSchemaRole(role || "Developer"),
      }
    });

    if (!newUser) {
      return NextResponse.json({ error: "Failed to create user in backend" }, { status: 500 });
    }

    return NextResponse.json({ 
      UserID: newUser.UserID || newUser.UserId,
      Username: newUser.Username,
      Email: newUser.Email,
      Role: newUser.Role,
      CreatedAt: newUser.CreatedAt
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: "Username or Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
