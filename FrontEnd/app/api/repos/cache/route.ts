import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let repoId = searchParams.get('repoId');

    if (!repoId) {
      try {
        const body = await request.json();
        repoId = body.repoId;
      } catch {
        // Ignored if body is empty
      }
    }

    if (!repoId) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    await prisma.commit.deleteMany({
      where: { RepoID: repoId },
    });

    return NextResponse.json({
      success: true,
      message: 'Commit history and repository cache cleared successfully.',
    });
  } catch (error: any) {
    console.error('Error clearing repo cache:', error);
    return NextResponse.json({ error: error.message || 'Failed to clear commit history' }, { status: 500 });
  }
}
