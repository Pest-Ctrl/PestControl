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
  const spaceId = searchParams.get('spaceId');

  let targetRepoIds: string[] = [];

  if (repoId) {
    targetRepoIds = [repoId];
  } else if (spaceId) {
    const repos = await prisma.repo.findMany({ where: { SpaceID: spaceId }, select: { RepoID: true } });
    targetRepoIds = repos.map((r: any) => r.RepoID || r.RepoId || r.repoId).filter(Boolean);
    if (targetRepoIds.length === 0) return NextResponse.json([]);
  } else {
    // Return commits from all repositories when no specific repo or space is filtered
    const allRepos = await prisma.repo.findMany();
    targetRepoIds = (allRepos || []).map((r: any) => r.RepoID || r.RepoId || r.repoId).filter(Boolean);
    if (targetRepoIds.length === 0) return NextResponse.json([]);
  }

  const commits = await prisma.commit.findMany({
    where: { RepoID: { in: targetRepoIds } },
    include: {
      Issues: {
        select: { IssueID: true, Title: true, Status: true, Severity: true, CreatedAt: true },
      },
    },
    orderBy: { CommittedAt: 'desc' },
  });

  const safeCommits = (Array.isArray(commits) ? commits : []).map((c: any) => ({
    ...c,
    Issues: Array.isArray(c.Issues) ? c.Issues : (Array.isArray(c.issues) ? c.issues : [])
  }));

  return NextResponse.json(safeCommits);
}
