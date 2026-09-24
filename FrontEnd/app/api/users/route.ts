import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "Project Manager") {
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
    if (!session || session.user?.role !== "Project Manager") {
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
        Role: role || "Developer",
      }
    });

    return NextResponse.json({ 
      UserID: newUser.UserID,
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
