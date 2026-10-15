import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    const updated = await prisma.space.update({
      where: { SpaceId: id },
      data: { SpaceName: name.trim() },
    });

    return NextResponse.json({ success: true, space: updated });
  } catch (error: any) {
    console.error('Error updating space:', error);
    return NextResponse.json({ error: error.message || 'Failed to update workspace' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
  }

  try {
    await prisma.space.delete({
      where: { SpaceId: id },
    });

    return NextResponse.json({ success: true, message: 'Workspace deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting space:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete workspace' }, { status: 500 });
  }
}
