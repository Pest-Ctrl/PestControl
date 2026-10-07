import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/spaces — returns all spaces (or spaces owned by the current user)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const spaces = await prisma.space.findMany({});
  return NextResponse.json(spaces);
}

// POST /api/spaces — creates a new workspace
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
  }

  const user = await prisma.users.findUnique({ where: { Email: session.user.email! } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const space = await prisma.space.create({
    data: {
      SpaceName: name.trim(),
      OwnerId: user.UserID,
    }
  });

  return NextResponse.json(space, { status: 201 });
}
