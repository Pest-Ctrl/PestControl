import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { repoId } = await request.json();
    if (!repoId) {
      return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
    }

    const repo = await prisma.repo.findUnique({
      where: { RepoID: repoId },
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const user = await prisma.users.findUnique({
      where: { Email: session.user.email! },
    });

    // Obtain token from user's GHOAuth or session
    const token = user?.GHOAuth || (session as any).githubToken;

    const ghHeaders: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (token) {
      ghHeaders.Authorization = `Bearer ${token}`;
    }

    const owner = repo.GHOwner || repo.ghOwner;
    const name = repo.GHName || repo.ghName;

    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${name}/commits?per_page=30`, {
      headers: ghHeaders,
    });

    if (!ghRes.ok) {
      const errData = await ghRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.message || `Failed to fetch commits from GitHub (${ghRes.status})` },
        { status: ghRes.status }
      );
    }

    const ghCommits: any[] = await ghRes.json();
    if (!Array.isArray(ghCommits)) {
      return NextResponse.json({ error: 'Invalid response from GitHub commits API' }, { status: 502 });
    }

    // Fetch existing commits from DB to avoid duplication
    const existingCommits = await prisma.commit.findMany({
      where: { RepoID: repoId },
    });
    const existingShaSet = new Set(
      existingCommits.map((c: any) => c.CommitID || c.commitId || c.SHA || c.sha)
    );

    const newCommitsToSave = ghCommits.filter(
      (c: any) => !existingShaSet.has(c.sha)
    );

    if (newCommitsToSave.length > 0) {
      const mapped = newCommitsToSave.map((c: any) => ({
        CommitID: c.sha,
        RepoID: repoId,
        Message: c.commit?.message || 'No commit message',
        AuthorName: c.commit?.author?.name || c.author?.login || 'Unknown',
        AuthorEmail: c.commit?.author?.email || 'noreply@github.com',
        CommittedAt: c.commit?.author?.date || new Date().toISOString(),
        URL: c.html_url || `https://github.com/${owner}/${name}/commit/${c.sha}`,
      }));

      await prisma.commit.createMany({ data: mapped });
    }

    return NextResponse.json({
      success: true,
      message: `Sync complete: ${newCommitsToSave.length} new commit(s) indexed out of ${ghCommits.length} checked.`,
      newCommitsCount: newCommitsToSave.length,
      totalFetched: ghCommits.length,
      existingCount: existingCommits.length,
    });
  } catch (error: any) {
    console.error('Error syncing commits:', error);
    return NextResponse.json({ error: error.message || 'Internal server error while syncing commits' }, { status: 500 });
  }
}
