import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdmin, toSchemaRole } from "@/lib/roles";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !isAdmin(session.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.users.findMany({
      select: {
        UserID: true,
        Username: true,
        Email: true,
        Role: true,
        CreatedAt: true,
      },
      orderBy: {
        CreatedAt: "desc"
      }
    });

    return NextResponse.json(users);
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

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        Username: username,
        Email: email,
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
  } catch (error: any) {
    console.error("Error creating user:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Username or Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
