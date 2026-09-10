import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get('repoId');
  const path = searchParams.get('path');

  if (!repoId || !path) {
    return NextResponse.json({ error: 'repoId and path are required' }, { status: 400 });
  }

  try {
    const repo = await prisma.repo.findUnique({
      where: { RepoID: repoId }
    });

    if (!repo) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const ghHeaders: any = {
      Accept: 'application/vnd.github.v3.raw', // Request raw file content
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (repo.IsPrivate && (repo as any).PAT) {
      ghHeaders['Authorization'] = `Bearer ${(repo as any).PAT}`;
    }

    const fileRes = await fetch(`https://api.github.com/repos/${repo.GHOwner}/${repo.GHName}/contents/${path}`, {
      headers: ghHeaders
    });

    if (!fileRes.ok) {
      const errData = await fileRes.text();
      console.error('GitHub API Error:', errData);
      return NextResponse.json({ error: 'Failed to fetch file from GitHub' }, { status: fileRes.status });
    }

    const content = await fileRes.text();
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('Error fetching file content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
