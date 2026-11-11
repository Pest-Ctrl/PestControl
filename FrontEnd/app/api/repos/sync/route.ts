import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { fetchAllRepoCommits } from '@/lib/github';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { repoId, spaceId } = body;

    const user = await prisma.users.findUnique({
      where: { Email: session.user.email! },
    });
    const token = user?.GHOAuth || (session as any).githubToken;

    let targetRepos: any[] = [];
    if (repoId) {
      const repo = await prisma.repo.findUnique({ where: { RepoID: repoId } });
      if (!repo) {
        return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
      }
      targetRepos = [repo];
    } else if (spaceId) {
      targetRepos = await prisma.repo.findMany({ where: { SpaceID: spaceId } });
    } else {
      targetRepos = await prisma.repo.findMany();
    }

    if (targetRepos.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No imported repositories found to sync.',
        newCommitsCount: 0,
        totalFetched: 0,
      });
    }

    let totalNewSaved = 0;
    let totalFetched = 0;
    let totalExisting = 0;
    const errors: string[] = [];

    for (const repo of targetRepos) {
      const rid = repo.RepoID || repo.RepoId || repo.repoId;
      const owner = repo.GHOwner || repo.ghOwner;
      const name = repo.GHName || repo.ghName;
      const defaultBranch = repo.DefaultBranch || repo.defaultBranch || 'main';

      const { commits: ghCommits, error } = await fetchAllRepoCommits(
        owner,
        name,
        rid,
        token,
        defaultBranch
      );

      if (error && ghCommits.length === 0) {
        errors.push(`${owner}/${name}: ${error}`);
        continue;
      }

      totalFetched += ghCommits.length;

      const existingCommits = await prisma.commit.findMany({ where: { RepoID: rid } });
      totalExisting += existingCommits.length;

      const existingShaSet = new Set(
        existingCommits.map((c: any) => c.CommitID || c.commitId || c.SHA || c.sha)
      );

      const newCommitsToSave = ghCommits.filter((c) => !existingShaSet.has(c.CommitID));

      if (newCommitsToSave.length > 0) {
        await prisma.commit.createMany({ data: newCommitsToSave });
        totalNewSaved += newCommitsToSave.length;
      }
    }

    if (errors.length > 0 && totalFetched === 0) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: `Sync complete: ${totalNewSaved} new commit(s) indexed across ${targetRepos.length} repo(s) (${totalFetched} total commits verified).`,
      newCommitsCount: totalNewSaved,
      totalFetched,
      existingCount: totalExisting,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error syncing commits:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while syncing commits' },
      { status: 500 }
    );
  }
}
