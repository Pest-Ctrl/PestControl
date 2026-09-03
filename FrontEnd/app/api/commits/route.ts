import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Returns commits for a repo along with linked issues (for Gitline)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get('repoId');

  if (!repoId) {
    // Return commits from the first repo
    const firstRepo = await prisma.repo.findFirst();
    if (!firstRepo) return NextResponse.json([]);

    const commits = await prisma.commit.findMany({
      where: { RepoID: firstRepo.RepoID },
      include: {
        Issues: {
          select: { IssueID: true, Title: true, Status: true, Severity: true, CreatedAt: true },
        },
      },
      orderBy: { CommittedAt: 'desc' },
    });

    return NextResponse.json(commits);
  }

  const commits = await prisma.commit.findMany({
    where: { RepoID: repoId },
    include: {
      Issues: {
        select: { IssueID: true, Title: true, Status: true, Severity: true, CreatedAt: true },
      },
    },
    orderBy: { CommittedAt: 'desc' },
  });

  return NextResponse.json(commits);
}
